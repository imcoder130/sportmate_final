// User Types
export interface UserProfile {
  avatar?: string;
  bio?: string;
  skill_level?: 'beginner' | 'intermediate' | 'advanced';
  preferred_position?: string;
  age?: number;
  gender?: string;
}

export interface UserStats {
  games_played: number;
  games_organized: number;
  attendance_rate: number;
  average_rating: number;
  total_ratings: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'player' | 'turf_owner' | 'admin';
  location?: string;
  business_name?: string;
  business_address?: string;
  bio?: string;
  skill_level?: string;
  sports_interests?: string[];
  profile?: UserProfile;
  stats?: UserStats;
  created_at: string;
}

// Game/Post Types
export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface AcceptedPlayer {
  user_id: string;
  user_name: string;
  accepted_at: string;
}

export interface Game {
  id: string;
  user_id: string;
  user_name: string;
  sport: 'cricket' | 'football' | 'basketball' | 'badminton' | 'tennis' | 'volleyball';
  players_needed: number;
  accepted_players: AcceptedPlayer[];
  pending_requests: any[];
  location: Location;
  description: string;
  date: string;
  time: string;
  status: 'open' | 'full';
  group_id?: string;
  distance_km?: number;
  created_at: string;
}

// Group Chat Types
export interface GroupMember {
  user_id: string;
  user_name: string;
}

export interface Group {
  id: string;
  name?: string;
  post_id: string;
  created_by?: string;
  members: GroupMember[];
  created_at: string;
  turf_booking?: any;
  auto_delete_at?: string;
}

export interface Message {
  id: string;
  message_id: string;
  user_id: string;
  user_name: string;
  message: string;
  timestamp: string;
}

// Turf Types
export interface Turf {
  id: string;
  turf_id: string;
  owner_id: string;
  owner_name: string;
  name: string;
  location: Location;
  sport: string;
  sports: string[];
  facilities: string[];
  features?: string[];
  pricing: {
    per_hour: number;
    currency: string;
  };
  timings: {
    opening: string;
    closing: string;
  };
  images: string[];
  rating: number;
  total_ratings: number;
  total_bookings: number;
  distance_km?: number;
  status: 'active' | 'inactive';
  created_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  notification_id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_id?: string;
  metadata?: any;
  read: boolean;
  is_read: boolean;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}
