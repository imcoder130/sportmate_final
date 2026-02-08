import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI, ratingsAPI } from '../../api';
import type { User } from '../../types';

interface Rating {
  rating_id: string;
  rater_id: string;
  rater_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function UserProfile() {
  const { userId: paramUserId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    skill_level: '',
    sports_interests: [] as string[],
  });

  // Rating form
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const currentUserId = localStorage.getItem('userId') || '';
  const profileUserId = paramUserId || currentUserId;
  const isOwnProfile = profileUserId === currentUserId;

  useEffect(() => {
    if (profileUserId) {
      fetchUserProfile();
      fetchUserRatings();
    }
  }, [profileUserId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching profile for user:', profileUserId);
      const userData = await userAPI.getUser(profileUserId);
      console.log('User profile data received:', userData);
      setUser(userData);
      setEditForm({
        name: userData.name || '',
        bio: userData.bio || '',
        skill_level: userData.skill_level || '',
        sports_interests: userData.sports_interests || [],
      });
    } catch (err: any) {
      console.error('Failed to fetch user profile:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRatings = async () => {
    try {
      const ratingsData = await ratingsAPI.getUserRatings(profileUserId);
      setRatings(ratingsData.ratings || []);
      setAverageRating(ratingsData.average_rating || 0);
    } catch (err: any) {
      console.error('Failed to fetch ratings:', err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await userAPI.updateProfile(currentUserId, editForm);
      await fetchUserProfile();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOwnProfile) return;

    try {
      setSubmittingRating(true);
      // Note: Ratings require a post_id context. This should ideally be done from the game details page.
      // For now, using a placeholder. Consider moving rating functionality to game-specific pages.
      await ratingsAPI.addRating({
        post_id: '', // TODO: Should be provided from game context
        rater_id: currentUserId,
        rated_user_id: profileUserId,
        overall_rating: newRating,
        review: newComment,
      });
      setShowRatingForm(false);
      setNewRating(5);
      setNewComment('');
      await fetchUserRatings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => navigate('/player/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="text-2xl font-bold border-b-2 border-blue-500 focus:outline-none"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
                )}
                <p className="text-gray-600">{user.email}</p>
                {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
              </div>
            </div>
            {isOwnProfile && (
              <button
                onClick={() => {
                  if (isEditing) {
                    handleUpdateProfile();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {isEditing ? 'Save' : 'Edit Profile'}
              </button>
            )}
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Bio */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Bio</h3>
            {isEditing ? (
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-600">{user.bio || 'No bio yet'}</p>
            )}
          </div>

          {/* Skill Level */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Skill Level</h3>
            {isEditing ? (
              <select
                value={editForm.skill_level}
                onChange={(e) => setEditForm({ ...editForm, skill_level: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="professional">Professional</option>
              </select>
            ) : (
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                {user.skill_level || 'Not specified'}
              </span>
            )}
          </div>

          {/* Sports Interests */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Sports Interests</h3>
            <div className="flex flex-wrap gap-2">
              {user.sports_interests && user.sports_interests.length > 0 ? (
                user.sports_interests.map((sport: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                  >
                    {sport}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No sports interests specified</p>
              )}
            </div>
          </div>

          {/* Location */}
          {user.location && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
              <p className="text-gray-600">{user.location}</p>
            </div>
          )}
        </div>

        {/* Ratings Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Ratings</h2>
              {ratings.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-3xl font-bold text-yellow-500">
                    {averageRating.toFixed(1)}
                  </span>
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < Math.round(averageRating) ? '★' : '☆'}</span>
                    ))}
                  </div>
                  <span className="text-gray-600">({ratings.length} ratings)</span>
                </div>
              )}
            </div>
            {!isOwnProfile && (
              <button
                onClick={() => setShowRatingForm(!showRatingForm)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {showRatingForm ? 'Cancel' : 'Add Rating'}
              </button>
            )}
          </div>

          {/* Rating Form */}
          {showRatingForm && (
            <form onSubmit={handleSubmitRating} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rating (1-5 stars)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`text-3xl ${
                        star <= newRating ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Share your experience..."
                />
              </div>
              <button
                type="submit"
                disabled={submittingRating}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
              >
                {submittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </form>
          )}

          {/* Ratings List */}
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating.rating_id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-800">{rating.rater_name}</p>
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < rating.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-2">{rating.comment}</p>
                <p className="text-xs text-gray-500">
                  {new Date(rating.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}

            {ratings.length === 0 && (
              <p className="text-center text-gray-500 py-8">No ratings yet</p>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('/player/dashboard')}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
