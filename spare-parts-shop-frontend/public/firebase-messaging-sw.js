importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAmye7PPRx3xZF02GNpMyRdSAbQKIu0leo",
  authDomain: "device-streaming-ce958fe1.firebaseapp.com",
  projectId: "device-streaming-ce958fe1",
  storageBucket: "device-streaming-ce958fe1.firebasestorage.app",
  messagingSenderId: "1055525476598",
  appId: "1:1055525476598:web:4cc4d058127223efcbf4d7"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/pwa-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
