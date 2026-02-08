import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { friendsAPI, userAPI } from '../../api';

interface Friend {
  user_id: string;
  name: string;
  email: string;
  sports_interests: string[];
  skill_level?: string;
}

interface FriendRequest {
  request_id: string;
  from_user_id: string;
  from_user_name: string;
  from_user_email: string;
  sent_at: string;
}

export default function Friends() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Add friend form
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const userId = localStorage.getItem('userId') || '';

  useEffect(() => {
    if (userId) {
      fetchFriendsData();
    }
  }, [userId]);

  const fetchFriendsData = async () => {
    try {
      setLoading(true);
      const [friendsData, requestsData] = await Promise.all([
        friendsAPI.getFriends(userId),
        friendsAPI.getPendingRequests(userId),
      ]);

      setFriends(friendsData.friends || []);
      setRequests(requestsData.requests || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch friends data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    try {
      setSearching(true);
      setSearchResult(null);
      setError('');

      // Search for user by email (using a simple approach - you might need a dedicated search endpoint)
      // For now, we'll assume the API has a way to get user by email
      // This is a workaround - in real implementation, you'd have a search endpoint
      const response = await userAPI.getUser(searchEmail); // This might need adjustment
      setSearchResult(response);
    } catch (err: any) {
      setError('User not found');
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (toUserId: string) => {
    try {
      setActionLoading(toUserId);
      await friendsAPI.sendRequest(userId, toUserId);
      setSearchResult(null);
      setSearchEmail('');
      alert('Friend request sent!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send friend request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await friendsAPI.acceptRequest(requestId, userId);
      await fetchFriendsData(); // Refresh data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenChat = (friendId: string) => {
    navigate(`/player/messages/${friendId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Friends</h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-4 py-2 font-semibold ${
                activeTab === 'friends'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600'
              }`}
            >
              My Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 font-semibold ${
                activeTab === 'requests'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600'
              }`}
            >
              Requests ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-4 py-2 font-semibold ${
                activeTab === 'add'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600'
              }`}
            >
              Add Friend
            </button>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Friends List */}
          {activeTab === 'friends' && (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div
                  key={friend.user_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{friend.name}</p>
                    <p className="text-sm text-gray-600">{friend.email}</p>
                    {friend.sports_interests && friend.sports_interests.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {friend.sports_interests.map((sport, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                          >
                            {sport}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleOpenChat(friend.user_id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Message
                  </button>
                </div>
              ))}

              {friends.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  <p>No friends yet. Start adding friends!</p>
                </div>
              )}
            </div>
          )}

          {/* Friend Requests */}
          {activeTab === 'requests' && (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.request_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{request.from_user_name}</p>
                    <p className="text-sm text-gray-600">{request.from_user_email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Sent {new Date(request.sent_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAcceptRequest(request.request_id)}
                    disabled={actionLoading === request.request_id}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
                  >
                    {actionLoading === request.request_id ? 'Accepting...' : 'Accept'}
                  </button>
                </div>
              ))}

              {requests.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  <p>No pending friend requests</p>
                </div>
              )}
            </div>
          )}

          {/* Add Friend */}
          {activeTab === 'add' && (
            <div>
              <form onSubmit={handleSearchUser} className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search by User ID
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="Enter user ID..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>

              {searchResult && (
                <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{searchResult.name}</p>
                    <p className="text-sm text-gray-600">{searchResult.email}</p>
                  </div>
                  <button
                    onClick={() => handleSendRequest(searchResult.user_id)}
                    disabled={actionLoading === searchResult.user_id}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {actionLoading === searchResult.user_id ? 'Sending...' : 'Add Friend'}
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => navigate('/player/dashboard')}
            className="mt-6 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
