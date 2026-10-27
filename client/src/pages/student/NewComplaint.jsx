import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ArrowLeft, Send } from 'lucide-react';

const CATEGORIES = ['Plumbing', 'Electrical', 'Furniture', 'Housekeeping', 'Internet', 'Mess', 'Security', 'Other'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function NewComplaint() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Plumbing',
    priority: 'medium',
    location: user ? `${user.hostelBlock} - ${user.roomNumber}` : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.title.trim().length < 5) {
      setError('Title must be at least 5 characters.');
      return;
    }
    if (form.description.trim().length < 10) {
      setError('Description must be at least 10 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/complaints', form);
      setSuccess(true);
      setTimeout(() => navigate('/student'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Submitted!</h2>
          <p className="text-gray-500">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/student" className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to my complaints
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-indigo-800 px-6 py-5">
            <h1 className="text-xl font-bold text-white">Submit a Complaint</h1>
            <p className="text-indigo-300 text-sm mt-1">Describe your issue and we'll get it resolved</p>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category + Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="category" value={form.category} onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                  <select
                    name="priority" value={form.priority} onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white capitalize"
                  >
                    {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complaint Title * <span className="text-gray-400 text-xs">(min 5 chars)</span>
                </label>
                <input
                  name="title" type="text" required value={form.title} onChange={handleChange}
                  maxLength={100}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="e.g. Broken tap in bathroom, WiFi not working in room"
                />
                <p className="text-xs text-gray-400 mt-1">{form.title.length}/100 characters</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Description * <span className="text-gray-400 text-xs">(min 10 chars)</span>
                </label>
                <textarea
                  name="description" required value={form.description} onChange={handleChange}
                  rows={5}
                  maxLength={1000}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  placeholder="Describe the issue in detail — when it started, what you've observed, and how it's affecting you..."
                />
                <p className="text-xs text-gray-400 mt-1">{form.description.length}/1000 characters</p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  name="location" type="text" value={form.location} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="e.g. Block A - Room 204, Common bathroom on 2nd floor"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Link
                  to="/student"
                  className="flex-1 py-3 text-center border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="h-4 w-4" /> Submit Complaint</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
