import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { turfAPI } from '../../api';
import type { Turf } from '../../types';

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function TurfDetails() {
  const { turfId } = useParams<{ turfId: string }>();
  const navigate = useNavigate();
  const [turf, setTurf] = useState<Turf | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  const userId = localStorage.getItem('userId') || '';

  console.log('TurfDetails - Component initialized with:', { turfId, userId: userId || 'NOT FOUND' });

  useEffect(() => {
    if (turfId) {
      fetchTurfDetails();
    }
  }, [turfId]);

  useEffect(() => {
    if (turfId && selectedDate) {
      fetchAvailability();
    }
  }, [turfId, selectedDate]);

  const fetchTurfDetails = async () => {
    if (!turfId) return;

    try {
      setLoading(true);
      const turfData = await turfAPI.getTurfDetails(turfId);
      setTurf(turfData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch turf details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    if (!turfId || !selectedDate) return;

    try {
      console.log('Fetching availability for:', { turfId, selectedDate });
      const availabilityData = await turfAPI.checkAvailability(turfId, selectedDate);
      console.log('Availability data received:', availabilityData);
      setAvailability(availabilityData.available_slots || []);
    } catch (err: any) {
      console.error('Failed to fetch availability:', err);
      console.error('Availability error response:', err.response?.data);
      setAvailability([]);
    }
  };

  const handleBookTurf = async () => {
    if (!turfId || !userId || !selectedDate || !selectedTimeSlot) {
      console.error('Missing required fields:', { turfId, userId, selectedDate, selectedTimeSlot });
      
      if (!userId) {
        setError('User not logged in. Please log in first.');
        return;
      }
      if (!selectedTimeSlot) {
        setError('Please select a time slot.');
        return;
      }
      return;
    }

    try {
      setBookingLoading(true);
      setError(''); // Clear previous errors
      
      console.log('Booking turf with data:', {
        turfId,
        user_id: userId,
        date: selectedDate,
        time_slot: selectedTimeSlot,
      });
      
      const response = await turfAPI.bookTurf(turfId, {
        user_id: userId,
        date: selectedDate,
        time_slot: selectedTimeSlot,
      });
      
      console.log('Booking successful:', response);
      alert('Turf booked successfully!');
      navigate('/player/turfs');
    } catch (err: any) {
      console.error('Booking error:', err);
      console.error('Error response:', err.response);
      
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Failed to book turf';
      
      setError(`Booking failed: ${errorMessage}`);
      alert(`Booking failed: ${errorMessage}`);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading turf details...</div>
      </div>
    );
  }

  if (error && !turf) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => navigate('/player/turfs')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Turfs
          </button>
        </div>
      </div>
    );
  }

  if (!turf) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Turf Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{turf.name}</h1>
            <p className="text-xl text-blue-600 font-semibold">{turf.sport.toUpperCase()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-semibold">{turf.location?.address || 'Location not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-semibold text-green-600">₹{turf.pricing?.per_hour}/hour</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Opening Hours</p>
              <p className="font-semibold">
                {turf.timings?.opening} - {turf.timings?.closing}
              </p>
            </div>
            {turf.owner_id && (
              <div>
                <p className="text-sm text-gray-500">Owner ID</p>
                <p className="font-semibold text-sm">{turf.owner_id}</p>
              </div>
            )}
          </div>

          {/* Features */}
          {turf.features && turf.features.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Features</p>
              <div className="flex flex-wrap gap-2">
                {turf.features.map((feature: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          {turf.images && turf.images.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Images</p>
              <div className="grid grid-cols-2 gap-2">
                {turf.images.map((image: string, idx: number) => (
                  <img
                    key={idx}
                    src={image}
                    alt={`${turf.name} ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Book This Turf</h2>

          {!userId && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-semibold">⚠️ You are not logged in!</p>
              <p className="text-sm text-red-500 mt-1">Please log in to book this turf.</p>
              <button
                onClick={() => navigate('/login/player')}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Log In
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Date Picker */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Time Slots */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Available Time Slots
            </label>
            <div className="grid grid-cols-3 gap-2">
              {availability.length > 0 ? (
                availability.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && setSelectedTimeSlot(slot.time)}
                    disabled={!slot.available}
                    className={`py-3 rounded-lg font-semibold ${
                      selectedTimeSlot === slot.time
                        ? 'bg-blue-500 text-white'
                        : slot.available
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {slot.time}
                    {!slot.available && <div className="text-xs">Booked</div>}
                  </button>
                ))
              ) : (
                <p className="col-span-3 text-center text-gray-500 py-8">
                  Loading availability...
                </p>
              )}
            </div>
          </div>

          {/* Booking Summary */}
          {selectedTimeSlot && userId && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Booking Summary</h3>
              <p className="text-sm text-gray-600">Date: {selectedDate}</p>
              <p className="text-sm text-gray-600">Time: {selectedTimeSlot}</p>
              <p className="text-sm text-gray-600">Price: ₹{turf.pricing?.per_hour}</p>
              <p className="text-xs text-gray-500 mt-2">User ID: {userId}</p>
            </div>
          )}

          {/* Book Button */}
          <button
            onClick={handleBookTurf}
            disabled={!selectedTimeSlot || bookingLoading || !userId}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {bookingLoading ? 'Booking...' : !userId ? 'Log In to Book' : 'Confirm Booking'}
          </button>
        </div>

        <button
          onClick={() => navigate('/player/turfs')}
          className="mt-6 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Back to Turfs
        </button>
      </div>
    </div>
  );
}
