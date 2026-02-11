import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/', label: 'Dashboard' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/analytics', label: 'Analytics' },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-black/50 backdrop-blur border-b border-trackRed/30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="racing-title font-bold text-trackRed">F1 2026 Prediction League</Link>
          <nav className="flex items-center gap-4 text-sm">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? 'text-trackRed' : 'text-white/80'}>{item.label}</NavLink>
            ))}
            {user?.role === 'admin' && <NavLink to="/admin" className="text-yellow-300">Admin</NavLink>}
            <button onClick={logout} className="bg-trackRed px-3 py-1 rounded">Logout</button>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
};

export default Layout;
