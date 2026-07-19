import { useState, useRef } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';
import clsx from 'clsx';

const FileUpload = ({
  accept = 'image/*', maxSize = 10, onFileSelect, label, hint, multiple = false, className = '',
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File too large. Maximum size: ${maxSize}MB`);
      return;
    }
    setFileName(file.name);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    onFileSelect(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const clear = () => { setPreview(null); setFileName(''); onFileSelect(null); };

  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}

      {!fileName ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current.click()}
          className={clsx(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
            dragOver
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-secondary-200 dark:border-secondary-600 hover:border-primary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700/50'
          )}
        >
          <Upload className="w-8 h-8 text-secondary-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Click or drag file here</p>
          <p className="text-xs text-secondary-400 mt-1">Max {maxSize}MB</p>
          <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden"
            onChange={(e) => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl border border-secondary-200 dark:border-secondary-600">
          {preview ? (
            <img src={preview} alt="preview" className="w-12 h-12 object-cover rounded-lg" />
          ) : (
            <FileText className="w-10 h-10 text-secondary-400 flex-shrink-0" />
          )}
          <span className="text-sm text-secondary-700 dark:text-secondary-300 flex-1 truncate">{fileName}</span>
          <button onClick={clear} className="text-secondary-400 hover:text-red-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {hint && <p className="mt-1.5 text-xs text-secondary-400">{hint}</p>}
    </div>
  );
};

export default FileUpload;
