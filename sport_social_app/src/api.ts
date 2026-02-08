import axios from 'axios';
import type { User, Game, Group, Message, Turf, Notification } from './types';

// Use proxy in development, direct URL in production
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' // Proxied through Vite dev server
  : 'https://sport-api-grsqjakhza-uc.a.run.app/api'; // Direct URL for production

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User APIs (Player)
export const userAPI = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
    avatar?: string;
    bio?: string;
    skill_level?: 'beginner' | 'intermediate' | 'advanced';
    preferred_position?: string;
    age?: number;
    gender?: string;
  }) => {
    const response = await api.post('/users/register', {
      ...userData,
      role: 'player', // Required field, must be exactly 'player'
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },

  getUser: async (userId: string): Promise<User> => {
    console.log('API: Fetching user profile for ID:', userId);
    console.log('API: Full URL:', `${API_BASE_URL}/users/${userId}`);
    const response = await api.get(`/users/${userId}`);
    console.log('API: User profile response:', response.data);
    return response.data;
  },

  updateProfile: async (userId: string, profileData: any) => {
    const response = await api.put(`/users/${userId}/profile`, profileData);
    return response.data;
  },

  getUserPosts: async (userId: string) => {
    const response = await api.get(`/users/${userId}/posts`);
    return response.data;
  },
};

// Game/Post APIs
export const gameAPI = {
  createGame: async (gameData: {
    user_id: string;
    sport: string;
    players_needed: number;
    location: { lat: number; lng: number; address: string };
    description: string;
    date: string;
    time: string;
  }) => {
    const response = await api.post('/posts/create', gameData);
    return response.data;
  },

  searchNearby: async (searchData: {
    lat: number;
    lng: number;
    radius_km: number;
    sport?: string;
  }): Promise<{ count: number; posts: Game[] }> => {
    const response = await api.post('/posts/nearby', searchData);
    return response.data;
  },

  getGameDetails: async (postId: string): Promise<Game> => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  joinGame: async (postId: string, userId: string) => {
    console.log('API: Joining game', { postId, userId, payload: { user_id: userId } });
    const response = await api.post(`/posts/${postId}/join`, { user_id: userId });
    console.log('API: Join response:', response.data);
    return response.data;
  },

  leaveGame: async (postId: string, userId: string) => {
    const response = await api.post(`/posts/${postId}/leave`, { user_id: userId });
    return response.data;
  },

  deleteGame: async (postId: string, userId: string) => {
    const response = await api.delete(`/posts/${postId}`, {
      data: { user_id: userId }
    });
    return response.data;
  },

  acceptRequest: async (postId: string, ownerId: string, playerId: string) => {
    const response = await api.post(`/posts/${postId}/accept`, {
      owner_id: ownerId,
      player_id: playerId,
    });
    return response.data;
  },

  rejectRequest: async (postId: string, ownerId: string, playerId: string) => {
    const response = await api.post(`/posts/${postId}/reject`, {
      owner_id: ownerId,
      player_id: playerId,
    });
    return response.data;
  },

  kickPlayer: async (postId: string, creatorId: string, playerId: string) => {
    const response = await api.post(`/posts/${postId}/kick`, {
      creator_id: creatorId,
      player_id: playerId,
    });
    return response.data;
  },

  searchNearbyWithTurfs: async (searchData: {
    lat: number;
    lng: number;
    radius_km: number;
    sport?: string;
  }) => {
    const response = await api.post('/posts/nearby-with-turfs', searchData);
    return response.data;
  },
};

// Group Chat APIs
export const groupAPI = {
  getUserGroups: async (userId: string): Promise<{ count: number; groups: Group[] }> => {
    const response = await api.get(`/users/${userId}/groups`);
    return response.data;
  },

  getGroupDetails: async (groupId: string): Promise<Group> => {
    const response = await api.get(`/groups/${groupId}/details`);
    return response.data;
  },

  getGroupMembers: async (groupId: string) => {
    const response = await api.get(`/groups/${groupId}/members`);
    return response.data;
  },

  getMessages: async (groupId: string): Promise<{ count: number; messages: Message[] }> => {
    const response = await api.get(`/groups/${groupId}/messages`);
    return response.data;
  },

  sendMessage: async (groupId: string, userId: string, message: string) => {
    const response = await api.post(`/groups/${groupId}/messages`, {
      user_id: userId,
      message,
    });
    return response.data;
  },
};

// Turf Owner APIs
export const turfOwnerAPI = {
  register: async (ownerData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    business_name: string;
    business_address: string;
    contact_person?: string;
    gstin?: string;
  }) => {
    const response = await api.post('/turf-owners/register', ownerData);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/turf-owners/login', { email, password });
    return response.data;
  },
};

// Turf APIs
export const turfAPI = {
  create: async (turfData: {
    owner_id: string;
    name: string;
    location: {
      lat: number;
      lng: number;
      address?: string;
    };
    sports: string[];
    facilities?: string[];
    pricing: {
      per_hour: number;
      currency?: string;
    };
    timings: {
      opening: string;
      closing: string;
    };
    images?: string[];
  }) => {
    const response = await api.post('/turfs/create', turfData);
    return response.data;
  },
  searchNearby: async (searchData: {
    lat: number;
    lng: number;
    radius_km: number;
    sport?: string;
  }): Promise<{ count: number; turfs: Turf[] }> => {
    const response = await api.post('/turfs/search/nearby', searchData);
    return response.data;
  },

  getTurfDetails: async (turfId: string): Promise<Turf> => {
    const response = await api.get(`/turfs/${turfId}`);
    return response.data;
  },

  bookTurf: async (turfId: string, bookingData: {
    user_id: string;
    group_id: string;
    date: string;
    time_slot: string;
  }) => {
    const response = await api.post(`/turfs/${turfId}/book`, bookingData);
    return response.data;
  },

  getOwnerTurfs: async (ownerId: string) => {
    const response = await api.get(`/turfs/owner/${ownerId}`);
    return response.data;
  },

  updateTurf: async (turfId: string, ownerId: string, updateData: any) => {
    const response = await api.put(`/turfs/${turfId}`, {
      owner_id: ownerId,
      ...updateData,
    });
    return response.data;
  },

  deleteTurf: async (turfId: string, ownerId: string) => {
    const response = await api.delete(`/turfs/${turfId}`, {
      data: { owner_id: ownerId }
    });
    return response.data;
  },

  checkAvailability: async (turfId: string, date: string) => {
    const response = await api.post(`/turfs/${turfId}/availability`, { date });
    return response.data;
  },

  getUserBookings: async (turfId: string, userId: string) => {
    const response = await api.get(`/turfs/${turfId}/bookings?user_id=${userId}`);
    return response.data;
  },

  cancelBooking: async (turfId: string, bookingId: string, userId: string) => {
    const response = await api.post(`/turfs/${turfId}/bookings/${bookingId}/cancel`, {
      user_id: userId,
    });
    return response.data;
  },
};

// Friends APIs
export const friendsAPI = {
  sendRequest: async (senderId: string, receiverId: string) => {
    const response = await api.post('/friends/request', {
      sender_id: senderId,
      receiver_id: receiverId,
    });
    return response.data;
  },

  getPendingRequests: async (userId: string) => {
    const response = await api.get(`/users/${userId}/friend-requests`);
    return response.data;
  },

  acceptRequest: async (requestId: string, userId: string) => {
    const response = await api.post('/friends/accept', {
      request_id: requestId,
      user_id: userId,
    });
    return response.data;
  },

  getFriends: async (userId: string) => {
    const response = await api.get(`/users/${userId}/friends`);
    return response.data;
  },

  getDirectMessages: async (user1Id: string, user2Id: string) => {
    const response = await api.get(`/users/${user1Id}/messages/${user2Id}`);
    return response.data;
  },

  sendDirectMessage: async (userId: string, toUserId: string, message: string) => {
    const response = await api.post(`/users/${userId}/messages/send`, { to_user_id: toUserId, message });
    return response.data;
  },
};

// Notification APIs
export const notificationAPI = {
  getNotifications: async (userId: string): Promise<{ count: number; unread_count: number; notifications: Notification[] }> => {
    const response = await api.get(`/notifications/${userId}`);
    return response.data;
  },

  markAsRead: async (userId: string, notificationId: string) => {
    const response = await api.put(`/notifications/${userId}/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async (userId: string) => {
    const response = await api.put(`/notifications/${userId}/read-all`);
    return response.data;
  },
};

// Ratings APIs
export const ratingsAPI = {
  addRating: async (ratingData: {
    post_id: string;
    rater_id: string;
    rated_user_id: string;
    overall_rating: number;
    punctuality?: number;
    skill?: number;
    teamwork?: number;
    sportsmanship?: number;
    review?: string;
  }) => {
    const response = await api.post('/ratings/add', ratingData);
    return response.data;
  },

  getUserRatings: async (userId: string) => {
    const response = await api.get(`/users/${userId}/ratings`);
    return response.data;
  },
};

// Health Check API
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
