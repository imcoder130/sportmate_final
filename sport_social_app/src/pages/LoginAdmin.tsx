import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../api';

const LoginAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await userAPI.login(formData.email, formData.password);
      const user = response.user;

      // Check if user is admin
      if (user.role !== 'admin') {
        setError('Access denied. This login is only for administrators.');
        setLoading(false);
        return;
      }

      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user.id);

      // Navigate to admin dashboard
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back</span>
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-600 mt-2">Authorized personnel only</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="mb-6 p-3 bg-purple-50 border border-purple-200 rounded-xl">
            <p className="text-sm text-purple-800 text-center">
              🔒 This area is restricted to administrators
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                placeholder="admin@sportfinder.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                <span className="text-gray-700">Remember me</span>
              </label>
              <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Verifying...' : 'Access Admin Panel'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Not an admin?</span>
            </div>
          </div>

          {/* Other Login Types */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/login/player')}
              className="px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all"
            >
              Player Login
            </button>
            <button
              onClick={() => navigate('/login/turf-owner')}
              className="px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:border-green-500 hover:text-green-600 transition-all"
            >
              Turf Owner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
