import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAmye7PPRx3xZF02GNpMyRdSAbQKIu0leo",
  authDomain: "device-streaming-ce958fe1.firebaseapp.com",
  projectId: "device-streaming-ce958fe1",
  storageBucket: "device-streaming-ce958fe1.firebasestorage.app",
  messagingSenderId: "1055525476598",
  appId: "1:1055525476598:web:4cc4d058127223efcbf4d7"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { 
        vapidKey: 'BJjCuERq6qfBdfgndzqQ1vGYAC94zsXqWuE9--xcFv4SU8ShtuCbgvW_n098xO4puIDl8xhW7wy5CjgWk3_MPyM' 
      });
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Unable to get permission to notify.');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
