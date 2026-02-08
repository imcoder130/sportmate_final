import { useNavigate } from 'react-router-dom';
import { Shield, Users, Building2, Trophy, TrendingUp, Settings, FileText, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2F4F7] via-white to-[#E0F2FE]">
      <nav className="bg-white/90 backdrop-blur-xl border-b-2 border-[#FF9F1C] sticky top-0 z-50" style={{ boxShadow: '0 8px 20px rgba(255, 159, 28, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)' }}>
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF9F1C] to-[#E68A00] rounded-lg flex items-center justify-center transform hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer" style={{ boxShadow: '0 8px 20px rgba(255, 159, 28, 0.3), inset 0 2px 4px rgba(255,255,255,0.2)' }}>
                <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-[#FF9F1C] to-[#E68A00] bg-clip-text text-transparent">
                Admin Panel
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white hover:scale-105 border-2 border-gray-200 text-gray-700 rounded-lg transition-all duration-300 font-bold" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#FF9F1C] via-[#E68A00] to-[#FF9F1C] bg-clip-text text-transparent mb-2">System Dashboard</h1>
          <p className="text-lg text-gray-700 font-medium">Monitor and manage the SportFinder platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {/* Total Users */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(74, 20, 140, 0.12), 0 4px 12px rgba(74, 20, 140, 0.08)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#4A148C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] rounded-lg flex items-center justify-center mb-3" style={{ boxShadow: '0 6px 16px rgba(74, 20, 140, 0.3)' }}>
                <Users className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Total Users</h3>
              <p className="text-3xl font-black bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] bg-clip-text text-transparent">0</p>
              <p className="text-xs text-gray-500 mt-1 font-bold">Registered</p>
            </div>
          </div>

          {/* Total Turfs */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(20, 184, 166, 0.12), 0 4px 12px rgba(20, 184, 166, 0.08)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-lg flex items-center justify-center mb-3" style={{ boxShadow: '0 6px 16px rgba(20, 184, 166, 0.3)' }}>
                <Building2 className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Total Turfs</h3>
              <p className="text-3xl font-black bg-gradient-to-br from-[#14B8A6] to-[#0D9488] bg-clip-text text-transparent">0</p>
              <p className="text-xs text-gray-500 mt-1 font-bold">Listed</p>
            </div>
          </div>

          {/* Active Games */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(255, 159, 28, 0.12), 0 4px 12px rgba(255, 159, 28, 0.08)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF9F1C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-[#FF9F1C] to-[#E68A00] rounded-lg flex items-center justify-center mb-3" style={{ boxShadow: '0 6px 16px rgba(255, 159, 28, 0.3)' }}>
                <Trophy className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Active Games</h3>
              <p className="text-3xl font-black bg-gradient-to-br from-[#FF9F1C] to-[#E68A00] bg-clip-text text-transparent">0</p>
              <p className="text-xs text-gray-500 mt-1 font-bold">Ongoing</p>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(20, 184, 166, 0.12), 0 4px 12px rgba(20, 184, 166, 0.08)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-lg flex items-center justify-center mb-3" style={{ boxShadow: '0 6px 16px rgba(20, 184, 166, 0.3)' }}>
                <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-wider mb-2">System Health</h3>
              <p className="text-3xl font-black bg-gradient-to-br from-[#14B8A6] to-[#0D9488] bg-clip-text text-transparent">100%</p>
              <p className="text-xs text-gray-500 mt-1 font-bold">Operational</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-3xl font-black bg-gradient-to-r from-[#FF9F1C] to-[#E68A00] bg-clip-text text-transparent mb-6">
            Admin Tools
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* User Management */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(74, 20, 140, 0.12), 0 4px 12px rgba(74, 20, 140, 0.08)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110" style={{ boxShadow: '0 6px 16px rgba(74, 20, 140, 0.3)' }}>
                  <Users className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-base font-black text-gray-900 mb-1">User Management</h3>
                <p className="text-xs text-gray-600 font-medium">Manage player accounts</p>
              </div>
            </div>

            {/* Turf Moderation */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(20, 184, 166, 0.12), 0 4px 12px rgba(20, 184, 166, 0.08)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110" style={{ boxShadow: '0 6px 16px rgba(20, 184, 166, 0.3)' }}>
                  <Building2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-base font-black text-gray-900 mb-1">Turf Moderation</h3>
                <p className="text-xs text-gray-600 font-medium">Review and approve turfs</p>
              </div>
            </div>

            {/* Reports & Analytics */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(255, 159, 28, 0.12), 0 4px 12px rgba(255, 159, 28, 0.08)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-[#FF9F1C] to-[#E68A00] rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110" style={{ boxShadow: '0 6px 16px rgba(255, 159, 28, 0.3)' }}>
                  <BarChart3 className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-base font-black text-gray-900 mb-1">Reports & Analytics</h3>
                <p className="text-xs text-gray-600 font-medium">View platform insights</p>
              </div>
            </div>

            {/* Activity Logs */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(74, 20, 140, 0.12), 0 4px 12px rgba(74, 20, 140, 0.08)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110" style={{ boxShadow: '0 6px 16px rgba(74, 20, 140, 0.3)' }}>
                  <FileText className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-base font-black text-gray-900 mb-1">Activity Logs</h3>
                <p className="text-xs text-gray-600 font-medium">Track system events</p>
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(255, 159, 28, 0.12), 0 4px 12px rgba(255, 159, 28, 0.08)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-[#FF9F1C] to-[#E68A00] rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110" style={{ boxShadow: '0 6px 16px rgba(255, 159, 28, 0.3)' }}>
                  <Settings className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-base font-black text-gray-900 mb-1">System Settings</h3>
                <p className="text-xs text-gray-600 font-medium">Configure platform</p>
              </div>
            </div>

            {/* Game Monitoring */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(20, 184, 166, 0.12), 0 4px 12px rgba(20, 184, 166, 0.08)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110" style={{ boxShadow: '0 6px 16px rgba(20, 184, 166, 0.3)' }}>
                  <Trophy className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-base font-black text-gray-900 mb-1">Game Monitoring</h3>
                <p className="text-xs text-gray-600 font-medium">Track live games</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
