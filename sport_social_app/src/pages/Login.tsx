import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../api';
import { User, Building2, Shield } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'player' | 'turf_owner' | 'admin'>('player');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await userAPI.login(email, password);
      const user = response.user;

      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userRole', user.role);

      // Redirect based on user role
      if (user.role === 'player') {
        navigate('/player/dashboard');
      } else if (user.role === 'turf_owner') {
        navigate('/turf-owner/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const userTypes = [
    {
      type: 'player' as const,
      title: 'Player',
      description: 'Find and join games',
      icon: User,
      color: '#4A148C',
      shadowColor: 'rgba(74, 20, 140, 0.4)',
    },
    {
      type: 'turf_owner' as const,
      title: 'Turf Owner',
      description: 'Manage your venues',
      icon: Building2,
      color: '#14B8A6',
      shadowColor: 'rgba(20, 184, 166, 0.4)',
    },
    {
      type: 'admin' as const,
      title: 'Admin',
      description: 'System management',
      icon: Shield,
      color: '#FF9F1C',
      shadowColor: 'rgba(255, 159, 28, 0.4)',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2F4F7] via-white to-[#E0F2FE] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] rounded-lg flex items-center justify-center transform hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer" style={{ boxShadow: '0 10px 25px rgba(74, 20, 140, 0.4), 0 5px 12px rgba(74, 20, 140, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)' }}>
              <span className="text-white text-lg font-bold">SF</span>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-[#4A148C] to-[#6A1B9A] bg-clip-text text-transparent">
              SportFinder
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600 font-medium text-base">Sign in to your account</p>
        </div>

        {/* Login Card with Glossy Effect */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/50 relative overflow-hidden" style={{ boxShadow: '0 15px 40px rgba(0, 0, 0, 0.12), 0 8px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)' }}>
          {/* Glossy overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-transparent pointer-events-none rounded-2xl"></div>
          
          <div className="relative z-10">
          {/* User Type Selector */}
          <div className="mb-5">
            <label className="block text-xs font-black text-gray-700 mb-3 uppercase tracking-wider">
              Select Account Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {userTypes.map((type) => {
                const Icon = type.icon;
                return (
                <button
                  key={type.type}
                  type="button"
                  onClick={() => setUserType(type.type)}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                    userType === type.type
                      ? 'border-transparent scale-105 -translate-y-1'
                      : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:scale-105'
                  }`}
                  style={userType === type.type ? {
                    background: `linear-gradient(135deg, ${type.color} 0%, ${type.color}dd 100%)`,
                    boxShadow: `0 10px 25px ${type.shadowColor}, 0 5px 12px ${type.shadowColor}, inset 0 2px 4px rgba(255, 255, 255, 0.2)`
                  } : {}}
                >
                  <div className={`flex items-center justify-center mb-1 ${
                    userType === type.type ? 'text-white' : 'text-gray-400'
                  }`}>
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <div className={`text-xs font-bold ${
                    userType === type.type ? 'text-white' : 'text-gray-700'
                  }`}>
                    {type.title}
                  </div>
                </button>
              )})}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-black text-gray-700 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-[#4A148C] focus:border-[#4A148C] outline-none transition-all duration-300 placeholder-gray-400 font-medium text-sm"
                style={{ boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)' }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-black text-gray-700 mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-[#4A148C] focus:border-[#4A148C] outline-none transition-all duration-300 placeholder-gray-400 font-medium text-sm"
                style={{ boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)' }}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50/90 backdrop-blur-sm border-2 border-red-300 rounded-lg" style={{ boxShadow: '0 6px 16px rgba(239, 68, 68, 0.2)' }}>
                <p className="text-xs text-red-600 font-bold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-black text-white text-base transition-all duration-300 hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 relative overflow-hidden group"
              style={{
                background: `linear-gradient(135deg, #4A148C 0%, #6A1B9A 100%)`,
                boxShadow: '0 10px 25px rgba(74, 20, 140, 0.4), 0 5px 12px rgba(74, 20, 140, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
              }}
            >
              <span className="relative z-10">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  `Sign In as ${userTypes.find((t) => t.type === userType)?.title}`
                )}
              </span>
              {/* Glossy overlay on button */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center pt-6 border-t-2 border-gray-200">
            <p className="text-sm text-gray-600 font-medium">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="font-black text-[#14B8A6] hover:text-[#0D9488] transition-colors"
              >
                Create one
              </button>
            </p>
          </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-[#4A148C] transition-colors font-bold"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
