import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { Loader2, Search, Filter, ChevronRight, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = ['all', 'pending', 'assigned', 'in_progress', 'resolved', 'rejected'];
const CATEGORY_OPTIONS = ['all', 'Plumbing', 'Electrical', 'Furniture', 'Housekeeping', 'Internet', 'Mess', 'Security', 'Other'];
const PRIORITY_OPTIONS = ['all', 'urgent', 'high', 'medium', 'low'];

export default function AllComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    api.get('/complaints')
      .then(res => setComplaints(res.data))
      .catch(() => setError('Failed to load complaints.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = complaints.filter(c => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchPriority = priorityFilter === 'all' || c.priority === priorityFilter;
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      c.studentRoom?.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchCategory && matchPriority && matchSearch;
  });

  const pendingCount = complaints.filter(c => c.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Complaints</h1>
            <p className="text-gray-500 text-sm mt-1">
              {filtered.length} complaint{filtered.length !== 1 ? 's' : ''} shown
              {pendingCount > 0 && <span className="ml-2 text-yellow-600 font-medium">• {pendingCount} pending review</span>}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, student, room, or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <select
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.replace('_', ' ')}</option>)}
            </select>
            <select
              value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
            >
              {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
            </select>
            <select
              value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
            >
              {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p === 'all' ? 'All Priorities' : p}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No complaints found</h3>
            <p className="text-gray-400">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {filtered.map(complaint => (
                <Link
                  key={complaint.id}
                  to={`/warden/complaint/${complaint.id}`}
                  className="flex items-center gap-4 p-4 sm:p-5 hover:bg-gray-50 transition-colors group"
                >
                  {/* Priority indicator */}
                  <div className={`w-1.5 h-12 rounded-full shrink-0 ${
                    complaint.priority === 'urgent' ? 'bg-red-500' :
                    complaint.priority === 'high' ? 'bg-orange-400' :
                    complaint.priority === 'medium' ? 'bg-blue-400' : 'bg-gray-300'
                  }`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <StatusBadge status={complaint.status} />
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{complaint.category}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">{complaint.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      👤 {complaint.studentName} &nbsp;•&nbsp; 🏠 {complaint.studentRoom}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-3 shrink-0">
                    <PriorityBadge priority={complaint.priority} />
                    <span className="text-xs text-gray-400">
                      {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
