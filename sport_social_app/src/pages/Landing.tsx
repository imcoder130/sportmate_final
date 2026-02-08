import { useNavigate } from 'react-router-dom';
import { Search, Zap, MessageCircle, Building2, Trophy, Target, Users, Dumbbell } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2F4F7] via-white to-[#E0F2FE]">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 px-6 py-6 bg-white/90 backdrop-blur-xl border-b border-gray-200" style={{ boxShadow: '0 10px 30px rgba(74, 20, 140, 0.1)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] rounded-lg flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer" style={{ boxShadow: '0 8px 20px rgba(74, 20, 140, 0.4), 0 4px 10px rgba(74, 20, 140, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.2)' }}>
              <span className="text-white text-lg font-bold">SF</span>
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-[#4A148C] to-[#6A1B9A] bg-clip-text text-transparent">
              SportFinder
            </span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 bg-white text-[#4A148C] rounded-lg font-bold transition-all duration-300 border-2 border-[#4A148C] hover:bg-[#4A148C] hover:text-white hover:-translate-y-1"
            style={{ boxShadow: '0 4px 15px rgba(74, 20, 140, 0.2)' }}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-block">
                <span className="px-4 py-2 bg-gradient-to-r from-[#FF9F1C] to-[#FFB84D] text-white rounded-lg text-xs font-bold uppercase tracking-wide" style={{ boxShadow: '0 8px 20px rgba(255, 159, 28, 0.4), 0 4px 10px rgba(255, 159, 28, 0.2)' }}>
                  Find Players. Book Turfs. Play Sports.
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                Play Sports With
                <span className="bg-gradient-to-r from-[#4A148C] via-[#6A1B9A] to-[#8B5CF6] bg-clip-text text-transparent block mt-2" style={{ textShadow: '0 2px 20px rgba(74, 20, 140, 0.2)' }}>
                  People Nearby
                </span>
              </h1>
              
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                Join games instantly, no friends needed. Find players, book turfs, 
                and coordinate matches—all in one app.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-gradient-to-r from-[#4A148C] to-[#6A1B9A] text-white rounded-lg font-bold text-base transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group"
                  style={{ boxShadow: '0 10px 30px rgba(74, 20, 140, 0.4), 0 5px 15px rgba(74, 20, 140, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)' }}
                >
                  <span className="relative z-10">Get Started Free</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
                <button className="px-6 py-3 bg-white text-[#14B8A6] rounded-lg font-bold text-base transition-all duration-300 border-2 border-[#14B8A6] hover:bg-[#14B8A6] hover:text-white hover:scale-105 hover:-translate-y-1" style={{ boxShadow: '0 8px 20px rgba(20, 184, 166, 0.2)' }}>
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-6 pt-4">
                
                <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-lg" style={{ boxShadow: '0 8px 20px rgba(74, 20, 140, 0.15)' }}>
                  <div className="text-2xl font-black bg-gradient-to-br from-[#4A148C] to-[#8B5CF6] bg-clip-text text-transparent">500+</div>
                  <div className="text-xs text-gray-600 font-bold">Turfs Listed</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-lg" style={{ boxShadow: '0 8px 20px rgba(255, 159, 28, 0.15)' }}>
                  <div className="text-2xl font-black bg-gradient-to-br from-[#FF9F1C] to-[#FFB84D] bg-clip-text text-transparent">50k+</div>
                  <div className="text-xs text-gray-600 font-bold">Games Played</div>
                </div>
              </div>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {/* Card 1 */}
                <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl border-2 border-gray-100 hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(74, 20, 140, 0.12), 0 4px 12px rgba(74, 20, 140, 0.08)' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4A148C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-11 h-11 bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] rounded-lg flex items-center justify-center mb-3 relative" style={{ boxShadow: '0 6px 16px rgba(74, 20, 140, 0.3)' }}>
                    <Search className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-black text-gray-900 mb-1 text-base relative">Find Games</h3>
                  <p className="text-xs text-gray-600 font-medium relative">Discover nearby matches</p>
                </div>

                {/* Card 2 */}
                <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl border-2 border-gray-100 hover:scale-105 hover:-translate-y-2 transition-all duration-300 mt-6 cursor-pointer relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(255, 159, 28, 0.12), 0 4px 12px rgba(255, 159, 28, 0.08)' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF9F1C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-11 h-11 bg-gradient-to-br from-[#FF9F1C] to-[#FFB84D] rounded-lg flex items-center justify-center mb-3 relative" style={{ boxShadow: '0 6px 16px rgba(255, 159, 28, 0.3)' }}>
                    <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-black text-gray-900 mb-1 text-base relative">Join Instantly</h3>
                  <p className="text-xs text-gray-600 font-medium relative">No approval needed</p>
                </div>

                {/* Card 3 */}
                <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl border-2 border-gray-100 hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(20, 184, 166, 0.12), 0 4px 12px rgba(20, 184, 166, 0.08)' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-11 h-11 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-lg flex items-center justify-center mb-3 relative" style={{ boxShadow: '0 6px 16px rgba(20, 184, 166, 0.3)' }}>
                    <MessageCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-black text-gray-900 mb-1 text-base relative">Group Chat</h3>
                  <p className="text-xs text-gray-600 font-medium relative">Coordinate with players</p>
                </div>

                {/* Card 4 */}
                <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl border-2 border-gray-100 hover:scale-105 hover:-translate-y-2 transition-all duration-300 mt-6 cursor-pointer relative overflow-hidden group" style={{ boxShadow: '0 10px 30px rgba(74, 20, 140, 0.12), 0 4px 12px rgba(74, 20, 140, 0.08)' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4A148C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-11 h-11 bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] rounded-lg flex items-center justify-center mb-3 relative" style={{ boxShadow: '0 6px 16px rgba(74, 20, 140, 0.3)' }}>
                    <Building2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-black text-gray-900 mb-1 text-base relative">Book Turfs</h3>
                  <p className="text-xs text-gray-600 font-medium relative">Reserve venues easily</p>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] text-white px-4 py-2 rounded-lg font-black text-xs animate-pulse" style={{ boxShadow: '0 8px 24px rgba(20, 184, 166, 0.4), 0 4px 12px rgba(20, 184, 166, 0.3)' }}>
                100% Free
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sports Icons */}
      <section className="py-16 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl font-black bg-gradient-to-r from-[#4A148C] to-[#6A1B9A] bg-clip-text text-transparent mb-12">
            Popular Sports
          </h2>
          <div className="flex flex-wrap justify-center gap-5">
            {[
              { name: 'Cricket', icon: Trophy, color: '#4A148C', shadowColor: 'rgba(74, 20, 140, 0.3)' },
              { name: 'Football', icon: Target, color: '#FF9F1C', shadowColor: 'rgba(255, 159, 28, 0.3)' },
              { name: 'Basketball', icon: Users, color: '#14B8A6', shadowColor: 'rgba(20, 184, 166, 0.3)' },
              { name: 'Badminton', icon: Dumbbell, color: '#4A148C', shadowColor: 'rgba(74, 20, 140, 0.3)' },
              { name: 'Tennis', icon: Target, color: '#FF9F1C', shadowColor: 'rgba(255, 159, 28, 0.3)' },
              { name: 'Volleyball', icon: Users, color: '#14B8A6', shadowColor: 'rgba(20, 184, 166, 0.3)' },
            ].map((sport) => {
              const Icon = sport.icon;
              return (
              <div
                key={sport.name}
                className="flex flex-col items-center gap-2 p-5 bg-white rounded-xl border-2 border-gray-100 hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                style={{ boxShadow: `0 8px 24px ${sport.shadowColor}, 0 4px 12px ${sport.shadowColor}` }}
              >
                <div className="w-14 h-14 rounded-lg flex items-center justify-center shadow-inner" style={{ background: `linear-gradient(135deg, ${sport.color} 0%, ${sport.color}dd 100%)`, boxShadow: `0 6px 16px ${sport.shadowColor}, inset 0 2px 4px rgba(255, 255, 255, 0.2)` }}>
                  <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-bold text-gray-800 text-sm">{sport.name}</span>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#4A148C] via-[#6A1B9A] to-[#8B5CF6] rounded-2xl p-10 text-center relative overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(74, 20, 140, 0.5), 0 10px 30px rgba(74, 20, 140, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white mb-3" style={{ textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>
              Ready to Play?
            </h2>
            <p className="text-lg text-white/95 mb-8 font-medium">
              Join thousands of players finding games every day
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-4 bg-white text-[#4A148C] rounded-lg font-black text-base hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              style={{ boxShadow: '0 15px 40px rgba(255, 255, 255, 0.3), 0 8px 20px rgba(255, 255, 255, 0.2)' }}
            >
              <span className="relative z-10">Start Playing Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t-2 border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p className="font-bold text-sm">© 2026 SportFinder. Built for players who love the game.</p>
        </div>
      </footer>
    </div>
  );
}
