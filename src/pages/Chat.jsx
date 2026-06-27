import { useState, useEffect, useRef } from 'react';
import { useSearch } from 'wouter';
import {
  Send, Bot, User, Loader2, FileText,
  AlertCircle, ChevronDown, Copy, Check,
} from 'lucide-react';
import { docsAPI, chatAPI } from '../services/api.js';

function formatTime(d) {
  return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={copy}
      title="Copy response"
      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all ${
        copied
          ? 'text-green-600 bg-green-50'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
      }`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center py-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.18}s`, animationDuration: '0.9s' }}
        />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  if (isUser) {
    return (
      <div className="flex justify-end px-4 sm:px-6 md:px-8">
        <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[65%]">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed">
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 text-right pr-1">{formatTime(msg.createdAt)}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="px-4 sm:px-6 md:px-8">
      <div className="max-w-3xl mx-auto md:mx-0">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
            <Bot size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-800 leading-relaxed">
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
            </div>
            <div className="flex items-center gap-2 mt-2.5">
              <CopyButton text={msg.content} />
              <span className="text-[10px] text-gray-400">{formatTime(msg.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AITyping() {
  return (
    <div className="px-4 sm:px-6 md:px-8">
      <div className="max-w-3xl mx-auto md:mx-0">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
            <Bot size={14} className="text-white" />
          </div>
          <div className="pt-1">
            <TypingIndicator />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const initialDocId = params.get('doc') || '';

  const [docs, setDocs] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(initialDocId);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [docsLoading, setDocsLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const activeDocRef = useRef(selectedDocId);

  useEffect(() => {
    docsAPI.list({ limit: 100 }).then((data) => {
      setDocs(data.documents);
      if (!initialDocId && data.documents.length > 0) {
        setSelectedDocId(data.documents[0].id);
      }
    }).finally(() => setDocsLoading(false));
  }, []);

  useEffect(() => {
    activeDocRef.current = selectedDocId;
    setSending(false);
    setError('');
    setMessages([]);
    if (!selectedDocId) return;

    setHistoryLoading(true);
    chatAPI.history(selectedDocId).then((history) => {
      if (activeDocRef.current !== selectedDocId) return;
      setMessages(
        history.flatMap(h => ([
          { id: h.id + '_q', role: 'user', content: h.question, createdAt: h.createdAt },
          { id: h.id + '_a', role: 'ai', content: h.answer, createdAt: h.createdAt },
        ]))
      );
    }).catch(() => {}).finally(() => {
      if (activeDocRef.current === selectedDocId) setHistoryLoading(false);
    });
  }, [selectedDocId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }

  async function handleSend(e) {
    e?.preventDefault();
    const q = input.trim();
    if (!q || !selectedDocId || sending) return;

    const docIdForThisRequest = selectedDocId;
    setInput('');
    setError('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const userMsg = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: q,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const data = await chatAPI.send({ documentId: docIdForThisRequest, question: q });
      if (activeDocRef.current !== docIdForThisRequest) return;
      setMessages(prev => [
        ...prev,
        { id: data.id, role: 'ai', content: data.answer, createdAt: data.createdAt },
      ]);
    } catch (err) {
      if (activeDocRef.current !== docIdForThisRequest) return;
      setError(err.message);
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      setInput(q);
    } finally {
      if (activeDocRef.current === docIdForThisRequest) setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const selectedDoc = docs.find(d => d.id === selectedDocId);

  function selectDoc(id) {
    setSelectedDocId(id);
    setMobileMenuOpen(false);
  }

  return (
    <div className="flex flex-col min-h-0 bg-white" style={{ height: '100%' }}>

      {/* ── MOBILE: Document picker ── */}
      <div className="md:hidden relative flex-shrink-0 bg-white border-b border-gray-100 px-4 py-2.5 z-20">
        <button
          onClick={() => setMobileMenuOpen(v => !v)}
          className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={13} className="text-gray-400 flex-shrink-0" />
            <span className="truncate font-medium text-gray-800 text-sm">
              {docsLoading ? 'Loading…' : selectedDoc ? selectedDoc.fileName : 'Select a document'}
            </span>
          </div>
          <ChevronDown
            size={14}
            className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {mobileMenuOpen && (
          <div className="absolute left-4 right-4 top-[calc(100%-4px)] bg-white border border-gray-200 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto">
            {docs.length === 0 ? (
              <div className="px-4 py-5 text-center text-sm text-gray-400">No documents yet</div>
            ) : docs.map(doc => (
              <button
                key={doc.id}
                onClick={() => selectDoc(doc.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-left text-sm transition-colors border-b border-gray-50 last:border-0 ${
                  selectedDocId === doc.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FileText size={13} className="flex-shrink-0 opacity-60" />
                <span className="truncate">{doc.fileName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Main body: sidebar + chat ── */}
      <div className="flex flex-1 min-h-0">

        {/* DESKTOP: Document sidebar */}
        <div className="hidden md:flex w-56 flex-shrink-0 flex-col border-r border-gray-100 bg-gray-50">
          <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Documents</p>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {docsLoading ? (
              <div className="px-3 py-2 space-y-1.5">
                {[1, 2, 3].map(i => <div key={i} className="h-9 bg-gray-200 rounded-lg animate-pulse" />)}
              </div>
            ) : docs.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <FileText size={20} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs text-gray-400">No documents yet</p>
              </div>
            ) : docs.map(doc => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`w-full text-left px-3 py-2.5 mx-1 rounded-lg flex items-start gap-2 transition-all text-xs font-medium leading-snug ${
                  selectedDocId === doc.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
                style={{ width: 'calc(100% - 8px)' }}
              >
                <FileText size={12} className={`flex-shrink-0 mt-0.5 ${selectedDocId === doc.id ? 'text-white/60' : 'text-gray-400'}`} />
                <span className="line-clamp-2">{doc.fileName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div
          className="flex-1 flex flex-col min-h-0 min-w-0"
          onClick={() => mobileMenuOpen && setMobileMenuOpen(false)}
        >
          {/* Desktop doc header */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0 px-6 py-3.5 border-b border-gray-100 bg-white">
            {selectedDoc ? (
              <>
                <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={13} className="text-gray-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{selectedDoc.fileName}</p>
                  <p className="text-xs text-gray-400">{selectedDoc.totalChunks} chunks indexed</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">Select a document to start chatting</p>
            )}
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto py-6 space-y-6 scroll-smooth">
            {!selectedDocId ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6 pb-10">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <Bot size={26} className="text-gray-400" />
                </div>
                <p className="text-base font-semibold text-gray-700">Chat with your documents</p>
                <p className="text-sm text-gray-400 mt-1.5 max-w-xs">
                  {docs.length === 0
                    ? 'Upload a .docx file first, then ask anything about it'
                    : 'Select a document above to start a conversation'}
                </p>
              </div>
            ) : historyLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={22} className="animate-spin text-gray-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6 pb-10">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <Bot size={26} className="text-gray-400" />
                </div>
                <p className="text-base font-semibold text-gray-700">
                  Ask anything about "{selectedDoc?.fileName}"
                </p>
                <p className="text-sm text-gray-400 mt-1.5 max-w-xs">
                  The AI will answer using only the content of this document
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={msg.id}>
                    <Message msg={msg} />
                    {/* Divider between pairs (optional subtle spacing) */}
                    {i < messages.length - 1 && msg.role === 'ai' && (
                      <div className="my-2" />
                    )}
                  </div>
                ))}
                {sending && <AITyping />}
                {error && (
                  <div className="px-4 sm:px-6 md:px-8">
                    <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 max-w-xl">
                      <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                      <span className="break-words">{error}</span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── Input bar ── */}
          <div className="flex-shrink-0 border-t border-gray-100 bg-white px-3 sm:px-6 pt-3 pb-3 md:pb-4">
            <div className="max-w-3xl mx-auto">
              <div className={`flex items-end gap-2 border rounded-2xl bg-gray-50 px-3 py-2.5 transition-all ${
                selectedDocId ? 'border-gray-300 focus-within:border-gray-900 focus-within:bg-white' : 'border-gray-200'
              }`}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => { setInput(e.target.value); autoResize(); }}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedDocId ? 'Ask a question about this document…' : 'Select a document first'}
                  disabled={!selectedDocId || sending}
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none disabled:opacity-50 min-w-0 py-0.5"
                  style={{ maxHeight: '160px', overflowY: 'auto', lineHeight: '1.5' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || !selectedDocId || sending}
                  className="flex-shrink-0 w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center text-white hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {sending
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Send size={14} />
                  }
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                <span className="hidden sm:inline">Enter to send · Shift+Enter for new line · </span>
                AI answers from document content only
              </p>
            </div>
            {/* Mobile bottom nav spacer */}
            <div className="h-16 md:hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}
