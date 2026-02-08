import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { turfAPI } from '../../api';
import type { Turf } from '../../types';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Booking {
  id?: string;
  booking_id: string;
  user_id: string;
  user_name?: string;
  group_id: string;
  date: string;
  time_slot: string;
  status?: string;
  created_at: string;
}

export default function TurfDetails() {
  const { turfId } = useParams<{ turfId: string }>();
  const navigate = useNavigate();
  const [turf, setTurf] = useState<Turf | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [slotAvailability, setSlotAvailability] = useState<'checking' | 'available' | 'unavailable' | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const userId = localStorage.getItem('userId') || '';

  console.log('TurfDetails - Component initialized with:', { turfId, userId: userId || 'NOT FOUND' });

  useEffect(() => {
    if (!turfId) {
      setError('Invalid turf ID');
      setLoading(false);
      return;
    }
    
    fetchTurfDetails();
    if (userId) {
      fetchUserGroups();
      fetchUserBookings();
    }
  }, [turfId, userId]);

  useEffect(() => {
    if (!turfId) return;
    if (turfId && selectedDate) {
      // Reset time selection when date changes
      setStartTime('');
      setEndTime('');
      setSelectedTimeSlot('');
      setSlotAvailability(null);
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

  const fetchUserGroups = async () => {
    if (!userId) return;
    try {
      const { groups } = await import('../../api').then(m => m.groupAPI.getUserGroups(userId));
      setUserGroups(groups || []);
    } catch (err) {
      console.error('Failed to fetch user groups:', err);
      setUserGroups([]);
    }
  };

  const fetchUserBookings = async () => {
    if (!userId || !turfId) return;
    try {
      console.log('Fetching user bookings from localStorage for turf:', turfId);
      
      // Get bookings from localStorage
      const userBookingsKey = `bookings_${turfId}_${userId}`;
      const savedBookings = localStorage.getItem(userBookingsKey);
      
      if (savedBookings) {
        const bookings = JSON.parse(savedBookings);
        console.log('Found bookings in localStorage:', bookings);
        
        // Filter out expired bookings
        const validBookings = bookings.filter((booking: Booking) => {
          const [startTime] = booking.time_slot.split('-');
          const [hours, minutes] = startTime.split(':').map(Number);
          const bookingDateTime = new Date(booking.date);
          bookingDateTime.setHours(hours, minutes, 0, 0);
          return bookingDateTime > new Date();
        });
        
        // Update localStorage with only valid bookings
        if (validBookings.length !== bookings.length) {
          localStorage.setItem(userBookingsKey, JSON.stringify(validBookings));
        }
        
        setUserBookings(validBookings);
      } else {
        console.log('No bookings found in localStorage');
        setUserBookings([]);
      }
    } catch (err) {
      console.error('Failed to fetch user bookings:', err);
      setUserBookings([]);
    }
  };

  const fetchAvailability = async () => {
    if (!turfId || !selectedDate) return;

    try {
      console.log('Fetching availability for:', { turfId, selectedDate });
      const availabilityData = await turfAPI.checkAvailability(turfId, selectedDate);
      console.log('Availability data received:', availabilityData);
      setAvailability(availabilityData.slots || availabilityData.available_slots || []);
    } catch (err: any) {
      console.error('Failed to fetch availability:', err);
      console.error('Availability error response:', err.response?.data);
      setAvailability([]);
    }
  };

  const checkCustomSlotAvailability = () => {
    if (!startTime || !endTime) {
      setError('Please enter both start and end time');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be after start time');
      setSlotAvailability('unavailable');
      return;
    }

    setError('');
    const customSlot = `${startTime}-${endTime}`;
    setSelectedTimeSlot(customSlot);
    setSlotAvailability('checking');

    // Check against existing bookings from localStorage
    setTimeout(() => {
      const allBookingsStr = localStorage.getItem(`all_bookings_${turfId}`);
      const allBookings = allBookingsStr ? JSON.parse(allBookingsStr) : [];
      
      // Check if slot conflicts with any existing booking on the same date
      const isBooked = allBookings.some((booking: Booking) => {
        if (booking.date !== selectedDate) return false;
        
        const [bookingStart, bookingEnd] = booking.time_slot.split('-');
        if (!bookingStart || !bookingEnd) return false;
        
        // Check for time overlap
        return (
          (startTime >= bookingStart && startTime < bookingEnd) ||
          (endTime > bookingStart && endTime <= bookingEnd) ||
          (startTime <= bookingStart && endTime >= bookingEnd)
        );
      });

      setSlotAvailability(isBooked ? 'unavailable' : 'available');
    }, 500);
  };

  const handleBookTurf = async () => {
    if (!turfId || !userId || !selectedDate || !selectedTimeSlot || !selectedGroupId) {
      console.error('Missing required fields:', { turfId, userId, selectedDate, selectedTimeSlot, selectedGroupId });
      
      if (!userId) {
        setError('User not logged in. Please log in first.');
        return;
      }
      if (!selectedTimeSlot) {
        setError('Please select a time slot.');
        return;
      }
      if (!selectedGroupId) {
        setError('Please select a group for this booking.');
        return;
      }
      return;
    }

    try {
      setBookingLoading(true);
      setError('');
      
      console.log('Creating booking with localStorage:', {
        turfId,
        user_id: userId,
        group_id: selectedGroupId,
        date: selectedDate,
        time_slot: selectedTimeSlot,
      });
      
      // Create booking using localStorage
      const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newBooking: Booking = {
        booking_id: bookingId,
        id: bookingId,
        user_id: userId,
        group_id: selectedGroupId,
        date: selectedDate,
        time_slot: selectedTimeSlot,
        status: 'confirmed',
        created_at: new Date().toISOString(),
      };
      
      // Save to user's bookings
      const userBookingsKey = `bookings_${turfId}_${userId}`;
      const existingUserBookingsStr = localStorage.getItem(userBookingsKey);
      const existingUserBookings = existingUserBookingsStr ? JSON.parse(existingUserBookingsStr) : [];
      existingUserBookings.push(newBooking);
      localStorage.setItem(userBookingsKey, JSON.stringify(existingUserBookings));
      
      // Save to all bookings for availability checking
      const allBookingsKey = `all_bookings_${turfId}`;
      const allBookingsStr = localStorage.getItem(allBookingsKey);
      const allBookings = allBookingsStr ? JSON.parse(allBookingsStr) : [];
      allBookings.push(newBooking);
      localStorage.setItem(allBookingsKey, JSON.stringify(allBookings));
      
      console.log('Booking saved successfully');
      
      setShowSuccess(true);
      setSelectedTimeSlot('');
      setSelectedGroupId('');
      setStartTime('');
      setEndTime('');
      setSlotAvailability(null);
      
      // Refresh bookings
      fetchUserBookings();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(`Booking failed: ${err.message || 'Unknown error'}`);
      alert(`Booking failed: ${err.message || 'Unknown error'}`);
    } finally {
      setBookingLoading(false);
    }
  };

  const canCancelBooking = (bookingDate: string, timeSlot: string): boolean => {
    const now = new Date();
    const [startTime] = timeSlot.split('-');
    const [hours, minutes] = startTime.split(':').map(Number);
    const bookingDateTime = new Date(bookingDate);
    bookingDateTime.setHours(hours, minutes, 0, 0);
    
    // Can cancel if booking is more than 1 hour away
    const hoursDiff = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 1;
  };

  const handleCancelBooking = async (bookingId: string, bookingDate: string, timeSlot: string) => {
    if (!canCancelBooking(bookingDate, timeSlot)) {
      alert('Cannot cancel booking within 1 hour of start time');
      return;
    }

    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      // Remove from user's bookings
      const userBookingsKey = `bookings_${turfId}_${userId}`;
      const existingUserBookingsStr = localStorage.getItem(userBookingsKey);
      if (existingUserBookingsStr) {
        const existingUserBookings = JSON.parse(existingUserBookingsStr);
        const updatedUserBookings = existingUserBookings.filter((b: Booking) => 
          b.booking_id !== bookingId && b.id !== bookingId
        );
        localStorage.setItem(userBookingsKey, JSON.stringify(updatedUserBookings));
      }
      
      // Remove from all bookings
      const allBookingsKey = `all_bookings_${turfId}`;
      const allBookingsStr = localStorage.getItem(allBookingsKey);
      if (allBookingsStr) {
        const allBookings = JSON.parse(allBookingsStr);
        const updatedAllBookings = allBookings.filter((b: Booking) => 
          b.booking_id !== bookingId && b.id !== bookingId
        );
        localStorage.setItem(allBookingsKey, JSON.stringify(updatedAllBookings));
      }
      
      alert('Booking cancelled successfully!');
      
      // Refresh bookings
      fetchUserBookings();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to cancel booking';
      alert(`Cancellation failed: ${errorMessage}`);
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
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg animate-pulse">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-800">Booking Successful! 🎉</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your turf has been booked successfully! You can cancel up to 1 hour before the booking time.
                </p>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="flex-shrink-0 text-green-700 hover:text-green-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Turf Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{turf.name}</h1>
            {turf.sport && (
              <p className="text-xl text-blue-600 font-semibold">{turf.sport.toUpperCase()}</p>
            )}
            {turf.sports && turf.sports.length > 0 && !turf.sport && (
              <p className="text-xl text-blue-600 font-semibold">
                {turf.sports.map(s => s.toUpperCase()).join(', ')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-semibold">{turf.location?.address || 'Location not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-semibold text-green-600">₹{turf.pricing?.per_hour || 'N/A'}/hour</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Opening Hours</p>
              <p className="font-semibold">
                {turf.timings?.opening || 'N/A'} - {turf.timings?.closing || 'N/A'}
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

          {/* Group Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Group <span className="text-red-500">*</span>
            </label>
            {userGroups.length > 0 ? (
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a group --</option>
                {userGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name || `Group for ${group.post_id || 'Unknown'}`} ({group.members?.length || 0} members)
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-sm">
                  ⚠️ You need to join a game first to book a turf. 
                  <button
                    onClick={() => navigate('/player/discover')}
                    className="ml-2 text-blue-600 hover:underline font-semibold"
                  >
                    Find Games
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Custom Time Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Your Time Slot
            </label>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setSlotAvailability(null);
                    setSelectedTimeSlot('');
                  }}
                  min={turf.timings?.opening || '06:00'}
                  max={turf.timings?.closing || '22:00'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    setSlotAvailability(null);
                    setSelectedTimeSlot('');
                  }}
                  min={startTime || turf.timings?.opening || '06:00'}
                  max={turf.timings?.closing || '22:00'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <button
              onClick={checkCustomSlotAvailability}
              disabled={!startTime || !endTime}
              className="w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold mb-3"
            >
              Check Availability
            </button>

            {slotAvailability === 'checking' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-blue-700 font-semibold">⏳ Checking availability...</p>
              </div>
            )}

            {slotAvailability === 'available' && (
              <div className="p-3 bg-green-50 border border-green-500 rounded-lg">
                <p className="text-green-700 font-semibold">✓ This time slot is available!</p>
                <p className="text-sm text-green-600 mt-1">{startTime} - {endTime}</p>
              </div>
            )}

            {slotAvailability === 'unavailable' && (
              <div className="p-3 bg-red-50 border border-red-500 rounded-lg">
                <p className="text-red-700 font-semibold">✗ This time slot is not available</p>
                <p className="text-sm text-red-600 mt-1">Please try a different time</p>
              </div>
            )}
          </div>

          {/* Booking Summary */}
          {selectedTimeSlot && userId && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Booking Summary</h3>
              <p className="text-sm text-gray-600">Date: {selectedDate}</p>
              <p className="text-sm text-gray-600">Time: {selectedTimeSlot}</p>
              <p className="text-sm text-gray-600">Price: ₹{turf.pricing?.per_hour || 'N/A'}</p>
              {selectedGroupId && (
                <p className="text-sm text-gray-600">
                  Group: {userGroups.find(g => g.id === selectedGroupId)?.name || 'Selected'}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">User ID: {userId}</p>
            </div>
          )}

          {/* Book Button */}
          <button
            onClick={handleBookTurf}
            disabled={!selectedTimeSlot || !selectedGroupId || slotAvailability !== 'available' || bookingLoading || !userId}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {bookingLoading 
              ? 'Booking...' 
              : !userId 
              ? 'Log In to Book' 
              : !selectedGroupId
              ? 'Select a Group'
              : slotAvailability !== 'available'
              ? 'Check Availability First'
              : 'Confirm Booking'
            }
          </button>
        </div>

        {/* User Bookings Section */}
        {userBookings.length > 0 && userId && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Your Bookings ({userBookings.length})
            </h2>
            <div className="space-y-4">
              {userBookings.map((booking) => {
                const canCancel = canCancelBooking(booking.date, booking.time_slot);
                const bookingId = booking.booking_id || booking.id || '';
                
                return (
                  <div 
                    key={bookingId}
                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-800">📅 {booking.date}</h3>
                          <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                            ✓ CONFIRMED
                          </span>
                        </div>
                        <p className="text-gray-700 font-semibold">⏰ Time: {booking.time_slot}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          👥 Group: {userGroups.find(g => g.id === booking.group_id)?.name || 'Unknown Group'}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Booked on: {new Date(booking.created_at).toLocaleString()}
                        </p>
                      </div>
                      {canCancel ? (
                        <button
                          onClick={() => handleCancelBooking(bookingId, booking.date, booking.time_slot)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-all hover:scale-105"
                        >
                          Cancel
                        </button>
                      ) : (
                        <div className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed text-center">
                          <p className="text-xs">Cannot Cancel</p>
                          <p className="text-xs">(within 1hr)</p>
                        </div>
                      )}
                    </div>
                    {!canCancel && (
                      <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
                        ⚠️ Cancellation is only allowed up to 1 hour before the booking time.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
