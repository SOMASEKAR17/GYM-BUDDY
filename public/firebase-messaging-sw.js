importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAZcxHwBfFP0UW3xCvRmnBTPFlVGyCewss",
    authDomain: "gym-buddy-ae1dd.firebaseapp.com",
    projectId: "gym-buddy-ae1dd",
    storageBucket: "gym-buddy-ae1dd.firebasestorage.app",
    messagingSenderId: "177122104772",
    appId: "1:177122104772:web:5c3cf737ddd90c49a0c091"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.ico'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
