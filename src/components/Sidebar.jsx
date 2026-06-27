import { useLocation, Link } from 'wouter';
import { useAuth } from '../hooks/useAuth.js';
import {
  LayoutDashboard, Upload, FileText, MessageSquare,
  Settings, LogOut, Bot,
} from 'lucide-react';

const nav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Upload', icon: Upload, to: '/upload' },
  { label: 'Documents', icon: FileText, to: '/documents' },
  { label: 'Chat', icon: MessageSquare, to: '/chat' },
  { label: 'Settings', icon: Settings, to: '/settings' },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    window.location.href = '/login';
  }

  return (
    <aside className="hidden md:flex w-56 flex-col bg-gray-50 border-r border-gray-200 flex-shrink-0 h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100 flex-shrink-0">
        <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
          <Bot size={14} className="text-white" />
        </div>
        <span className="font-semibold text-sm text-gray-900 tracking-tight">DocuChat AI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, icon: Icon, to }) => {
          const active = location === to || (to !== '/' && location.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3 flex-shrink-0">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-medium text-gray-900 truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
