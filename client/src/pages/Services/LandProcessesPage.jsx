import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

const LandProcessesPage = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        setLoading(true);
        const response = await api.get('/land/user');
        setProcesses(response.data.data || []);
      } catch (err) {
        setError('Failed to fetch your land processes.');
      } finally {
        setLoading(false);
      }
    };
    fetchProcesses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Land Processes</h1>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner size="large" />
          </div>
        ) : error ? (
          <div className="text-red-600 text-center">{error}</div>
        ) : processes.length === 0 ? (
          <div className="text-gray-600 text-center">No land processes found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Submitted</th>
                  <th className="px-4 py-2 text-left">Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((proc) => (
                  <tr key={proc._id} className="border-b last:border-0">
                    <td className="px-4 py-2">{proc.applicationType}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[proc.status] || 'bg-gray-100 text-gray-800'}`}>{proc.status}</span>
                    </td>
                    <td className="px-4 py-2">{new Date(proc.submissionDate || proc.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      {proc.status === 'Rejected' && proc.rejectionReason ? (
                        <span className="text-red-600">Rejected: {proc.rejectionReason}</span>
                      ) : proc.status === 'Approved' ? (
                        <span className="text-green-700">Approved</span>
                      ) : (
                        <span className="text-gray-500">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandProcessesPage; 