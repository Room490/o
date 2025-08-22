import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { ProcessedFile, PDFPage, SplitRange, ImagePosition } from '../types';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export class PDFProcessor {
  // Convert images to PDF
  static async imagesToPDF(images: File[]): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    
    for (const image of images) {
      const imageBytes = await image.arrayBuffer();
      let embeddedImage;
      
      if (image.type === 'image/jpeg' || image.type === 'image/jpg') {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      } else if (image.type === 'image/png') {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      } else {
        throw new Error(`Unsupported image format: ${image.type}`);
      }
      
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const imageAspectRatio = embeddedImage.width / embeddedImage.height;
      const pageAspectRatio = width / height;
      
      let imageWidth, imageHeight;
      if (imageAspectRatio > pageAspectRatio) {
        imageWidth = width - 40;
        imageHeight = imageWidth / imageAspectRatio;
      } else {
        imageHeight = height - 40;
        imageWidth = imageHeight * imageAspectRatio;
      }
      
      const x = (width - imageWidth) / 2;
      const y = (height - imageHeight) / 2;
      
      page.drawImage(embeddedImage, {
        x,
        y,
        width: imageWidth,
        height: imageHeight,
      });
    }
    
    return await pdfDoc.save();
  }

  // Convert PDF to images
  static async pdfToImages(pdfFile: File, format: 'png' | 'jpeg' = 'png'): Promise<ProcessedFile[]> {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const images: ProcessedFile[] = [];
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), `image/${format}`, 0.95);
      });
      
      const url = URL.createObjectURL(blob);
      images.push({
        id: `page-${pageNum}`,
        name: `${pdfFile.name.replace('.pdf', '')}_page_${pageNum}.${format}`,
        type: `image/${format}`,
        size: blob.size,
        url,
        data: await blob.arrayBuffer(),
      });
    }
    
    return images;
  }

  // Extract text from PDF
  static async pdfToText(pdfFile: File): Promise<string> {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += `Page ${pageNum}:\n${pageText}\n\n`;
    }
    
    return fullText;
  }

  // Convert text to PDF
  static async textToPDF(text: string, title: string = 'Document'): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const lineHeight = fontSize * 1.2;
    const margin = 50;
    
    const lines = text.split('\n');
    let currentPage = pdfDoc.addPage();
    let { width, height } = currentPage.getSize();
    let yPosition = height - margin;
    
    // Add title
    currentPage.drawText(title, {
      x: margin,
      y: yPosition,
      size: 18,
      font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;
    
    for (const line of lines) {
      if (yPosition < margin + lineHeight) {
        currentPage = pdfDoc.addPage();
        ({ width, height } = currentPage.getSize());
        yPosition = height - margin;
      }
      
      const words = line.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const textWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (textWidth > width - 2 * margin && currentLine) {
          currentPage.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight;
          currentLine = word;
          
          if (yPosition < margin + lineHeight) {
            currentPage = pdfDoc.addPage();
            ({ width, height } = currentPage.getSize());
            yPosition = height - margin;
          }
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) {
        currentPage.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight;
      }
    }
    
    return await pdfDoc.save();
  }

  // Split PDF
  static async splitPDF(pdfFile: File, ranges: SplitRange[]): Promise<ProcessedFile[]> {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const splitPdfs: ProcessedFile[] = [];
    
    for (const range of ranges) {
      const newPdf = await PDFDocument.create();
      const pageIndices = Array.from(
        { length: range.end - range.start + 1 },
        (_, i) => range.start - 1 + i
      );
      
      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      splitPdfs.push({
        id: `split-${range.name}`,
        name: `${range.name}.pdf`,
        type: 'application/pdf',
        size: blob.size,
        url,
        data: pdfBytes,
      });
    }
    
    return splitPdfs;
  }

  // Compress PDF
  static async compressPDF(pdfFile: File): Promise<Uint8Array> {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // Basic compression by removing metadata and optimizing
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('SmartPDF AI');
    pdfDoc.setCreator('SmartPDF AI');
    
    return await pdfDoc.save({
      useObjectStreams: false,
      addDefaultPage: false,
    });
  }

  // Add image to PDF
  static async addImageToPDF(
    pdfFile: File,
    imageFile: File,
    position: ImagePosition
  ): Promise<Uint8Array> {
    const pdfArrayBuffer = await pdfFile.arrayBuffer();
    const imageArrayBuffer = await imageFile.arrayBuffer();
    
    const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
    const pages = pdfDoc.getPages();
    
    if (position.page > pages.length) {
      throw new Error('Page number exceeds PDF page count');
    }
    
    let embeddedImage;
    if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
      embeddedImage = await pdfDoc.embedJpg(imageArrayBuffer);
    } else if (imageFile.type === 'image/png') {
      embeddedImage = await pdfDoc.embedPng(imageArrayBuffer);
    } else {
      throw new Error(`Unsupported image format: ${imageFile.type}`);
    }
    
    const page = pages[position.page - 1];
    page.drawImage(embeddedImage, {
      x: position.x,
      y: position.y,
      width: position.width,
      height: position.height,
    });
    
    return await pdfDoc.save();
  }

  // Get PDF pages for preview
  static async getPDFPages(pdfFile: File): Promise<PDFPage[]> {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: PDFPage[] = [];
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
      
      const imageUrl = canvas.toDataURL();
      pages.push({
        pageNumber: pageNum,
        imageUrl,
        width: viewport.width,
        height: viewport.height,
      });
    }
    
    return pages;
  }

  // Download file
  static downloadFile(data: Uint8Array | string, filename: string, type: string) {
    const blob = new Blob([data], { type });
    saveAs(blob, filename);
  }
}