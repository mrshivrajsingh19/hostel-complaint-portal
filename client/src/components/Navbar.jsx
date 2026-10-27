import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, LogOut, Bell, User, ClipboardList, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path)
    ? 'bg-indigo-700 text-white'
    : 'text-indigo-100 hover:bg-indigo-700 hover:text-white';

  return (
    <nav className="bg-indigo-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-lg p-1.5">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-lg leading-none block">Hostel Portal</span>
              <span className="text-indigo-300 text-xs">Complaint Management System</span>
            </div>
          </div>

          {/* Nav Links */}
          {user && (
            <div className="flex items-center gap-1">
              {user.role === 'student' && (
                <>
                  <Link
                    to="/student"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/student')}`}
                  >
                    <ClipboardList className="h-4 w-4" />
                    My Complaints
                  </Link>
                  <Link
                    to="/student/new"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/student/new')}`}
                  >
                    <Bell className="h-4 w-4" />
                    New Complaint
                  </Link>
                </>
              )}

              {user.role === 'warden' && (
                <>
                  <Link
                    to="/warden"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/warden') && location.pathname === '/warden'}`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/warden/complaints"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/warden/complaints')}`}
                  >
                    <ClipboardList className="h-4 w-4" />
                    All Complaints
                  </Link>
                </>
              )}
            </div>
          )}

          {/* User + Logout */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-white">
                <div className="bg-white/20 rounded-full p-1">
                  <User className="h-4 w-4" />
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold leading-none">{user.name}</p>
                  <p className="text-xs text-indigo-300 capitalize">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-indigo-200 hover:bg-indigo-700 hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
