import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { Plus, AlertCircle, Loader2, Clock, CheckCircle, XCircle, Activity, Search, Filter } from 'lucide-react';

const FILTER_OPTIONS = ['all', 'pending', 'assigned', 'in_progress', 'resolved', 'rejected'];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (err) {
      setError('Failed to load complaints. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this complaint?')) return;
    setDeleting(id);
    try {
      await api.delete(`/complaints/${id}`);
      setComplaints(c => c.filter(x => x.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete complaint.');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = complaints.filter(c => {
    const matchStatus = filter === 'all' || c.status === filter;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => ['assigned', 'in_progress'].includes(c.status)).length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name} 👋</h1>
          <p className="text-gray-500 mt-1">
            {user.hostelBlock} • Room {user.roomNumber}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: Activity, color: 'indigo' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'yellow' },
            { label: 'In Progress', value: stats.inProgress, icon: AlertCircle, color: 'orange' },
            { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'green' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className={`inline-flex p-2 rounded-lg bg-${color}-100 mb-3`}>
                <Icon className={`h-5 w-5 text-${color}-600`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Link
            to="/student/new"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Submit New Complaint
          </Link>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white capitalize appearance-none"
            >
              {FILTER_OPTIONS.map(f => (
                <option key={f} value={f} className="capitalize">{f === 'all' ? 'All Status' : f.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Complaint List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No complaints found</h3>
            <p className="text-gray-400 mb-6">
              {complaints.length === 0
                ? "You haven't submitted any complaints yet."
                : "No complaints match your current filters."}
            </p>
            <Link
              to="/student/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Submit First Complaint
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(complaint => (
              <div key={complaint.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <StatusBadge status={complaint.status} />
                      <PriorityBadge priority={complaint.priority} />
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {complaint.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg truncate">{complaint.title}</h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{complaint.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
                      <span>📍 {complaint.location || 'N/A'}</span>
                      <span>🕐 {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {complaint.wardenNotes && (
                        <span className="text-indigo-600 font-medium">💬 Warden note: {complaint.wardenNotes}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/student/complaint/${complaint.id}`}
                      className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      View Details
                    </Link>
                    {complaint.status === 'pending' && (
                      <button
                        onClick={() => handleDelete(complaint.id)}
                        disabled={deleting === complaint.id}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-60"
                      >
                        {deleting === complaint.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Withdraw'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
