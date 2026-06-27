import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { FileText, Hash, MessageSquare, Upload, ChevronRight, TrendingUp } from 'lucide-react';
import { dashboardAPI } from '../services/api.js';

function StatCard({ icon: Icon, label, value, loading, color }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
      {loading ? (
        <div className="space-y-1.5">
          <div className="h-7 w-10 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-3 w-14 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : (
        <div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none">{value ?? 0}</p>
          <p className="text-xs font-medium text-gray-500 mt-1.5">{label}</p>
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, linkTo, linkLabel, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {linkTo && (
          <Link to={linkTo} className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
            {linkLabel} <ChevronRight size={13} />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SkeletonRow() {
  return (
    <div className="px-5 py-3.5 flex gap-3 items-center">
      <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
      <div className="w-20 h-4 bg-gray-100 rounded animate-pulse flex-shrink-0" />
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardAPI.stats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Your document activity at a glance</p>
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatCard icon={FileText} label="Documents" value={stats?.totalDocuments} loading={loading} color="bg-blue-500" />
          <StatCard icon={TrendingUp} label="Chunks" value={stats?.totalChunks} loading={loading} color="bg-violet-500" />
          <StatCard icon={MessageSquare} label="Chats" value={stats?.totalQuestions} loading={loading} color="bg-emerald-500" />
        </div>

        {/* Recent docs */}
        <SectionCard title="Recent Documents" linkTo="/documents" linkLabel="View all">
          {loading ? (
            <div className="divide-y divide-gray-100">
              <SkeletonRow /><SkeletonRow /><SkeletonRow />
            </div>
          ) : !stats?.recentDocuments?.length ? (
            <div className="px-5 py-10 text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileText size={18} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">No documents yet</p>
              <p className="text-xs text-gray-400 mb-3">Upload your first .docx to get started</p>
              <Link to="/upload"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition">
                <Upload size={12} /> Upload Document
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {stats.recentDocuments.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={13} className="text-blue-500" />
                  </div>
                  <span className="flex-1 text-sm text-gray-800 truncate min-w-0">{doc.fileName}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{formatDate(doc.uploadedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Recent chats */}
        <SectionCard title="Recent Conversations" linkTo="/chat" linkLabel="Open chat">
          {loading ? (
            <div className="divide-y divide-gray-100">
              {[1, 2, 3].map(i => (
                <div key={i} className="px-5 py-3.5 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : !stats?.recentChats?.length ? (
            <div className="px-5 py-10 text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare size={18} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">No conversations yet</p>
              <p className="text-xs text-gray-400 mb-3">Chat with a document to see your history here</p>
              <Link to="/chat"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition">
                <MessageSquare size={12} /> Start chatting
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {stats.recentChats.map(chat => (
                <div key={chat.id} className="px-5 py-3.5">
                  <p className="text-xs font-semibold text-gray-800 truncate mb-1">{chat.question}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{chat.answer}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

      </div>
    </div>
  );
}
