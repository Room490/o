import React from 'react';
import { Tool } from '../types';
import * as Icons from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
  onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  const IconComponent = (Icons as any)[tool.icon];

  return (
    <div
      onClick={onClick}
      className="card cursor-pointer group hover:scale-105 transform transition-all duration-200"
    >
      <div className="flex items-start space-x-4">
        <div 
          className={`flex items-center justify-center w-12 h-12 rounded-lg ${tool.color} group-hover:scale-110 transition-transform duration-200`}
        >
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {tool.name}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {tool.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ToolCard;