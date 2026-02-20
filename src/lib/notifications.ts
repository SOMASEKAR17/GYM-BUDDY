import { adminAuth } from "./firebaseAdmin";
import * as admin from "firebase-admin";

export async function sendPushNotification(fcmToken: string, title: string, body: string, data?: any) {
    if (!fcmToken) return;

    const message = {
        notification: {
            title,
            body,
        },
        data: data || {},
        token: fcmToken,
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("Successfully sent message:", response);
        return response;
    } catch (error) {
        console.error("Error sending message:", error);
    }
}
