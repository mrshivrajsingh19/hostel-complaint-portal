import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Loader2 } from 'lucide-react';

const HOSTEL_BLOCKS = ['Block A', 'Block B', 'Block C', 'Block D', 'Block E'];

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student',
    hostelBlock: 'Block A', roomNumber: '', phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'warden' ? '/warden' : '/student', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-indigo-800 px-8 py-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-white/20 rounded-2xl p-3">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-white">Create Account</h1>
            <p className="text-indigo-300 mt-1 text-sm">Join the Hostel Complaint Portal</p>
          </div>

          <div className="px-8 py-7">
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  {['student', 'warden'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, role: r })}
                      className={`py-2.5 text-sm font-semibold rounded-lg border-2 transition-colors capitalize ${
                        form.role === r
                          ? 'bg-indigo-700 text-white border-indigo-700'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                      }`}
                    >
                      {r === 'student' ? '🎓 Student' : '🏢 Warden'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  name="name" type="text" required value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  name="email" type="email" required value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="you@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password (min 6 chars)</label>
                <input
                  name="password" type="password" required value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="••••••••"
                />
              </div>

              {form.role === 'student' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Block</label>
                      <select
                        name="hostelBlock" value={form.hostelBlock} onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                      >
                        {HOSTEL_BLOCKS.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                      <input
                        name="roomNumber" type="text" required={form.role === 'student'} value={form.roomNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="A-204"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                <input
                  name="phone" type="tel" value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="9876543210"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-700 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : 'Create Account'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-700 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
