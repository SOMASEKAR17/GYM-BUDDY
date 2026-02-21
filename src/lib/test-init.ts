import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    console.log('TEST_LOG_INITIALIZING');
}

export const adminAuth = admin.auth();
