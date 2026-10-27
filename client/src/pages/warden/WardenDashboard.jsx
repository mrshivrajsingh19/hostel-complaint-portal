import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ClipboardList, Clock, CheckCircle, AlertCircle,
  Activity, Loader2, TrendingUp, Users
} from 'lucide-react';

export default function WardenDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/complaints/stats'),
      api.get('/complaints'),
    ])
      .then(([statsRes, complaintsRes]) => {
        setStats(statsRes.data);
        setRecentComplaints(complaintsRes.data.slice(0, 5));
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Warden Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user.name}</p>
          </div>
          <Link
            to="/warden/complaints"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors shadow-sm"
          >
            <ClipboardList className="h-4 w-4" />
            Manage All Complaints
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        {stats && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Complaints', value: stats.total, icon: Activity, color: 'bg-indigo-100 text-indigo-600', bg: 'bg-white' },
                { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'bg-yellow-100 text-yellow-600', bg: 'bg-white border-l-4 border-yellow-400' },
                { label: 'In Progress', value: stats.assigned + stats.in_progress, icon: AlertCircle, color: 'bg-orange-100 text-orange-600', bg: 'bg-white border-l-4 border-orange-400' },
                { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'bg-green-100 text-green-600', bg: 'bg-white border-l-4 border-green-400' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-5 shadow-sm border border-gray-100`}>
                  <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  Complaints by Category
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.byCategory)
                    .filter(([, count]) => count > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, count]) => (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-28 shrink-0">{cat}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-6 text-right">{count}</span>
                      </div>
                    ))}
                  {Object.values(stats.byCategory).every(v => v === 0) && (
                    <p className="text-gray-400 text-sm">No complaints yet.</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Priority Breakdown
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'urgent', label: 'Urgent', color: 'bg-red-600' },
                    { key: 'high', label: 'High', color: 'bg-orange-500' },
                    { key: 'medium', label: 'Medium', color: 'bg-blue-500' },
                    { key: 'low', label: 'Low', color: 'bg-gray-400' },
                  ].map(({ key, label, color }) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-16 shrink-0">{label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className={`${color} h-2 rounded-full`}
                          style={{ width: `${stats.total ? ((stats.byPriority[key] || 0) / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-6 text-right">{stats.byPriority[key] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Recent Complaints */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-600" />
              Recent Complaints
            </h3>
            <Link to="/warden/complaints" className="text-sm text-indigo-700 hover:underline font-medium">View all →</Link>
          </div>

          {recentComplaints.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No complaints submitted yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentComplaints.map(c => (
                <div key={c.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{c.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.studentName} • {c.studentRoom} • {c.category}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      c.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      c.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {c.status.replace('_', ' ')}
                    </span>
                    <Link
                      to={`/warden/complaint/${c.id}`}
                      className="text-xs text-indigo-700 hover:text-indigo-900 font-medium"
                    >
                      Manage →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
