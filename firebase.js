import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDDp-j5lwV6yb5cYvevGBvE2IYfk-dGPPU",
  authDomain: "indoor-jungle-bec2a.firebaseapp.com",
  databaseURL: "https://indoor-jungle-bec2a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "indoor-jungle-bec2a",
  storageBucket: "indoor-jungle-bec2a.firebasestorage.app",
  messagingSenderId: "343223436340",
  appId: "1:343223436340:web:02b734b3799ef158c3b661",
  measurementId: "G-ZVL0SLCJ7T"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);