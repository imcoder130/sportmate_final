import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameAPI, groupAPI } from '../../api';
import type { Game } from '../../types';

interface GroupMember {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  skill_level?: string;
  joined_at: string;
}

export default function GameDetails() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const userId = localStorage.getItem('userId') || '';
  const isJoined = game?.accepted_players?.some(p => p.user_id === userId) || false;

  useEffect(() => {
    fetchGameDetails();
  }, [gameId]);

  const fetchGameDetails = async () => {
    if (!gameId) return;
    
    try {
      setLoading(true);
      const gameData = await gameAPI.getGameDetails(gameId);
      setGame(gameData);

      // Fetch group members if group exists
      if (gameData.group_id) {
        const membersData = await groupAPI.getGroupMembers(gameData.group_id);
        setMembers(membersData.members || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch game details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!gameId || !userId) {
      console.error('Missing gameId or userId:', { gameId, userId });
      setError('Unable to join game. Please try logging in again.');
      return;
    }

    try {
      setActionLoading(true);
      setError(''); // Clear previous errors
      console.log('Joining game:', { gameId, userId });
      await gameAPI.joinGame(gameId, userId);
      await fetchGameDetails(); // Refresh to show updated members
    } catch (err: any) {
      console.error('Join game error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to join game';
      
      // Provide helpful message for group limit error
      if (errorMessage.includes('maximum') && errorMessage.includes('active groups')) {
        setError('⚠️ You\'ve reached the maximum of 3 active groups. Please leave a game before joining a new one.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveGame = async () => {
    if (!gameId || !userId) return;

    try {
      setActionLoading(true);
      await gameAPI.leaveGame(gameId, userId);
      await fetchGameDetails(); // Refresh to show updated members
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to leave game');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGame = async () => {
    if (!gameId || !window.confirm('Are you sure you want to delete this game?')) return;

    try {
      setActionLoading(true);
      await gameAPI.deleteGame(gameId, userId);
      navigate('/player/my-games');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete game');
      setActionLoading(false);
    }
  };

  const handleOpenChat = () => {
    if (game?.group_id) {
      navigate(`/player/group/${game.group_id}/chat`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading game details...</div>
      </div>
    );
  }

  if (error && !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => navigate('/player/discover')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Discover
          </button>
        </div>
      </div>
    );
  }

  if (!game) return null;

  const spotsLeft = game.players_needed - (game.accepted_players?.length || 0);
  const isOwner = game.user_id === userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{game.sport?.toUpperCase() || 'SPORT'}</h1>
              <p className="text-gray-600">{game.location?.address || 'Location not specified'}</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${spotsLeft > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
              </div>
              <div className="text-sm text-gray-500">{game.accepted_players?.length || 0}/{game.players_needed} players</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-semibold">{game.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-semibold">{game.time}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500">Description</p>
            <p className="text-gray-800">{game.description}</p>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isOwner && !isJoined && spotsLeft > 0 && (
              <button
                onClick={handleJoinGame}
                disabled={actionLoading}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
              >
                {actionLoading ? 'Joining...' : 'Join Game'}
              </button>
            )}

            {!isOwner && isJoined && (
              <button
                onClick={handleLeaveGame}
                disabled={actionLoading}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 disabled:bg-gray-400"
              >
                {actionLoading ? 'Leaving...' : 'Leave Game'}
              </button>
            )}

            {(isJoined || isOwner) && game.group_id && (
              <button
                onClick={handleOpenChat}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
              >
                Open Group Chat
              </button>
            )}

            {isOwner && (
              <button
                onClick={handleDeleteGame}
                disabled={actionLoading}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 disabled:bg-gray-400"
              >
                {actionLoading ? 'Deleting...' : 'Delete Game'}
              </button>
            )}
          </div>
        </div>

        {/* Players List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Players ({game.accepted_players?.length || 0})</h2>
          <div className="space-y-3">
            {game.accepted_players && game.accepted_players.length > 0 ? (
              game.accepted_players.map((player) => (
                <div
                  key={player.user_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {player.user_name}
                      {player.user_id === game.user_id && (
                        <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">Organizer</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Joined {new Date(player.accepted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No players yet. Be the first to join!</p>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('/player/discover')}
          className="mt-6 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Back to Discover
        </button>
      </div>
    </div>
  );
}
