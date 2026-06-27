import { Switch, Route, Redirect } from 'wouter';
import { useAuth } from './hooks/useAuth.js';
import Sidebar from './components/Sidebar.jsx';
import BottomNav from './components/BottomNav.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Upload from './pages/Upload.jsx';
import Documents from './pages/Documents.jsx';
import Chat from './pages/Chat.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';

function HomeRedirect() {
  const { isAuth } = useAuth();
  return <Redirect to={isAuth ? '/dashboard' : '/login'} />;
}

function AppLayout({ children }) {
  const { isAuth } = useAuth();
  if (!isAuth) return <Redirect to="/login" />;
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 min-w-0 pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

function ChatLayout() {
  const { isAuth } = useAuth();
  if (!isAuth) return <Redirect to="/login" />;
  return (
    <div className="flex bg-white overflow-hidden" style={{ height: '100dvh' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <Chat />
      </div>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard">{() => <AppLayout><Dashboard /></AppLayout>}</Route>
      <Route path="/upload">{() => <AppLayout><Upload /></AppLayout>}</Route>
      <Route path="/documents">{() => <AppLayout><Documents /></AppLayout>}</Route>
      <Route path="/chat" component={ChatLayout} />
      <Route path="/settings">{() => <AppLayout><Settings /></AppLayout>}</Route>
      <Route path="/" component={HomeRedirect} />
      <Route component={NotFound} />
    </Switch>
  );
}
