import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { friendsAPI, userAPI } from '../../api';

interface DirectMessage {
  message_id: string;
  from_user_id: string;
  to_user_id: string;
  message: string;
  timestamp: string;
  is_read: boolean;
}

export default function DirectMessages() {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [friendInfo, setFriendInfo] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = localStorage.getItem('userId') || '';

  useEffect(() => {
    if (userId && friendId) {
      fetchData();
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [userId, friendId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchData = async () => {
    if (!friendId) return;

    try {
      setLoading(true);
      const [messagesData, friendData] = await Promise.all([
        friendsAPI.getDirectMessages(userId, friendId),
        userAPI.getUser(friendId),
      ]);

      setMessages(messagesData.messages || []);
      setFriendInfo(friendData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!friendId) return;

    try {
      const messagesData = await friendsAPI.getDirectMessages(userId, friendId);
      setMessages(messagesData.messages || []);
    } catch (err: any) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !friendId || sending) return;

    try {
      setSending(true);
      await friendsAPI.sendDirectMessage(userId, friendId, newMessage.trim());
      setNewMessage('');
      await fetchMessages(); // Refresh messages
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {friendInfo?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {friendInfo?.name || 'Friend'}
              </h1>
              <p className="text-sm text-gray-600">{friendInfo?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/player/friends')}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Back
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.from_user_id === userId;

            return (
              <div
                key={message.message_id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 shadow'
                  }`}
                >
                  <p className="break-words">{message.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {isOwnMessage && message.is_read && (
                      <span className="ml-2">✓✓</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}

          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white shadow-md p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
