"use client";

import { useEffect } from "react";
import { messaging } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";

export default function NotificationHandler() {
    const { user } = useAuthStore();

    useEffect(() => {
        if (!user || !messaging) return;

        const requestPermission = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === "granted" && messaging) {
                    const token = await getToken(messaging, {
                        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                    });
                    
                    if (token) {
                        // Save token to server
                        await fetch("/api/user/fcm-token", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ fcmToken: token }),
                        });
                    }
                }
            } catch (error: any) {
                if (error.code === "messaging/token-subscribe-failed") {
                    console.warn("FCM Subscription failed. This usually happens if the VAPID key is invalid or the browser blocked the request.");
                } else {
                    console.error("FCM Error:", error);
                }
            }
        };

        requestPermission();

        const unsubscribe = onMessage(messaging, (payload) => {
            console.log("Foreground message received:", payload);
            if (payload.notification) {
                // Add to store for real-time UI update
                const newNotif = {
                    id: payload.messageId || Date.now().toString(),
                    type: payload.data?.type || "info",
                    message: payload.notification.body || "",
                    read: false,
                    createdAt: new Date().toISOString(),
                };
                
                // useNotificationStore.getState() is safe in callbacks
                const store = useNotificationStore.getState(); 
                if (store && store.addNotification) {
                    store.addNotification(newNotif);
                }

                toast.success(
                    <div onClick={() => useNotificationStore.getState().markAsRead(newNotif.id)}>
                        <div style={{ fontWeight: "bold" }}>{payload.notification.title}</div>
                        <div style={{ fontSize: "12px" }}>{payload.notification.body}</div>
                    </div>,
                    { duration: 5000 }
                );
            }
        });

        return () => unsubscribe();
    }, [user]);

    return null;
}
