import React, { useState } from 'react';

const FileUploadComponent = ({ onFilesUploaded, currentUser, existingAttachments = [] }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
    e.target.value = ''; // Reset input
  };

  const processFiles = (files) => {
    files.forEach((file) => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File "' + file.name + '" is too large. Maximum size is 10MB.');
        return;
      }

      // Validate file type
      if (!isValidFileType(file)) {
        alert('File "' + file.name + '" type is not supported.');
        return;
      }

      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
        }
      };

      reader.onload = (e) => {
        const fileData = {
          file_name: file.name,
          file_url: e.target.result, // Base64 data URL
          file_type: getFileTypeFromFile(file),
          uploaded_by: currentUser.name,
          file_size: file.size,
          original_file: true,
          mime_type: file.type
        };

        onFilesUploaded([fileData]);
        
        // Remove from progress tracking
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      };
      
      reader.readAsDataURL(file);
    });
  };

  const isValidFileType = (file) => {
    const validTypes = [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      // Audio
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac',
      // Video
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/quicktime',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];
    
    return validTypes.includes(file.type) || file.name.match(/\.(jpe?g|png|gif|webp|mp3|wav|ogg|aac|mp4|avi|mov|wmv|pdf|docx?|xlsx?|pptx?|txt)$/i);
  };

  const getFileTypeFromFile = (file) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type === 'application/pdf') return 'pdf';
    if (
      file.type.includes('word') || 
      file.type.includes('excel') || 
      file.type.includes('powerpoint') ||
      file.type.includes('spreadsheet') ||
      file.name.match(/\.(docx?|xlsx?|pptx?)$/i)
    ) return 'document';
    return 'document';
  };

  const getFileIcon = (fileType) => {
    const icons = {
      image: '🖼️',
      audio: '🎵',
      video: '🎬',
      document: '📄',
      pdf: '📕',
      link: '🔗'
    };
    return icons[fileType] || '📎';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      {/* Drag & Drop Zone */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 mb-4 transition-all ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50 scale-105' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">
            {isDragOver ? '📤' : '📁'}
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {isDragOver ? 'Drop files here!' : 'Upload Files from Your Device'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Drag & drop files here or click to browse<br/>
            <span className="text-xs font-medium text-blue-600">
              📱 Images • 🎵 Audio • 🎬 Video • 📄 Documents • 📕 PDFs (Max 10MB each)
            </span>
          </p>
          
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            />
            <span className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition shadow-lg transform hover:scale-105">
              🗂️ Browse Files from Device
            </span>
          </label>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mb-4 space-y-2">
          <h4 className="font-medium text-gray-700">Uploading Files...</h4>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">{fileName}</span>
                <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Preview */}
      {existingAttachments.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">📎 Attached Files ({existingAttachments.length})</h4>
          {existingAttachments.map((file, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
              <div className="flex items-start gap-4">
                {/* File Preview */}
                <div className="flex-shrink-0">
                  {file.file_type === 'image' && file.file_url.startsWith('data:') ? (
                    <img 
                      src={file.file_url} 
                      alt={file.file_name}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                      {getFileIcon(file.file_type)}
                    </div>
                  )}
                </div>
                
                {/* File Info */}
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800 mb-1">{file.file_name}</h5>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span className="capitalize font-medium">{file.file_type}</span>
                    {file.file_size && (
                      <span>📊 {formatFileSize(file.file_size)}</span>
                    )}
                    {file.original_file ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">📱 Uploaded</span>
                    ) : (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">🔗 Link</span>
                    )}
                  </div>
                  {file.file_url && !file.file_url.startsWith('data:') && (
                    <a 
                      href={file.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      🔗 View Original
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;\n