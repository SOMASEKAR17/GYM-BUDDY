import * as admin from 'firebase-admin';

/**
 * Robust Firebase Admin initialization
 * Using a new file name to avoid Turbopack caching issues
 */
const isProd = process.env.USE_PROD_DB === 'true';

const getCleanKey = (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    let cleaned = key.trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    return cleaned.replace(/\\n/g, '\n');
};

if (!admin.apps.length) {
    try {
        const projectId = isProd ? process.env.FIREBASE_PROJECT_ID : process.env.TEST_FIREBASE_PROJECT_ID;
        const clientEmail = isProd ? process.env.FIREBASE_CLIENT_EMAIL : process.env.TEST_FIREBASE_CLIENT_EMAIL;
        const rawKey = isProd ? process.env.FIREBASE_PRIVATE_KEY : process.env.TEST_FIREBASE_PRIVATE_KEY;
        const privateKey = getCleanKey(rawKey);

        if (projectId && clientEmail && privateKey) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
            console.log(`Firebase Admin initialized successfully in ${isProd ? 'PROD' : 'TEST'} mode`);
        } else {
            console.error('Firebase Admin Error: Credentials missing', {
                hasProjectId: !!projectId,
                hasClientEmail: !!clientEmail,
                hasKey: !!privateKey
            });
        }
    } catch (error) {
        console.error('Firebase Admin: Initialization failed', error);
    }
}

export const adminAuth = admin.auth();
