# SportMate - Social Sports App

A full-stack social platform for organizing sports games and booking turfs.

## 🏗️ Project Structure

```
Sport_Mate/
├── sport_social_app/     # React + TypeScript frontend
└── sport-backend/        # Python Flask backend
```

## 🚀 Frontend Setup (sport_social_app)

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
cd sport_social_app
npm install
```

### Development

```bash
npm run dev
```

The app will run on `http://localhost:5173` (or next available port)

### Features Implemented
- ✅ CORS proxy configuration for API calls
- ✅ User authentication (Player, Turf Owner, Admin)
- ✅ Game creation and discovery with geolocation
- ✅ Turf booking system with availability check
- ✅ Real-time group chat
- ✅ Friends system with direct messaging
- ✅ Notifications
- ✅ User profiles and ratings
- ✅ Enhanced error handling and debugging

## 🔧 Backend Setup (sport-backend)

### Prerequisites
- Python 3.8+
- Firebase project with Firestore

### Installation

```bash
cd sport-backend
pip install -r requirements.txt
```

### ⚠️ Important: Firebase Credentials

**You need to add your Firebase service account key:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Save the downloaded JSON file as `sport-backend/key.json`

**🔒 Security Note:** The `key.json` file is in `.gitignore` and will NOT be committed to git. Keep it secure!

### Running the Backend

```bash
cd sport-backend
python app.py
```

## 🌐 API Configuration

The frontend uses a proxy configuration to avoid CORS issues in development:

- **Development**: API calls go through Vite proxy (`/api`)
- **Production**: Direct API URL

To change the API endpoint, edit `sport_social_app/src/api.ts`

## 📝 Environment Variables

### Frontend (.env)
Not required for current setup

### Backend
Credentials are loaded from `key.json` (not in git)

## 🛠️ Technologies Used

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- Lucide React (icons)

### Backend
- Python Flask
- Firebase Firestore
- Google Cloud Run (deployed)

## 🐛 Known Issues & Fixes

### CORS Error
**Fixed** ✅ - Development proxy configured in `vite.config.ts`

### Git Merge Conflict in Discover.tsx
**Fixed** ✅ - Resolved merge markers

### Turf Booking Authentication
**Fixed** ✅ - Added userId validation and error messages

## 📦 Deployment

- **Backend**: Deployed on Google Cloud Run
  - URL: `https://sport-api-grsqjakhza-uc.a.run.app`
  
- **Frontend**: Can be deployed to:
  - Vercel
  - Netlify
  - Firebase Hosting
  - Any static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License

## 👤 Author

imcoder130

## 🔗 Links

- Repository: https://github.com/imcoder130/sportmate_final
- API: https://sport-api-grsqjakhza-uc.a.run.app
