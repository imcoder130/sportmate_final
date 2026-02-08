import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, groupAPI, gameAPI } from '../../api';
import type { Game } from '../../types';

export default function MyGames() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'organized' | 'joined'>('organized');

  // Get userId from localStorage or from stored user object
  const getUserId = () => {
    const directId = localStorage.getItem('userId');
    if (directId) return directId;
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || '';
      } catch {
        return '';
      }
    }
    return '';
  };
  
  const userId = getUserId();

  useEffect(() => {
    if (userId) {
      console.log('User ID found:', userId);
      fetchUserGames();
    } else {
      console.error('No user ID found in localStorage');
      setError('Please log in again to view your games');
      setLoading(false);
    }
  }, [userId]);

  const fetchUserGames = async () => {
    if (!userId) {
      setError('User ID not found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('Fetching games for user:', userId);
      
      // Fetch posts created by user
      const postsResponse = await userAPI.getUserPosts(userId);
      const createdGames = postsResponse.posts || postsResponse.data?.posts || postsResponse || [];
      console.log('Created games:', createdGames);
      
      // Fetch user's groups to find joined games
      const groupsResponse = await groupAPI.getUserGroups(userId);
      const userGroups = groupsResponse.groups || groupsResponse.data?.groups || [];
      console.log('User groups:', userGroups);
      
      // Fetch game details for each group (groups are created when joining games)
      const joinedGamesPromises = userGroups
        .filter(group => group.post_id) // Only groups with associated posts
        .map(group => gameAPI.getGameDetails(group.post_id).catch(err => {
          console.error(`Failed to fetch game ${group.post_id}:`, err);
          return null;
        }));
      
      const joinedGamesResults = await Promise.all(joinedGamesPromises);
      const joinedGames = joinedGamesResults.filter(game => game !== null);
      console.log('Joined games:', joinedGames);
      
      // Combine and deduplicate games
      const allGames = [...createdGames];
      joinedGames.forEach(joinedGame => {
        if (!allGames.find(g => g.id === joinedGame.id)) {
          allGames.push(joinedGame);
        }
      });
      
      console.log('All games combined:', allGames);
      setGames(Array.isArray(allGames) ? allGames : []);
    } catch (err: any) {
      console.error('Error fetching games:', err);
      console.error('Error details:', err.response?.data);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to fetch games';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
  };

  // Separate games into organized and joined
  const organizedGames = games.filter(game => game.user_id === userId);
  const joinedGames = games.filter(game => 
    game.user_id !== userId && 
    game.accepted_players?.some(p => p.user_id === userId)
  );

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
            <h1 className="text-2xl font-bold text-gray-900">My Games</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('organized')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'organized'
                ? 'bg-white text-blue-600 shadow-lg'
                : 'bg-white/50 text-gray-600 hover:bg-white'
            }`}
          >
            Games I Organized ({organizedGames.length})
          </button>
          <button
            onClick={() => setActiveTab('joined')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'joined'
                ? 'bg-white text-blue-600 shadow-lg'
                : 'bg-white/50 text-gray-600 hover:bg-white'
            }`}
          >
            Games I Joined ({joinedGames.length})
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Games Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading your games...</div>
          </div>
        ) : activeTab === 'organized' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizedGames.map((game) => (
              <div
                key={game.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => navigate(`/player/game/${game.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{game.sport?.toUpperCase() || 'SPORT'}</h3>
                    <p className="text-sm text-gray-500">Organized by you</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(game.status || 'open')}`}>
                    {game.status || 'open'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📍</span>
                    {game.location?.address || 'Location not specified'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📅</span>
                    {game.date || 'TBD'} at {game.time || 'TBD'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">👥</span>
                    {game.accepted_players?.length || 0}/{game.players_needed || 0} players
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{game.description || 'No description provided'}</p>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/player/game/${game.id}`);
                    }}
                    className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    View Details
                  </button>
                  {game.group_id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/player/group/${game.group_id}/chat`);
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all"
                    >
                      💬
                    </button>
                  )}
                </div>
              </div>
            ))}

            {organizedGames.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No games organized yet</h3>
                <p className="text-gray-600 mb-6">Start by creating your first game!</p>
                <button
                  onClick={() => navigate('/player/create-game')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Create a Game
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedGames.map((game) => (
              <div
                key={game.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => navigate(`/player/game/${game.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{game.sport?.toUpperCase() || 'SPORT'}</h3>
                    <p className="text-sm text-gray-500">by {game.user_name || 'Unknown'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(game.status || 'open')}`}>
                    {game.status || 'open'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📍</span>
                    {game.location?.address || 'Location not specified'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📅</span>
                    {game.date || 'TBD'} at {game.time || 'TBD'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">👥</span>
                    {game.accepted_players?.length || 0}/{game.players_needed || 0} players
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{game.description || 'No description provided'}</p>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/player/game/${game.id}`);
                    }}
                    className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    View Details
                  </button>
                  {game.group_id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/player/group/${game.group_id}/chat`);
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all"
                    >
                      💬
                    </button>
                  )}
                </div>
              </div>
            ))}

            {joinedGames.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No joined games yet</h3>
                <p className="text-gray-600 mb-6">Discover and join games near you</p>
                <button
                  onClick={() => navigate('/player/discover')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Discover Games
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
