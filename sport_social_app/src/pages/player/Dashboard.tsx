import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../types';
import {
  Search,
  Plus,
  Calendar,
  MapPin,
  Users,
  User as UserIcon,
  Trophy,
  Target,
  TrendingUp,
  Star,
} from 'lucide-react';

export default function PlayerDashboard() {
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

  const quickActions = [
    {
      title: 'Find Games',
      description: 'Discover games nearby',
      icon: Search,
      action: () => navigate('/player/discover'),
    },
    {
      title: 'Create Game',
      description: 'Organize a new match',
      icon: Plus,
      action: () => navigate('/player/create-game'),
    },
    {
      title: 'My Games',
      description: 'View joined games',
      icon: Calendar,
      action: () => navigate('/player/my-games'),
    },
    {
      title: 'Book Turf',
      description: 'Reserve a venue',
      icon: MapPin,
      action: () => navigate('/player/turfs'),
    },
    {
      title: 'Friends',
      description: 'Manage your friends',
      icon: Users,
      action: () => navigate('/player/friends'),
    },
    {
      title: 'My Profile',
      description: 'View and edit profile',
      icon: UserIcon,
      action: () => navigate('/player/profile'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2F4F7] via-white to-[#E0F2FE]">
      {/* Navbar */}
      <nav
        className="bg-white/90 backdrop-blur-xl border-b-2 border-[#4A148C] sticky top-0 z-50"
        style={{
          boxShadow:
            '0 8px 20px rgba(74, 20, 140, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] rounded-lg flex items-center justify-center transform hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer"
                style={{
                  boxShadow:
                    '0 8px 20px rgba(74, 20, 140, 0.3), inset 0 2px 4px rgba(255,255,255,0.2)',
                }}
              >
                <span className="text-white text-lg font-black">SF</span>
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-[#4A148C] to-[#6A1B9A] bg-clip-text text-transparent">
                SportFinder
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/player/notifications')}
                className="relative px-3 py-2 bg-white rounded-lg hover:scale-105 transition-all duration-300 border-2 border-gray-200"
              >
                <span className="text-xs font-black text-gray-700">
                  Notifications
                </span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#14B8A6] rounded-full animate-pulse"></span>
              </button>

              <div
                onClick={() => navigate('/player/profile')}
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg cursor-pointer hover:scale-105 transition-all duration-300 border-2 border-gray-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] rounded-lg flex items-center justify-center text-white font-black text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500 font-semibold">
                    Athlete
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-700 hover:text-[#4A148C] rounded-xl font-bold transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#4A148C] via-[#6A1B9A] to-[#8B5CF6] bg-clip-text text-transparent mb-2">
            Welcome back, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-lg text-gray-700 font-medium">
            Ready to compete? Find a game or create your own.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {/* Games Played */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(74, 20, 140, 0.12), 0 4px 12px rgba(74, 20, 140, 0.08)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#4A148C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] rounded-lg flex items-center justify-center mb-3" style={{ boxShadow: '0 6px 16px rgba(74, 20, 140, 0.3)' }}>
                <Trophy className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Games Played</h3>
              <p className="text-3xl font-black bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] bg-clip-text text-transparent">{user.stats?.games_played || 0}</p>
            </div>
          </div>

          {/* Organized */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(255, 159, 28, 0.12), 0 4px 12px rgba(255, 159, 28, 0.08)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF9F1C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-[#FF9F1C] to-[#E68A00] rounded-lg flex items-center justify-center mb-3" style={{ boxShadow: '0 6px 16px rgba(255, 159, 28, 0.3)' }}>
                <Target className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Organized</h3>
              <p className="text-3xl font-black bg-gradient-to-br from-[#FF9F1C] to-[#E68A00] bg-clip-text text-transparent">{user.stats?.games_organized || 0}</p>
            </div>
          </div>

          {/* Attendance */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(20, 184, 166, 0.12), 0 4px 12px rgba(20, 184, 166, 0.08)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-lg flex items-center justify-center mb-3" style={{ boxShadow: '0 6px 16px rgba(20, 184, 166, 0.3)' }}>
                <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Attendance</h3>
              <p className="text-3xl font-black bg-gradient-to-br from-[#14B8A6] to-[#0D9488] bg-clip-text text-transparent">87%</p>
            </div>
          </div>

          {/* Rating */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(74, 20, 140, 0.12), 0 4px 12px rgba(74, 20, 140, 0.08)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#4A148C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] rounded-lg flex items-center justify-center mb-3" style={{ boxShadow: '0 6px 16px rgba(74, 20, 140, 0.3)' }}>
                <Star className="w-5 h-5 text-white fill-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Rating</h3>
              <p className="text-3xl font-black bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] bg-clip-text text-transparent">4.4</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-3xl font-black bg-gradient-to-r from-[#4A148C] to-[#6A1B9A] bg-clip-text text-transparent mb-6">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const colors = ['#4A148C', '#FF9F1C', '#14B8A6'];
              const shadowColors = [
                'rgba(74,20,140,0.12)',
                'rgba(255,159,28,0.12)',
                'rgba(20,184,166,0.12)',
              ];
              const shadowColorsHover = [
                'rgba(74,20,140,0.3)',
                'rgba(255,159,28,0.3)',
                'rgba(20,184,166,0.3)',
              ];
              const i = index % 3;

              return (
                <button
                  key={action.title}
                  onClick={action.action}
                  className="group bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 hover:scale-105 hover:-translate-y-2 transition-all duration-300 text-left relative overflow-hidden"
                  style={{
                    boxShadow: `0 10px 30px ${shadowColors[i]}, 0 4px 12px ${shadowColors[i]}`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${colors[i]}, ${colors[i]}dd)`,
                        boxShadow: `0 6px 16px ${shadowColorsHover[i]}`,
                      }}
                    >
                      <Icon className="w-5 h-5 text-white stroke-[2.5]" />
                    </div>

                    <h3 className="text-base font-black text-gray-900 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-600 font-medium">
                      {action.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
