# Push Notifications Setup Guide

## Current Status
Your Firebase Cloud Messaging (FCM) is already configured in the code, but background notifications require a server-side secret key to be added to Supabase.

## Steps to Enable Background Push Notifications

### 1. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **flamia-d69dd**
3. Click the gear icon (⚙️) → **Project settings**
4. Go to the **Service accounts** tab
5. Click **Generate new private key**
6. Download the JSON file (keep it secure!)

### 2. Add the Secret to Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Edge Functions** → **Secrets**
4. Add a new secret:
   - **Name**: `FCM_SERVICE_ACCOUNT_KEY`
   - **Value**: Paste the entire contents of the JSON file you downloaded

### 3. Deploy the Edge Functions

Run these commands in your terminal:

```bash
# Deploy the push notification functions
supabase functions deploy send-push-notification
supabase functions deploy send-targeted-push
```

### 4. Test Background Notifications

1. **Subscribe to notifications** in the app (when prompted)
2. **Close the app completely** (or minimize the browser)
3. **Send a test notification** from the admin panel
4. You should receive the notification even with the app closed!

## How It Works

### When App is Open (Foreground):
- Handled by `src/services/pushNotifications.ts`
- Uses `onMessage()` to show in-app notifications
- Shows browser notifications if permission granted

### When App is Closed (Background):
- Handled by `public/firebase-messaging-sw.js`
- Firebase service worker receives the push notification
- Shows system notification automatically
- Clicking the notification opens/focuses the app

## Current Configuration

✅ **Firebase Config**: Already set up
✅ **Service Worker**: `public/firebase-messaging-sw.js` configured
✅ **Edge Functions**: Ready and waiting for FCM_SERVICE_ACCOUNT_KEY
✅ **Client Code**: Subscribes users and saves FCM tokens to database
✅ **Database**: `push_subscriptions` table stores FCM tokens

## What's Missing

❌ **FCM_SERVICE_ACCOUNT_KEY**: Not configured in Supabase secrets

Once you add the secret, background notifications will work immediately!

## Troubleshooting

### Notifications not showing when app is closed?
1. Check that `FCM_SERVICE_ACCOUNT_KEY` is set in Supabase
2. Verify the Edge Functions are deployed
3. Check browser console for errors
4. Ensure notification permission is granted in browser settings

### Token errors in Edge Function logs?
- The functions automatically remove invalid/expired tokens
- Users will be re-prompted to subscribe when they return

### Testing on Mobile
- For iOS: Must install as PWA (Add to Home Screen)
- For Android: Works in browser and as PWA
- Background notifications require the service worker to be registered

## Important Notes

- **Service Worker Registration**: Already handled in `src/main.tsx`
- **Token Refresh**: Automatic when users return to app
- **Permission Prompt**: Shows weekly if not granted
- **Auto-subscribe**: If permission already granted, subscribes automatically

## Admin Panel Usage

Once configured, admins can:
1. Go to Account → Marketing
2. Enter notification title and message
3. Select target page (where users go when they click)
4. Click "Send Notification"
5. Notifications reach all subscribed users (even if app is closed!)

