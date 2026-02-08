import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameAPI } from '../../api';
import type { Game } from '../../types';
import { ArrowLeft, Search, MapPin, Calendar, Users, Navigation } from 'lucide-react';

export default function Discover() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    latitude: '',
    longitude: '',
    radius: 10,
    sport: '',
  });

  useEffect(() => {
    // Get user's current location on component mount
    getCurrentLocation();
  }, []);

  // Auto-fetch games when location is available
  useEffect(() => {
    if (searchParams.latitude && searchParams.longitude) {
      fetchNearbyGames();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.latitude, searchParams.longitude]);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          console.log('📍 User Location:', {
            latitude: lat,
            longitude: lng,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp).toLocaleString()
          });
          
          setSearchParams((prev) => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString(),
          }));
          setLocationLoading(false);
        },
        (error) => {
          console.error('❌ Location Error:', error.message);
          alert('Could not get your location. Please enter manually.');
          setLocationLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      setLocationLoading(false);
    }
  };

  const fetchNearbyGames = async () => {
    if (!searchParams.latitude || !searchParams.longitude) return;
    
    setLoading(true);
    try {
      const response = await gameAPI.searchNearby({
        lat: parseFloat(searchParams.latitude),
        lng: parseFloat(searchParams.longitude),
        radius_km: searchParams.radius,
        sport: searchParams.sport || undefined,
      });
      setGames(response.posts);
    } catch (err) {
      console.error('Failed to fetch games:', err);
    } finally {
      setLoading(false);
    }
  };

  const sports = ['All', 'Football', 'Cricket', 'Basketball', 'Badminton', 'Tennis', 'Volleyball'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2F4F7] via-white to-[#E0F2FE]">
      <nav className="bg-white/90 backdrop-blur-xl border-b-2 border-[#4A148C] sticky top-0 z-50" style={{ boxShadow: '0 8px 20px rgba(74, 20, 140, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)' }}>
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/player/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all hover:scale-110"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" strokeWidth={2.5} />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] rounded-lg flex items-center justify-center" style={{ boxShadow: '0 8px 20px rgba(74, 20, 140, 0.3), inset 0 2px 4px rgba(255,255,255,0.2)' }}>
              <Search className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-black bg-gradient-to-r from-[#4A148C] to-[#6A1B9A] bg-clip-text text-transparent">Discover Games</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Panel */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 mb-8 border-2 border-gray-100 relative overflow-hidden" style={{ boxShadow: '0 10px 30px rgba(74, 20, 140, 0.12), 0 4px 12px rgba(74, 20, 140, 0.08)' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#4A148C]/5 to-transparent pointer-events-none"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-black bg-gradient-to-r from-[#4A148C] to-[#6A1B9A] bg-clip-text text-transparent">Find Games Nearby</h2>
              <button
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] text-white rounded-lg hover:scale-105 transition-all disabled:opacity-50 font-bold text-sm"
                style={{ boxShadow: '0 6px 16px rgba(20, 184, 166, 0.3)' }}
              >
                <Navigation className="w-4 h-4" strokeWidth={2.5} />
                {locationLoading ? 'Locating...' : 'Use My Location'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div className="md:col-span-1">
                <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Search Radius (km)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter radius in km"
                  value={searchParams.radius}
                  onChange={(e) => setSearchParams({ ...searchParams, radius: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#4A148C] focus:outline-none font-bold text-gray-900"
                />
              </div>
              <div className="md:col-span-2 flex items-end">
                <button
                  onClick={fetchNearbyGames}
                  disabled={loading || !searchParams.latitude || !searchParams.longitude}
                  className="px-4 py-2 bg-gradient-to-r from-[#4A148C] to-[#6A1B9A] text-white rounded-lg font-black hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ boxShadow: '0 10px 30px rgba(74, 20, 140, 0.3), 0 5px 15px rgba(74, 20, 140, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)' }}
                  title="Search Games"
                >
                  <Search className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Sport Filters */}
            <div>
              <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-3">Filter by Sport</label>
              <div className="flex gap-2 flex-wrap">
                {sports.map((sport) => (
                  <button
                    key={sport}
                    onClick={() => setSearchParams({ ...searchParams, sport: sport === 'All' ? '' : sport })}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      (sport === 'All' && !searchParams.sport) || searchParams.sport === sport
                        ? 'bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                    }`}
                    style={(sport === 'All' && !searchParams.sport) || searchParams.sport === sport ? { boxShadow: '0 6px 16px rgba(74, 20, 140, 0.3)' } : {}}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Games List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {games.map((game) => (
            <div 
              key={game.id} 
              className="group bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden"
              onClick={() => navigate(`/player/game/${game.id}`)}
              style={{ boxShadow: '0 10px 30px rgba(74, 20, 140, 0.12), 0 4px 12px rgba(74, 20, 140, 0.08)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#4A148C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">{game.sport || 'Sport'}</h3>
                    <p className="text-xs text-gray-500 font-bold">by {game.user_name || 'Unknown'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-black ${
                    game.status === 'open' ? 'bg-gradient-to-br from-[#14B8A6] to-[#0D9488] text-white' : 'bg-gray-200 text-gray-700'
                  }`} style={game.status === 'open' ? { boxShadow: '0 4px 10px rgba(20, 184, 166, 0.3)' } : {}}>
                    {game.status || 'open'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-700 font-medium">
                    <MapPin className="w-4 h-4 mr-2 text-[#4A148C]" strokeWidth={2.5} />
                    {game.location?.address || 'Location not specified'}
                  </div>
                  <div className="flex items-center text-sm text-gray-700 font-medium">
                    <Calendar className="w-4 h-4 mr-2 text-[#FF9F1C]" strokeWidth={2.5} />
                    {game.date || 'TBD'} at {game.time || 'TBD'}
                  </div>
                  <div className="flex items-center text-sm text-gray-700 font-medium">
                    <Users className="w-4 h-4 mr-2 text-[#14B8A6]" strokeWidth={2.5} />
                    {game.accepted_players?.length || 0}/{game.players_needed || 0} players
                  </div>
                  {game.distance_km && (
                    <div className="flex items-center text-sm font-black">
                      <Navigation className="w-4 h-4 mr-2 text-[#4A148C]" strokeWidth={2.5} />
                      <span className="bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] bg-clip-text text-transparent">
                        {game.distance_km.toFixed(1)} km away
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2 font-medium">{game.description || 'No description provided'}</p>

                <div className="w-full py-2 bg-gradient-to-r from-[#4A148C] to-[#6A1B9A] text-white rounded-lg font-black text-center text-sm group-hover:scale-105 transition-transform" style={{ boxShadow: '0 6px 16px rgba(74, 20, 140, 0.3)' }}>
                  View Details
                </div>
              </div>
            </div>
          ))}
        </div>

        {games.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] rounded-xl flex items-center justify-center mx-auto mb-6" style={{ boxShadow: '0 15px 40px rgba(74, 20, 140, 0.3), 0 8px 20px rgba(74, 20, 140, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.2)' }}>
              <Search className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-3xl font-black bg-gradient-to-r from-[#4A148C] to-[#6A1B9A] bg-clip-text text-transparent mb-2">No games found</h3>
            <p className="text-gray-600 font-medium">Try adjusting your search parameters or check back later</p>
          </div>
        )}
      </main>
    </div>
  );
}
