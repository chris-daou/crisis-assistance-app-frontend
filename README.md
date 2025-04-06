# Lebanon Crisis Assistance Mobile Application (Frontend)

A mobile application designed to support Lebanese citizens during times of crisis by providing access to essential services, real-time safety information, volunteer networks, mental health assistance, and family tracking capabilities.

---

## 📱 Overview

The Lebanon Crisis Assistance Mobile App is a full-featured crisis management platform developed using **React Native** and powered by a **Node.js** backend. It is designed to help individuals stay informed, safe, and connected during conflict and emergency situations.

Key services include:
- Mapping of health centers, shelters, and food organizations
- Real-time family tracking
- Verified volunteer support network
- AI-assisted mental health resources
- Curated, real-time news from trusted sources

---

## 🚀 Features

### 🔍 Real-Time Map
- Location-aware display of:
  - Nearby hospitals
  - Emergency shelters
  - Food assistance providers
- Google Maps integration with navigation support
- Filtered service layers and map type toggling

### 👪 My Network
- Add and manage family/friend connections by phone number
- Accept or reject connection requests
- View and remove existing connections

### 🧠 AI War Assistant *(In Progress)*
- Planned: mental health assistance powered by AI
- Breathing exercises, stress relief, and coping techniques

### 📰 News Feed
- Aggregates real-time news from **The Guardian**
- Focused on Lebanon-related conflict updates and safety alerts

### 🤝 Volunteer Services
- Public list of verified volunteers offering medical, psychological, or maintenance aid
- Self-registration feature for users willing to contribute

### 🔐 Authentication
- Phone-based registration and login
- OTP verification for secure access
- Secure storage of tokens and session data via `AsyncStorage`

---

## 📦 Tech Stack

### Front-End
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Axios](https://axios-http.com/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

### Back-End *(Separate Repository)*
- Node.js + Express
- MongoDB or Firebase (for user, volunteer, and network data)
- Socket.io (planned for real-time updates)

### APIs & Services
- Google Maps & Places API
- The Guardian News API
- Twilio (planned for SMS alerts)
- TensorFlow Lite or IBM Watson (planned for AI assistant)

---

## ⚙️ Environment Setup

Create a `.env` file in the root of your project and include the following variables:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
BACKEND_URL=https://your-backend-url.com/api
NEWS_API_KEY=your_guardian_api_key
```

> Ensure TypeScript compatibility via `declarations.d.ts`.

---

## 🛠 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/crisis-assistance-app-frontend.git
cd crisis-assistance-app-frontend

# Install dependencies
yarn install

# Run the app
npx expo start
```

---

## 📁 Project Structure

```
app/
├── components/Navigation       # App, auth, and drawer navigators
├── context/                    # Auth context
├── screens/                   # Feature screens (Map, News, Volunteers, etc.)
├── services/                  # Axios instance
├── assets/                    # Images and icons
└── App.tsx                    # Entry point
```

---

## 🧪 Status

| Feature               | Status       |
|----------------------|--------------|
| Auth (Login/Signup)  | ✅ Complete   |
| OTP Verification     | ✅ Complete   |
| Map & Navigation     | ✅ Complete   |
| News Integration     | ✅ Complete   |
| My Network           | ✅ Complete   |
| Volunteers Module    | 🚧 UI Ready   |
| AI Assistant         | ❌ Pending    |
| Backend Integration  | ⚙️ In Progress |

---

## 📌 Roadmap

- [ ] Integrate AI War Assistant using TensorFlow Lite or IBM Watson
- [ ] Enable real-time alerts via Socket.io
- [ ] Secure push notifications (FCM/Twilio)
- [ ] Full volunteer registration backend hookup
- [ ] Improve accessibility and UI polish

---

## 👨‍💻 Authors

- **Chris Daou** – [`chris-daou`](https://github.com/chris-daou)  
  *Author of the frontend implementation for this project.*

- **Vicken Kendirjian** – [`vicken-kendirjian`](https://github.com/vicken-kendirjian)

Project developed as part of the Final Year Capstone at LAU.

## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License**.  
See the full license in the [`LICENSE`](./LICENSE) file at the root of this repository.

## 🙌 Acknowledgements

- The Guardian News API
- Google Cloud Platform
- Lebanese Red Cross (for inspiration)
