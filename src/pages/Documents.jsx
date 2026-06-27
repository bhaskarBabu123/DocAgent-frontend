import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  FileText, Search, Trash2, MessageSquare,
  ChevronLeft, ChevronRight, Loader2, AlertCircle, X, Upload,
} from 'lucide-react';
import { docsAPI } from '../services/api.js';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function Documents() {
  const [, setLocation] = useLocation();
  const [docs, setDocs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const limit = 10;

  const loadDocs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await docsAPI.list({ search, page, limit });
      setDocs(data.documents);
      setTotal(data.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  function handleSearch(e) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function clearSearch() {
    setSearch('');
    setSearchInput('');
    setPage(1);
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await docsAPI.delete(id);
      loadDocs();
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting(null);
    }
  }

  const totalPages = Math.ceil(total / limit);
  const start = ((page - 1) * limit) + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Documents</h1>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? 'Loading…' : `${total} document${total !== 1 ? 's' : ''} uploaded`}
            </p>
          </div>
          <button
            onClick={() => setLocation('/upload')}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition flex-shrink-0"
          >
            <Upload size={13} /> Upload
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            <AlertCircle size={15} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by filename…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition bg-white"
            />
          </div>
          <button type="submit"
            className="px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-black transition whitespace-nowrap">
            Search
          </button>
          {search && (
            <button type="button" onClick={clearSearch}
              className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition">
              <X size={15} />
            </button>
          )}
        </form>

        {/* Doc list */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

          {/* Mobile card list */}
          <div className="sm:hidden">
            {loading ? (
              <div className="divide-y divide-gray-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-gray-100 rounded-lg animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : docs.length === 0 ? (
              <div className="py-14 px-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FileText size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  {search ? 'No results found' : 'No documents yet'}
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  {search ? `Nothing matched "${search}"` : 'Upload your first .docx to get started'}
                </p>
                {!search && (
                  <button onClick={() => setLocation('/upload')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition">
                    <Upload size={12} /> Upload Document
                  </button>
                )}
              </div>
            ) : docs.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(doc.uploadedAt)} · {doc.totalChunks} chunks
                    {doc.fileSize ? ` · ${formatSize(doc.fileSize)}` : ''}
                  </p>
                </div>
                <div className="flex gap-0.5 flex-shrink-0">
                  <button onClick={() => setLocation(`/chat?doc=${doc.id}`)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Chat">
                    <MessageSquare size={16} />
                  </button>
                  <button onClick={() => handleDelete(doc.id, doc.fileName)}
                    disabled={deleting === doc.id}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-40" title="Delete">
                    {deleting === doc.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Document</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Uploaded</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Chunks</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded-lg animate-pulse w-48" /></td>
                      <td className="px-5 py-4 hidden md:table-cell"><div className="h-4 bg-gray-100 rounded-lg animate-pulse w-24" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded-lg animate-pulse w-10" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded-lg animate-pulse w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : docs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-14 px-5 text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <FileText size={20} className="text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">
                        {search ? 'No results found' : 'No documents yet'}
                      </p>
                      <p className="text-xs text-gray-400 mb-4">
                        {search ? `Nothing matched "${search}"` : 'Upload your first .docx to get started'}
                      </p>
                      {!search && (
                        <button onClick={() => setLocation('/upload')}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition">
                          <Upload size={12} /> Upload Document
                        </button>
                      )}
                    </td>
                  </tr>
                ) : docs.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText size={14} className="text-blue-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-800 truncate max-w-[200px] lg:max-w-xs">{doc.fileName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap hidden md:table-cell">{formatDate(doc.uploadedAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                        {doc.totalChunks}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setLocation(`/chat?doc=${doc.id}`)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Chat with this document">
                          <MessageSquare size={15} />
                        </button>
                        <button onClick={() => handleDelete(doc.id, doc.fileName)}
                          disabled={deleting === doc.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-40" title="Delete">
                          {deleting === doc.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/30">
              <p className="text-xs text-gray-500">{start}–{end} of {total}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition">
                  <ChevronLeft size={15} />
                </button>
                <span className="text-xs font-medium text-gray-600 px-2">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
