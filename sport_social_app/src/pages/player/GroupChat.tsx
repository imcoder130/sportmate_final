import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupAPI } from '../../api';
import type { Message } from '../../types';

interface GroupMember {
  user_id: string;
  name: string;
  email: string;
}

export default function GroupChat() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [groupDetails, setGroupDetails] = useState<any>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = localStorage.getItem('userId') || '';

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchGroupData = async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      const [groupData, messagesData, membersData] = await Promise.all([
        groupAPI.getGroupDetails(groupId),
        groupAPI.getMessages(groupId),
        groupAPI.getGroupMembers(groupId),
      ]);

      setGroupDetails(groupData);
      setMessages(messagesData.messages || []);
      setMembers(membersData.members || []);
    } catch (err: any) {
      console.error('Failed to fetch group data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!groupId) return;

    try {
      const messagesData = await groupAPI.getMessages(groupId);
      setMessages(messagesData.messages || []);
    } catch (err: any) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !groupId || !userId || sending) return;

    try {
      setSending(true);
      await groupAPI.sendMessage(groupId, userId, newMessage.trim());
      setNewMessage('');
      await fetchMessages(); // Refresh messages
    } catch (err: any) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.user_id === memberId);
    return member?.name || 'Unknown User';
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
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {groupDetails?.name || 'Group Chat'}
            </h1>
            <p className="text-sm text-gray-600">{members.length} members</p>
          </div>
          <button
            onClick={() => navigate('/player/my-games')}
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
            const isOwnMessage = message.user_id === userId;
            const senderName = isOwnMessage ? 'You' : getMemberName(message.user_id);

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
                  {!isOwnMessage && (
                    <p className="text-xs font-semibold mb-1 opacity-75">{senderName}</p>
                  )}
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

      {/* Members Sidebar (optional - shown on larger screens) */}
      <div className="hidden lg:block fixed right-4 top-20 w-64 bg-white rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
        <h3 className="font-bold text-gray-800 mb-3">Members ({members.length})</h3>
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.user_id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{member.name}</p>
                <p className="text-xs text-gray-500 truncate">{member.email}</p>
              </div>
              {member.user_id === groupDetails?.created_by && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Admin</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
