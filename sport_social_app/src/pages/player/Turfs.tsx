import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { turfAPI } from '../../api';
import type { Turf } from '../../types';

export default function Turfs() {
  const navigate = useNavigate();
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState({ lat: 0, lng: 0 });
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedSport, setSelectedSport] = useState('');

  const sports = ['cricket', 'football', 'basketball', 'badminton', 'tennis', 'volleyball'];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation.lat && userLocation.lng) {
      fetchNearbyTurfs();
    }
  }, [userLocation, radiusKm, selectedSport]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          console.log('Location:', location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Failed to get location. Using default location.');
          // Default location (e.g., Mumbai)
          setUserLocation({ lat: 19.076, lng: 72.8777 });
        }
      );
    } else {
      setError('Geolocation not supported. Using default location.');
      setUserLocation({ lat: 19.076, lng: 72.8777 });
    }
  };

  const fetchNearbyTurfs = async () => {
    try {
      setLoading(true);
      const response = await turfAPI.searchNearby({
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius_km: radiusKm,
        sport: selectedSport || undefined,
      });
      setTurfs(response.turfs || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch turfs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/player/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Book a Turf</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm">
                📍 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Radius (km)
              </label>
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sport
              </label>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sports</option>
                {sports.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport.charAt(0).toUpperCase() + sport.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={fetchNearbyTurfs}
            className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Refresh Results
          </button>
        </div>

        {/* Turfs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading turfs...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {turfs.map((turf) => {
              const turfId = turf.turf_id || turf.id;
              return (
              <div
                key={turfId}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                onClick={() => navigate(`/player/turf/${turfId}`)}
              >
                {turf.images && turf.images.length > 0 ? (
                  <img
                    src={turf.images[0]}
                    alt={turf.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                    <span className="text-white text-6xl">🏟️</span>
                  </div>
                )}

                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{turf.name}</h3>
                  {turf.sport && (
                    <p className="text-sm text-blue-600 font-semibold mb-2">
                      {turf.sport.toUpperCase()}
                    </p>
                  )}
                  {turf.sports && turf.sports.length > 0 && !turf.sport && (
                    <p className="text-sm text-blue-600 font-semibold mb-2">
                      {turf.sports.map(s => s.toUpperCase()).join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mb-2">
                    📍 {turf.location?.address || 'Location not specified'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">
                      ₹{turf.pricing?.per_hour || 'N/A'}/hr
                    </span>
                    <span className="text-sm text-gray-500">
                      {turf.timings?.opening || 'N/A'} - {turf.timings?.closing || 'N/A'}
                    </span>
                  </div>
                  {turf.features && turf.features.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {turf.features.slice(0, 3).map((feature: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              );
            })}

            {turfs.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">🏟️</div>
                <p className="text-gray-600">No turfs found in your area</p>
                <p className="text-sm text-gray-500 mt-2">Try increasing the search radius</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
