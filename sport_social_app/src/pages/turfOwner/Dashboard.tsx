import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../types';
import { Building2, Calendar, DollarSign, Plus, TrendingUp, Users } from 'lucide-react';

export default function TurfOwnerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2F4F7] via-white to-[#E0F2FE]">
      <nav className="bg-white/90 backdrop-blur-xl border-b-2 border-[#14B8A6] sticky top-0 z-50" style={{ boxShadow: '0 8px 20px rgba(20, 184, 166, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)' }}>
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-lg flex items-center justify-center transform hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer" style={{ boxShadow: '0 8px 20px rgba(20, 184, 166, 0.3), inset 0 2px 4px rgba(255,255,255,0.2)' }}>
                <Building2 className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-[#14B8A6] to-[#0D9488] bg-clip-text text-transparent">
                Turf Manager
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border-2 border-gray-200 hover:scale-105 transition-all duration-300 cursor-pointer" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
                <div className="w-8 h-8 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-lg flex items-center justify-center text-white font-black text-sm" style={{ boxShadow: '0 4px 10px rgba(20, 184, 166, 0.3)' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500 font-semibold">Turf Owner</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-700 hover:text-[#14B8A6] rounded-xl font-bold transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#14B8A6] via-[#0D9488] to-[#14B8A6] bg-clip-text text-transparent mb-2">Welcome Back!</h1>
          <p className="text-gray-700 text-lg font-medium">Manage your turfs and bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {/* My Turfs */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(20, 184, 166, 0.12), 0 4px 12px rgba(20, 184, 166, 0.08)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-lg flex items-center justify-center mb-3" style={{ boxShadow: '0 6px 16px rgba(20, 184, 166, 0.3)' }}>
                <Building2 className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-wider mb-2">My Turfs</h3>
              <p className="text-3xl font-black bg-gradient-to-br from-[#14B8A6] to-[#0D9488] bg-clip-text text-transparent">0</p>
              <p className="text-xs text-gray-500 mt-1 font-bold">Registered</p>
            </div>
          </div>

          {/* Bookings */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(255, 159, 28, 0.12), 0 4px 12px rgba(255, 159, 28, 0.08)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF9F1C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-[#FF9F1C] to-[#E68A00] rounded-lg flex items-center justify-center mb-3" style={{ boxShadow: '0 6px 16px rgba(255, 159, 28, 0.3)' }}>
                <Calendar className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Bookings</h3>
              <p className="text-3xl font-black bg-gradient-to-br from-[#FF9F1C] to-[#E68A00] bg-clip-text text-transparent">0</p>
              <p className="text-xs text-gray-500 mt-1 font-bold">Active</p>
            </div>
          </div>

          {/* Earnings */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(74, 20, 140, 0.12), 0 4px 12px rgba(74, 20, 140, 0.08)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#4A148C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] rounded-lg flex items-center justify-center mb-3" style={{ boxShadow: '0 6px 16px rgba(74, 20, 140, 0.3)' }}>
                <DollarSign className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Earnings</h3>
              <p className="text-3xl font-black bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] bg-clip-text text-transparent">$0</p>
              <p className="text-xs text-gray-500 mt-1 font-bold">This month</p>
            </div>
          </div>

          {/* Add New Turf CTA */}
          <button
            onClick={() => navigate('/turf-owner/create-turf')}
            className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-xl p-5 border-2 border-transparent hover:scale-105 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
            style={{ boxShadow: '0 10px 30px rgba(20, 184, 166, 0.25), 0 4px 12px rgba(20, 184, 166, 0.15)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
            <div className="relative">
              <div className="w-11 h-11 bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-black text-white text-base mb-1">Add New Turf</h3>
              <p className="text-xs text-white/95 font-bold">Register a venue</p>
            </div>
          </button>
        </div>

        {/* Empty State */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-12 text-center border-2 border-gray-100 relative overflow-hidden" style={{ boxShadow: '0 15px 40px rgba(20, 184, 166, 0.12), 0 8px 20px rgba(20, 184, 166, 0.08)' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/5 to-transparent pointer-events-none"></div>
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-xl flex items-center justify-center mx-auto mb-6 transform hover:scale-110 hover:rotate-6 transition-all duration-300 cursor-pointer" style={{ boxShadow: '0 15px 40px rgba(20, 184, 166, 0.3), 0 8px 20px rgba(20, 184, 166, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.2)' }}>
              <Building2 className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-[#14B8A6] via-[#0D9488] to-[#14B8A6] bg-clip-text text-transparent mb-3">Your Turfs</h2>
            <p className="text-lg text-gray-600 mb-8 font-bold">No turfs registered yet</p>
            <button
              onClick={() => navigate('/turf-owner/create-turf')}
              className="px-8 py-3 rounded-lg font-black text-white text-base hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #4A148C 0%, #6A1B9A 100%)',
                boxShadow: '0 10px 30px rgba(74, 20, 140, 0.3), 0 5px 15px rgba(74, 20, 140, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative">Create Your First Turf</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
