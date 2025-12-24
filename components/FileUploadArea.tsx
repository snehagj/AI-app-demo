
import React, { useCallback, useState } from 'react';
import type { CaseFile } from '../types';
import { fileToBase64, getFileType } from '../utils/fileUtils';
import { PlusIcon } from './icons/PlusIcon';
import { FileIcon, ImageIcon, AudioIcon, VideoIcon } from './icons/FileIcons';
import { TrashIcon } from './icons/TrashIcon';


interface FileUploadAreaProps {
  files: CaseFile[];
  onAddFiles: (files: CaseFile[]) => void;
  onRemoveFile: (fileName: string) => void;
}

const FileIconMap = {
  image: <ImageIcon className="w-6 h-6 text-blue-500" />,
  audio: <AudioIcon className="w-6 h-6 text-blue-500" />,
  pdf: <FileIcon className="w-6 h-6 text-blue-500" />,
  video: <VideoIcon className="w-6 h-6 text-slate-400" />,
  other: <FileIcon className="w-6 h-6 text-blue-500" />,
};

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({ files, onAddFiles, onRemoveFile }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFilesPromises = Array.from(selectedFiles).map(async (file) => {
      const base64Content = await fileToBase64(file);
      const dataUrl = URL.createObjectURL(file);
      const fileType = getFileType(file.type);
      return {
        name: file.name,
        type: fileType,
        mimeType: file.type,
        size: file.size,
        dataUrl,
        base64Content,
      };
    });

    const newFiles = await Promise.all(newFilesPromises);
    onAddFiles(newFiles);
  };
  
  const onDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      <h3 className="font-semibold mb-2 text-slate-600">Case Documents</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map(file => (
          <div key={file.name} className="group relative bg-slate-50 p-3 rounded-lg flex items-center gap-3 border border-slate-200 overflow-hidden">
            <div className="flex-shrink-0">
                {FileIconMap[file.type]}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => onRemoveFile(file.name)} className="absolute top-1 right-1 p-1 rounded-full bg-white text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 transition-opacity">
                <TrashIcon className="w-4 h-4"/>
            </button>
          </div>
        ))}
        
        <label 
          className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
          onDragEnter={onDragEnter}
          onDragOver={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <PlusIcon className="w-8 h-8 text-slate-400" />
          <span className="mt-2 text-sm text-slate-500 text-center">Add Documents</span>
          <input type="file" multiple className="hidden" onChange={(e) => handleFileChange(e.target.files)} />
        </label>
      </div>
      <p className="text-xs text-slate-400 mt-3">Supported: PDF, Images, Audio. Video support coming soon.</p>
    </div>
  );
};
