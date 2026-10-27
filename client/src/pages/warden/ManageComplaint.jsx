import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { ArrowLeft, Loader2, Clock, MapPin, Phone, User, AlertCircle, CheckCircle } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function ManageComplaint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ status: '', wardenNotes: '', assignedTo: '' });

  useEffect(() => {
    api.get(`/complaints/${id}`)
      .then(res => {
        setComplaint(res.data);
        setForm({
          status: res.data.status,
          wardenNotes: res.data.wardenNotes || '',
          assignedTo: res.data.assignedTo || '',
        });
      })
      .catch(err => setError(err.response?.data?.error || 'Failed to load complaint.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);
    try {
      const res = await api.patch(`/complaints/${id}/status`, form);
      setComplaint(res.data);
      setSuccess('Complaint updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update complaint.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  );

  if (error && !complaint) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-600">{error}</p>
        <Link to="/warden/complaints" className="mt-4 inline-block text-indigo-700 hover:underline">Go Back</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/warden/complaints" className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to all complaints
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Complaint Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-indigo-800 px-6 py-5">
                <div className="flex flex-wrap gap-2 mb-3">
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} />
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
                    {complaint.category}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-white">{complaint.title}</h1>
              </div>

              <div className="p-6">
                {/* Student Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 p-4 bg-indigo-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-indigo-500 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Student</p>
                      <p className="text-sm font-semibold text-gray-900">{complaint.studentName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-500 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Room</p>
                      <p className="text-sm font-semibold text-gray-900">{complaint.studentRoom}</p>
                    </div>
                  </div>
                  {complaint.studentPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-indigo-500 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-semibold text-gray-900">{complaint.studentPhone}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Clock className="h-4 w-4 text-gray-400" />
                  Submitted on {new Date(complaint.createdAt).toLocaleString('en-IN')}
                  {complaint.location && <span>• 📍 {complaint.location}</span>}
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">Complaint Description</h3>
                <p className="text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-4">{complaint.description}</p>
              </div>
            </div>

            {/* Timeline */}
            {complaint.timeline && complaint.timeline.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Activity Timeline</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-4">
                    {complaint.timeline.map((entry, i) => (
                      <div key={i} className="relative flex items-start gap-4 pl-10">
                        <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow ${
                          entry.action === 'resolved' ? 'bg-green-500' :
                          entry.action === 'rejected' ? 'bg-red-500' :
                          'bg-indigo-600'
                        }`} />
                        <div className="flex-1 bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-900 text-sm capitalize">{entry.action.replace('_', ' ')}</span>
                            <span className="text-xs text-gray-400">{new Date(entry.at).toLocaleString('en-IN')}</span>
                          </div>
                          <p className="text-sm text-gray-600">{entry.note}</p>
                          <p className="text-xs text-gray-400 mt-1">by {entry.by}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Update Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-5">Update Complaint</h3>

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  {success}
                </div>
              )}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To (Staff/Team)</label>
                  <input
                    type="text"
                    value={form.assignedTo}
                    onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                    placeholder="e.g. Maintenance Team, Raj Kumar"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warden's Note</label>
                  <textarea
                    value={form.wardenNotes}
                    onChange={e => setForm({ ...form, wardenNotes: e.target.value })}
                    rows={4}
                    placeholder="Add a note for the student about the update..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full py-3 bg-indigo-700 text-white font-semibold rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {updating ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</> : 'Update Complaint'}
                </button>
              </form>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <p className="text-xs text-gray-500 font-medium mb-2">Quick Actions</p>
                {['resolved', 'rejected'].map(action => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => {
                      setForm(f => ({ ...f, status: action }));
                    }}
                    className={`w-full py-2 text-sm font-medium rounded-lg border transition-colors capitalize ${
                      action === 'resolved'
                        ? 'border-green-300 text-green-700 hover:bg-green-50'
                        : 'border-red-300 text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {action === 'resolved' ? '✅' : '❌'} Mark as {action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
