import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { turfAPI } from '../../api';

export default function CreateTurf() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    sports: ['Football'],
    address: '',
    latitude: '',
    longitude: '',
    pricePerHour: '',
    openingTime: '',
    closingTime: '',
    facilities: '',
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
          
          console.log('📍 Turf Location:', {
            latitude: lat,
            longitude: lng
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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      await turfAPI.create({
        owner_id: user.id,
        name: formData.name,
        sports: formData.sports,
        location: {
          lat: parseFloat(formData.latitude),
          lng: parseFloat(formData.longitude),
          address: formData.address,
        },
        pricing: {
          per_hour: parseFloat(formData.pricePerHour),
        },
        timings: {
          opening: formData.openingTime,
          closing: formData.closingTime,
        },
        facilities: formData.facilities ? formData.facilities.split(',').map(f => f.trim()) : [],
      });

      navigate('/turf-owner/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create turf. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sports = ['Football', 'Cricket', 'Basketball', 'Badminton', 'Tennis', 'Volleyball'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/turf-owner/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Add New Turf</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4">
              <span className="text-4xl">🏟️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Register Your Turf</h2>
            <p className="text-gray-600 mt-2">List your sports facility for bookings</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Turf Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                placeholder="Champions Arena"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sports Supported
              </label>
              <div className="grid grid-cols-3 gap-3">
                {sports.map((sport) => (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        sports: prev.sports.includes(sport)
                          ? prev.sports.filter(s => s !== sport)
                          : [...prev.sports, sport]
                      }));
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.sports.includes(sport)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-sm">{sport}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                placeholder="123 Main St, City"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Location Coordinates
                </label>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="text-sm px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all disabled:opacity-50"
                >
                  {locationLoading ? '📍 Getting...' : '📍 Use My Location'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    placeholder="Latitude (40.7128)"
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    placeholder="Longitude (-74.0060)"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price per Hour ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.pricePerHour}
                onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                placeholder="50"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Opening Time
                </label>
                <input
                  type="time"
                  value={formData.openingTime}
                  onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Closing Time
                </label>
                <input
                  type="time"
                  value={formData.closingTime}
                  onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Facilities (comma-separated)
              </label>
              <input
                type="text"
                value={formData.facilities}
                onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                placeholder="Floodlights, Parking, Changing Rooms"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/turf-owner/dashboard')}
                className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Turf'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
