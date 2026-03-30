import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Loader2, Target, Sparkles } from 'lucide-react';
import type { UploadPanelProps } from '../types';

const UploadPanel: React.FC<UploadPanelProps> = ({ onAnalyze, isAnalyzing }) => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert('Please upload a resume PDF.');
      return;
    }
    if (!jobDescription.trim()) {
      alert('Please enter a job description.');
      return;
    }
    await onAnalyze(file, jobDescription);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isFormValid = file && jobDescription.trim().length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* PDF Upload Section */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-slate-300 mb-3 ml-1 flex items-center gap-2">
          <FileText size={16} className="text-primary-400" />
          Your Resume
        </label>
        
        <div
          className={`flex-1 relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[240px] ${
            dragActive
              ? 'border-primary-500 bg-primary-500/10'
              : file
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-white/10 bg-dark-800/50 hover:border-primary-500/50 hover:bg-dark-800'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={isAnalyzing}
          />

          {file ? (
            <div className="space-y-4 flex flex-col items-center relative z-20">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <FileText size={32} className="text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-200">{file.name}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); handleRemoveFile(); }}
                disabled={isAnalyzing}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={16} className="mr-2" />
                Remove File
              </button>
            </div>
          ) : (
            <div className="space-y-4 flex flex-col items-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-dark-700/50 flex items-center justify-center border border-white/5">
                <UploadCloud size={32} className={dragActive ? "text-primary-400" : "text-slate-400"} />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-200 text-lg">
                  {dragActive ? 'Drop PDF here' : 'Drag & drop your resume'}
                </p>
                <p className="text-sm text-slate-500 mt-2">or click to browse</p>
              </div>
              <p className="text-xs text-slate-600 bg-dark-900/50 py-1 px-3 rounded-full">PDF files only (Max 10MB)</p>
            </div>
          )}
        </div>
      </div>

      {/* Job Description Section */}
      <div className="flex flex-col">
        <label htmlFor="jobDescription" className="block text-sm font-medium text-slate-300 mb-3 ml-1 flex items-center gap-2">
          <Target size={16} className="text-violet-400" />
          Target Job Description
        </label>
        <div className="relative flex-1 flex flex-col">
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={isAnalyzing}
            placeholder="Paste the full job description here..."
            className="flex-1 min-h-[240px] p-5 bg-dark-800/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-300 resize-none text-slate-200 placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm leading-relaxed"
          />
          <div className="absolute bottom-4 right-4 text-xs font-medium text-slate-500 bg-dark-900/80 px-2 py-1 rounded-md backdrop-blur-sm">
            {jobDescription.length} characters
          </div>
        </div>
      </div>

      {/* Analyze Button */}
      <div className="lg:col-span-2 pt-4 border-t border-white/5 mt-2">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!isFormValid || isAnalyzing}
          className="w-full relative group overflow-hidden py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
        >
          <div className={`absolute inset-0 transition-opacity ${isFormValid ? 'bg-indigo-600 group-hover:bg-indigo-500' : 'bg-neutral-800'}`}></div>
          


          {/* Button Content */}
          <div className="relative flex items-center justify-center text-white">
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin mr-3" size={20} />
                Analyzing Match...
              </>
            ) : (
              <>
                <Sparkles size={20} className="mr-2 text-white/80" />
                Analyze Match
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default UploadPanel;
