import React, { useCallback } from 'react';
import { Upload, FileText, Image as ImageIcon } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        onFileSelect(file);
      } else {
        alert("Please upload an image file (JPG, PNG) or PDF.");
      }
    }
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full max-w-xl mx-auto"
    >
      <label 
        htmlFor="file-upload" 
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-indigo-300 rounded-2xl cursor-pointer bg-white hover:bg-indigo-50 transition-colors duration-300 shadow-sm group"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <div className="p-4 bg-indigo-100 rounded-full mb-4 group-hover:bg-indigo-200 transition-colors">
            <Upload className="w-10 h-10 text-indigo-600" />
          </div>
          <p className="mb-2 text-lg text-gray-700 font-medium">Click to upload or drag & drop</p>
          <p className="text-sm text-gray-500 text-center px-8">
            Upload an image or PDF of your Invoice, Lorry Receipt (LR), or E-Way Bill.
          </p>
          <div className="flex gap-4 mt-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><ImageIcon size={14} /> JPG/PNG</span>
            <span className="flex items-center gap-1"><FileText size={14} /> PDF</span>
          </div>
        </div>
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          accept="image/*,application/pdf"
          onChange={handleFileInput}
        />
      </label>
    </div>
  );
};