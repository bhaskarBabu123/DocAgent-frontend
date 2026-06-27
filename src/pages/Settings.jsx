import { useAuth } from '../hooks/useAuth.js';
import { User, Mail, Calendar, Shield, LogOut, Bot } from 'lucide-react';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3.5 py-3.5 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-gray-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-gray-900 font-medium truncate">{value || '—'}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function Settings() {
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    window.location.href = '/login';
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account</p>
        </div>

        {/* Profile hero */}
        <div className="bg-gray-900 rounded-2xl p-5 sm:p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg font-bold">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-base truncate">{user?.name}</p>
            <p className="text-white/60 text-sm truncate mt-0.5">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-white/10 border border-white/20 rounded-full text-[10px] font-medium text-white/80">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Active
            </span>
          </div>
        </div>

        {/* Account details */}
        <SectionCard title="Account Details" subtitle="Your profile information">
          <InfoRow icon={User} label="Full Name" value={user?.name} />
          <InfoRow icon={Mail} label="Email Address" value={user?.email} />
          <InfoRow icon={Calendar} label="Member Since" value={formatDate(user?.createdAt)} />
          <InfoRow icon={Shield} label="Account Status" value="Active" />
        </SectionCard>

        {/* App info */}
        <SectionCard title="About" subtitle="DocuChat AI application">
          <div className="py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">DocuChat AI</p>
              <p className="text-xs text-gray-500 mt-0.5">Chat with your Word documents using free AI models</p>
            </div>
          </div>
        </SectionCard>

        {/* Sign out */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">Sign out</p>
          <p className="text-xs text-gray-500 mb-4">You'll need to sign back in to access your documents.</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
          >
            <LogOut size={15} />
            Sign out of DocuChat AI
          </button>
        </div>

      </div>
    </div>
  );
}
