import { create } from "zustand";

export interface AppNotification {
    id: string;
    type: string;
    message: string;
    read: boolean;
    createdAt: string;
}

interface NotificationState {
    notifications: AppNotification[];
    unreadCount: number;
    setNotifications: (notifications: AppNotification[]) => void;
    addNotification: (notification: AppNotification) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,
    setNotifications: (notifications) =>
        set({
            notifications,
            unreadCount: notifications.filter((n) => !n.read).length,
        }),
    addNotification: (notification) =>
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + (notification.read ? 0 : 1),
        })),
    markAsRead: (id) => {
        fetch("/api/notifications/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notificationId: id }),
        }).catch(console.error);

        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: Math.max(0, state.unreadCount - 1),
        }));
    },
    markAllAsRead: () => {
        fetch("/api/notifications/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }).catch(console.error);

        set({
            notifications: [],
            unreadCount: 0,
        });
    },
}));
