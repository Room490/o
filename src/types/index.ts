export interface ProcessedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  data?: ArrayBuffer;
}

export interface PDFPage {
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
}

export interface SplitRange {
  start: number;
  end: number;
  name: string;
}

export interface ImagePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export type ToolType = 
  | 'image-to-pdf'
  | 'pdf-to-image' 
  | 'pdf-to-text'
  | 'text-to-pdf'
  | 'split-pdf'
  | 'compress-pdf'
  | 'add-image'
  | 'preview-pdf';

export interface Tool {
  id: ToolType;
  name: string;
  description: string;
  icon: string;
  color: string;
}