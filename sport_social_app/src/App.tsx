import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import LoginPlayer from './pages/LoginPlayer';
import LoginTurfOwner from './pages/LoginTurfOwner';
import LoginAdmin from './pages/LoginAdmin';
import PlayerDashboard from './pages/player/Dashboard';
import CreateGame from './pages/player/CreateGame';
import Discover from './pages/player/Discover';
import MyGames from './pages/player/MyGames';
import Turfs from './pages/player/Turfs';
import GameDetails from './pages/player/GameDetails';
import GroupChat from './pages/player/GroupChat';
import Friends from './pages/player/Friends';
import DirectMessages from './pages/player/DirectMessages';
import Notifications from './pages/player/Notifications';
import UserProfile from './pages/player/UserProfile';
import TurfDetails from './pages/player/TurfDetails';
import AdminDashboard from './pages/admin/Dashboard';
import TurfOwnerDashboard from './pages/turfOwner/Dashboard';
import CreateTurf from './pages/turfOwner/CreateTurf';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/player" element={<LoginPlayer />} />
        <Route path="/login/turf-owner" element={<LoginTurfOwner />} />
        <Route path="/login/admin" element={<LoginAdmin />} />
        <Route path="/register" element={<LoginPlayer />} />
        
        {/* Player Routes */}
        <Route path="/player/dashboard" element={<PlayerDashboard />} />
        <Route path="/player/create-game" element={<CreateGame />} />
        <Route path="/player/discover" element={<Discover />} />
        <Route path="/player/my-games" element={<MyGames />} />
        <Route path="/player/turfs" element={<Turfs />} />
        <Route path="/player/game/:gameId" element={<GameDetails />} />
        <Route path="/player/group/:groupId/chat" element={<GroupChat />} />
        <Route path="/player/friends" element={<Friends />} />
        <Route path="/player/messages/:friendId" element={<DirectMessages />} />
        <Route path="/player/notifications" element={<Notifications />} />
        <Route path="/player/profile" element={<UserProfile />} />
        <Route path="/player/profile/:userId" element={<UserProfile />} />
        <Route path="/player/turf/:turfId" element={<TurfDetails />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
        {/* Turf Owner Routes */}
        <Route path="/turf-owner/dashboard" element={<TurfOwnerDashboard />} />
        <Route path="/turf-owner/create-turf" element={<CreateTurf />} />
      </Routes>
    </Router>
  );
}

export default App;
