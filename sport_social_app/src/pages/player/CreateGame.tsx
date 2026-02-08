import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameAPI } from '../../api';
import { ArrowLeft, Plus, MapPin, Calendar, Clock, Users, FileText, Navigation } from 'lucide-react';

export default function CreateGame() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    sport: 'Football',
    playersNeeded: 5,
    location: '',
    latitude: '',
    longitude: '',
    description: '',
    date: '',
    time: '',
  });

  useEffect(() => {
    // Get user's current location on component mount
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          console.log('📍 Current Location for Game:', {
            latitude: lat,
            longitude: lng,
            accuracy: position.coords.accuracy
          });
          
          setFormData((prev) => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString(),
          }));
          setLocationLoading(false);
        },
        (error) => {
          console.error('❌ Location Error:', error.message);
          setLocationLoading(false);
        }
      );
    } else {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('user') || '{}').id;
      
      if (!userId) {
        setError('User not logged in. Please log in again.');
        setLoading(false);
        return;
      }

      console.log('Creating game with user ID:', userId);
      
      const response = await gameAPI.createGame({
        user_id: userId,
        sport: formData.sport,
        players_needed: formData.playersNeeded,
        location: {
          lat: parseFloat(formData.latitude),
          lng: parseFloat(formData.longitude),
          address: formData.location,
        },
        description: formData.description,
        date: formData.date,
        time: formData.time,
      });

      console.log('Game created successfully:', response);
      navigate('/player/my-games');
    } catch (err: any) {
      console.error('Error creating game:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to create game. Please try again.';
      
      // Provide helpful message for group limit error
      if (errorMessage.includes('maximum') && errorMessage.includes('active groups')) {
        setError('⚠️ You\'ve reached the maximum of 3 active games/groups. Please delete or leave an existing game before creating a new one.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const sports = ['Football', 'Cricket', 'Basketball', 'Badminton', 'Tennis', 'Volleyball'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2F4F7] via-white to-[#E0F2FE]">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-xl border-b-2 border-[#4A148C] sticky top-0 z-50" style={{ boxShadow: '0 8px 20px rgba(74, 20, 140, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)' }}>
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/player/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all hover:scale-110"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" strokeWidth={2.5} />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] rounded-lg flex items-center justify-center" style={{ boxShadow: '0 8px 20px rgba(74, 20, 140, 0.3), inset 0 2px 4px rgba(255,255,255,0.2)' }}>
                <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-black bg-gradient-to-r from-[#4A148C] to-[#6A1B9A] bg-clip-text text-transparent">Create New Game</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-100 relative overflow-hidden" style={{ boxShadow: '0 15px 40px rgba(74, 20, 140, 0.12), 0 8px 20px rgba(74, 20, 140, 0.08)' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#4A148C]/5 to-transparent pointer-events-none"></div>
          
          <div className="relative">
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] rounded-xl mb-3" style={{ boxShadow: '0 10px 25px rgba(74, 20, 140, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)' }}>
                <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-[#4A148C] to-[#6A1B9A] bg-clip-text text-transparent mb-1">Organize a Match</h2>
              <p className="text-sm text-gray-600 font-medium">Fill in the details to find players</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sport Selection & Players Needed */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                  Select Sport
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {sports.map((sport) => (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => setFormData({ ...formData, sport })}
                      className={`p-2 rounded-lg border-2 transition-all font-bold text-xs ${
                        formData.sport === sport
                          ? 'border-[#4A148C] bg-gradient-to-br from-[#4A148C] to-[#6A1B9A] text-white shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                      }`}
                      style={formData.sport === sport ? { boxShadow: '0 6px 16px rgba(74, 20, 140, 0.3)' } : {}}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#4A148C]" strokeWidth={2.5} />
                  Players
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.playersNeeded}
                  onChange={(e) => setFormData({ ...formData, playersNeeded: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#4A148C] focus:outline-none transition-all font-bold text-gray-900"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#4A148C]" strokeWidth={2.5} />
                  Location
                </label>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="flex items-center gap-1 text-xs px-2 py-1 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] text-white rounded-lg hover:scale-105 transition-all disabled:opacity-50 font-bold"
                  style={{ boxShadow: '0 4px 10px rgba(20, 184, 166, 0.3)' }}
                >
                  <Navigation className="w-3 h-3" strokeWidth={2.5} />
                  {locationLoading ? 'Locating...' : 'My Location'}
                </button>
              </div>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#4A148C] focus:outline-none transition-all font-medium text-gray-900"
                placeholder="e.g., Central Park, New York"
                required
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#FF9F1C]" strokeWidth={2.5} />
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#4A148C] focus:outline-none transition-all font-bold text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#14B8A6]" strokeWidth={2.5} />
                  Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#4A148C] focus:outline-none transition-all font-bold text-gray-900"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <FileText className="w-3 h-3 text-[#4A148C]" strokeWidth={2.5} />
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#4A148C] focus:outline-none transition-all resize-none font-medium text-gray-900"
                placeholder="Add details about the game, skill level, rules, etc."
                required
              />
            </div>

            {/* Hidden Coordinate Fields */}
            <input type="hidden" value={formData.latitude} required />
            <input type="hidden" value={formData.longitude} required />

            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-xs text-red-700 font-bold">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigate('/player/dashboard')}
                className="flex-1 py-2.5 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-black hover:bg-gray-50 hover:scale-105 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#4A148C] to-[#6A1B9A] text-white rounded-lg font-black hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                style={{ boxShadow: '0 10px 30px rgba(74, 20, 140, 0.3), 0 5px 15px rgba(74, 20, 140, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)' }}
              >
                {loading ? 'Creating...' : 'Create Game'}
              </button>
            </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
