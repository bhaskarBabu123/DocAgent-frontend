import { useState, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { UploadCloud, FileText, CheckCircle, XCircle, Loader2, X, ArrowRight } from 'lucide-react';
import { docsAPI } from '../services/api.js';

export default function Upload() {
  const [, setLocation] = useLocation();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [uploadedDocId, setUploadedDocId] = useState(null);
  const inputRef = useRef();

  const selectFile = useCallback((f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.docx')) {
      setStatus('error');
      setMessage('Only .docx files are supported');
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setStatus('error');
      setMessage('File size must be under 20 MB');
      return;
    }
    setFile(f);
    setStatus('idle');
    setMessage('');
    setUploadedDocId(null);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    selectFile(e.dataTransfer.files[0]);
  }, [selectFile]);

  async function handleUpload() {
    if (!file) return;
    setStatus('uploading');
    setProgress(10);
    const ticker = setInterval(() => setProgress(p => p < 82 ? p + 9 : p), 500);
    try {
      const data = await docsAPI.upload(file);
      clearInterval(ticker);
      setProgress(100);
      setStatus('success');
      setMessage(`${data.totalChunks} text chunks extracted and indexed`);
      setUploadedDocId(data.documentId || data.id);
      setFile(null);
    } catch (err) {
      clearInterval(ticker);
      setStatus('error');
      setProgress(0);
      setMessage(err.message);
    }
  }

  function reset() {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setMessage('');
    setUploadedDocId(null);
  }

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Upload Document</h1>
          <p className="text-sm text-gray-500 mt-1">Add a Word document to start chatting with it</p>
        </div>

        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => !file && status !== 'uploading' && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl transition-all ${
            dragging
              ? 'border-gray-900 bg-gray-50 scale-[1.01]'
              : file
                ? 'border-gray-200 bg-gray-50 cursor-default'
                : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50 cursor-pointer active:scale-[0.99]'
          }`}
        >
          <input ref={inputRef} type="file" accept=".docx" className="hidden"
            onChange={e => selectFile(e.target.files[0])} />

          <div className="px-6 py-10 sm:py-14 flex flex-col items-center gap-4 text-center">
            {file ? (
              <>
                <div className="w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm">
                  <FileText size={24} className="text-gray-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 break-all px-4">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · Word Document</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); reset(); }}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
                >
                  <X size={12} /> Remove file
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm">
                  <UploadCloud size={24} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    {dragging ? 'Drop it here' : 'Tap to browse or drag & drop'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5">Supports .docx · Maximum 20 MB</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {status === 'uploading' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-700">Processing document…</span>
              <span className="text-gray-400">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">Extracting and chunking text — this may take a few seconds</p>
          </div>
        )}

        {/* Success state */}
        {status === 'success' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-emerald-800">Upload successful!</p>
                <p className="text-sm text-emerald-700 mt-0.5">{message}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={() => setLocation(uploadedDocId ? `/chat?doc=${uploadedDocId}` : '/chat')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition"
              >
                Chat with this document <ArrowRight size={14} />
              </button>
              <button onClick={reset}
                className="px-4 py-2.5 border border-emerald-200 text-sm text-emerald-700 rounded-xl hover:bg-emerald-100 transition">
                Upload another
              </button>
            </div>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-red-700">Upload failed</p>
                <p className="text-sm text-red-600 mt-0.5 break-words">{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload button */}
        {status !== 'success' && (
          <button
            onClick={handleUpload}
            disabled={!file || status === 'uploading'}
            className="w-full py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-2xl hover:bg-black transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {status === 'uploading' && <Loader2 size={16} className="animate-spin" />}
            {status === 'uploading' ? 'Uploading…' : 'Upload Document'}
          </button>
        )}

        {/* Help text */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-700 mb-2">How it works</p>
          <ol className="space-y-1.5 text-xs text-gray-500 list-decimal list-inside">
            <li>Upload a Word (.docx) document</li>
            <li>Text is extracted and split into searchable chunks</li>
            <li>Go to Chat and ask anything about the document</li>
            <li>AI answers using only the document content</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
