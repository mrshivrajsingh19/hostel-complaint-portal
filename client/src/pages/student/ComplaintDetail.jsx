import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { ArrowLeft, Loader2, Clock, MapPin, Tag, AlertCircle } from 'lucide-react';

export default function ComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/complaints/${id}`)
      .then(res => setComplaint(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load complaint.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-600">{error}</p>
        <Link to="/student" className="mt-4 inline-block text-indigo-700 hover:underline">Go Back</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/student" className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to my complaints
          </Link>
        </div>

        {/* Complaint Card */}
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

          <div className="p-6 sm:p-8 space-y-6">
            {/* Meta info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Submitted</p>
                  <p className="font-medium">{new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              {complaint.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="font-medium">{complaint.location}</p>
                  </div>
                </div>
              )}
              {complaint.assignedTo && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Tag className="h-4 w-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Assigned To</p>
                    <p className="font-medium">{complaint.assignedTo}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-4">{complaint.description}</p>
            </div>

            {/* Warden Note */}
            {complaint.wardenNotes && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-900 mb-1 text-sm">💬 Warden's Note</h3>
                <p className="text-indigo-700 text-sm">{complaint.wardenNotes}</p>
              </div>
            )}

            {/* Timeline */}
            {complaint.timeline && complaint.timeline.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Activity Timeline</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-4">
                    {complaint.timeline.map((entry, i) => (
                      <div key={i} className="relative flex items-start gap-4 pl-10">
                        <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white shadow" />
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
        </div>
      </div>
    </div>
  );
}
