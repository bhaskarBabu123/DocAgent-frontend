import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Upload, FileText, MessageSquare, Settings } from 'lucide-react';

const nav = [
  { label: 'Home', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Upload', icon: Upload, to: '/upload' },
  { label: 'Docs', icon: FileText, to: '/documents' },
  { label: 'Chat', icon: MessageSquare, to: '/chat' },
  { label: 'Settings', icon: Settings, to: '/settings' },
];

export default function BottomNav() {
  const [location] = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {nav.map(({ to, icon: Icon, label }) => {
          const active = location === to || (to !== '/' && location.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-0 flex-1 transition-colors ${
                active ? 'text-black' : 'text-gray-400'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] font-medium ${active ? 'text-black' : 'text-gray-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
