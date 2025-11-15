# PWA Installation Debugging Guide

## Quick Checklist

### 1. **Clear Everything First**

On the storefront page (e.g., `https://seller.flamia.store` or `https://flamia.store/shop/seller`):

1. **Open DevTools** (F12 or Right-click → Inspect)
2. Go to **Application** tab
3. **Service Workers** (left sidebar):
   - Click "Unregister" on all service workers
4. **Storage** (left sidebar):
   - Click "Clear site data" button
5. **Hard reload** the page (Ctrl+Shift+R or Cmd+Shift+R)

### 2. **Check Manifest**

In DevTools → **Application** → **Manifest**:

✅ Should show:
- **Name**: Store name (e.g., "Gavi's Store - Online Store")
- **Short name**: Store name (e.g., "Gavi's Store")
- **Start URL**: Correct URL
- **Icons**: Store logo URL (not `/images/icon.png`)
- **Theme color**: Store's theme color

❌ If it shows "Flamia - Gas Delivery Service":
- The manifest isn't loading correctly
- Check Console for errors

### 3. **Check Service Worker**

In DevTools → **Application** → **Service Workers**:

✅ Should show:
- **Status**: Activated and running
- **Source**: `/storefront-sw.js`
- **Scope**: `/` (for subdomains) or `/shop/seller/` (for routes)

❌ If not showing:
- Check Console for registration errors
- Verify HTTPS is enabled
- Make sure `storefront-sw.js` file exists in `/public/`

### 4. **Check Console**

Look for these logs:

✅ Good logs:
```
Service Worker registered: ServiceWorkerRegistration {...}
Service Worker ready
[SW] Installing for {storename}
[SW] Activating for {storename}
```

❌ Error logs:
- "Failed to register service worker" → HTTPS issue
- "manifest.json not found" → Manifest URL wrong
- "CORS error" → Supabase function not accessible

### 5. **Check Install Button**

The `InstallButton` component should be visible in the storefront header.

✅ If button shows:
- Should say "Install App" (not greyed out)
- Click should trigger browser install prompt

❌ If button is disabled/greyed:
- App might already be installed
- Check if running in standalone mode

❌ If button not showing at all:
- Check React component is imported
- Check console for React errors

### 6. **PWA Installability Criteria**

For the browser to offer installation, ALL must be true:

✅ **HTTPS**: Site must use HTTPS (except localhost)
✅ **Manifest**: Valid `manifest.json` with required fields
✅ **Service Worker**: Registered and active
✅ **Icons**: At least one icon (192x192 or larger)
✅ **Start URL**: Valid start_url in manifest
✅ **Display**: `standalone`, `fullscreen`, or `minimal-ui`
✅ **Not Installed**: App not already installed for this URL

### 7. **Test in Incognito/Private**

**Best test**: Open an **incognito/private window**
- No cache
- No installed apps
- Fresh PWA install test

## Common Issues & Fixes

### Issue: "Install App" button not active

**Causes**:
1. Service worker not registered
2. Manifest not loading
3. HTTPS not enabled
4. App already installed

**Fix**:
```bash
# Check these in order:
1. DevTools → Application → Service Workers (should be active)
2. DevTools → Application → Manifest (should load)
3. URL bar should show 🔒 (HTTPS)
4. Try different browser or incognito
```

### Issue: Install prompt not showing

**Causes**:
1. `beforeinstallprompt` event not firing
2. Browser doesn't support PWA
3. Installability criteria not met

**Fix**:
```javascript
// Add this to console to test:
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('Install prompt event fired!', e);
});
// Then reload page. If you don't see this log, criteria not met.
```

### Issue: Manifest shows "Flamia" not store name

**Causes**:
1. Manifest API endpoint not returning store data
2. Old manifest cached
3. Wrong URL being fetched

**Fix**:
```bash
# Check manifest URL in DevTools → Network tab
# Should be:
https://[supabase-url]/functions/v1/generate-manifest?slug=storename&type=seller

# Test manually in browser:
# Visit that URL - should return JSON with store name
```

### Issue: Service worker fails to register

**Causes**:
1. HTTPS not enabled
2. `storefront-sw.js` file missing
3. CORS issues
4. Scope conflicts

**Fix**:
```bash
# Verify file exists:
Check: https://yoursite.com/storefront-sw.js
Should return JavaScript code

# Check HTTPS:
URL must start with https:// (or http://localhost)

# Check scope:
Make sure scope in DynamicManifest matches URL structure
```

### Issue: Icons don't show store logo

**Causes**:
1. Logo URL not in database
2. Manifest using fallback icons
3. CORS blocking logo loading

**Fix**:
```bash
# Check in database:
SELECT logo_url FROM seller_shops WHERE slug = 'storename';

# Test logo URL directly in browser
# Should load image, not 404

# Check manifest icons:
DevTools → Application → Manifest → Icons
Should show logo URL, not /images/icon.png
```

## Manual Testing Steps

### Desktop (Chrome)

1. Visit storefront: `https://storename.flamia.store`
2. Clear all caches (see step 1 above)
3. Reload page
4. Check manifest in DevTools
5. Look for "Install App" button in header
6. Click button
7. Browser should show install dialog with:
   - Store name
   - Store logo
   - Install button
8. Click Install
9. App should open in standalone window
10. Check app name in taskbar/dock

### Mobile (Android)

1. Visit storefront in Chrome
2. Clear site data (Settings → Site settings → Clear)
3. Reload page
4. Banner should appear: "Add [Store Name] to Home screen"
5. Or tap "Install App" button
6. Choose "Add"
7. App installs to home screen
8. Tap app icon - opens in standalone mode

### Mobile (iOS Safari)

1. Visit storefront
2. Tap Share button (square with arrow)
3. Scroll and tap "Add to Home Screen"
4. Should show:
   - Store name
   - Store icon
5. Tap "Add"
6. App appears on home screen

## Verification Commands

### Check if Service Worker is running:
```javascript
// In browser console:
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Registered SWs:', regs.map(r => ({
    scope: r.scope,
    active: r.active?.scriptURL
  })));
});
```

### Check if app is installable:
```javascript
// In browser console:
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('✅ App is installable!');
});
// Then reload. If no log appears, app is NOT installable.
```

### Check manifest data:
```javascript
// In browser console:
fetch(document.querySelector('link[rel="manifest"]').href)
  .then(r => r.json())
  .then(manifest => console.log('Manifest:', manifest));
```

### Force manifest refresh:
```javascript
// In browser console:
const link = document.querySelector('link[rel="manifest"]');
link.href = link.href + '?t=' + Date.now();
```

## Support

If still not working after all checks:

1. **Copy these logs** and share them:
   - Console errors
   - Network tab showing manifest request
   - Service Workers tab screenshot
   - Application → Manifest screenshot

2. **Test on different**:
   - Browser (Chrome, Edge, Firefox)
   - Device (desktop, mobile)
   - Network (sometimes corporate networks block PWA)

3. **Verify basics**:
   - Site loads over HTTPS ✅
   - No console errors ✅
   - Store exists in database ✅
   - Logo uploaded ✅

---

**Last Updated**: November 2025

