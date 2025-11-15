# Multi-Tenant PWA System for Flamia

This document describes the complete multi-tenant PWA (Progressive Web App) implementation that allows each seller and affiliate to have their own branded, installable PWA on their subdomain (e.g., `sellername.flamia.store`).

## 🎯 Features

- ✅ **Separate PWA per Storefront**: Each seller/affiliate gets their own installable app
- ✅ **Custom Branding**: Store name, logo, colors, and icons per storefront
- ✅ **Subdomain Support**: Full support for `storename.flamia.store` subdomains
- ✅ **Dynamic Manifests**: Auto-generated `manifest.json` for each store
- ✅ **Scoped Service Workers**: Each storefront has its own service worker scope
- ✅ **Install Button**: Visible "Install App" button on all storefronts
- ✅ **Automatic Icon Generation**: PWA icons generated from uploaded logos
- ✅ **Offline Support**: Service workers enable offline functionality
- ✅ **Push Notifications**: Support for store-specific notifications

## 📁 System Architecture

### 1. **Dynamic Manifest Generation**
**Location**: `supabase/functions/generate-manifest/index.ts`

Generates a unique `manifest.json` for each storefront with:
- Store-specific name and description
- Custom app icons (from logo)
- Custom theme color
- Proper scope and start URL
- Shortcuts and categories

**Usage**:
```
GET https://[supabase-url]/functions/v1/generate-manifest?slug=storename&type=seller
```

### 2. **Service Worker Generation**
**Location**: `supabase/functions/generate-sw/index.ts`

Generates a scoped service worker for each storefront with:
- Store-specific cache name
- Proper scope restriction
- Offline page support
- Background sync for orders
- Push notification handling

**Usage**:
```
GET https://[supabase-url]/functions/v1/generate-sw?slug=storename&type=seller
```

### 3. **Dynamic Manifest Component**
**Location**: `src/components/DynamicManifest.tsx`

Client-side component that:
- Detects storefront type (seller/affiliate/subdomain)
- Updates manifest link to API endpoint
- Registers appropriate service worker
- Updates meta tags (theme color, app title)

### 4. **Install Button Component**
**Location**: `src/components/storefront/InstallButton.tsx`

Visible "Install App" button that:
- Shows on all storefronts (seller & affiliate)
- Detects if app is already installed
- Handles browser install prompt
- Provides iOS instructions
- Shows installed state

### 5. **Icon Generation Utilities**
**Locations**:
- `src/utils/iconGenerator.ts` - Client-side validation
- `supabase/functions/generate-pwa-icons/index.ts` - Server-side generation

Handles:
- Icon validation (size, aspect ratio, format)
- Multiple size generation (192x192, 512x512)
- Maskable icon variants with safe zones
- Automatic upload to storage

## 🚀 How It Works

### For Sellers (Subdomain: `seller.flamia.store`)

1. **Seller Creates Shop**: Seller signs up and creates their shop
2. **Upload Logo**: Seller uploads shop logo (minimum 512x512px)
3. **Icon Generation**: System automatically generates PWA icons
4. **Manifest Created**: Dynamic manifest available at API endpoint
5. **Service Worker**: Subdomain-scoped service worker registered
6. **Install Button**: "Install App" button visible on storefront
7. **Customer Installs**: Customers can install seller's branded PWA

### For Affiliates (Route: `/affiliate/slug`)

Same process as sellers, but:
- Uses `/affiliate/slug` routes instead of subdomains
- Service worker scoped to `/affiliate/slug/`
- Manifest ID prefixed with `affiliate-`

### For Main Flamia Store

- Uses static `/manifest.json`
- Uses static `/sw.js` service worker
- Completely separate from seller/affiliate PWAs
- No conflicts with storefront PWAs

## 📋 Database Schema

### Seller Shops Table
```sql
seller_shops
  - id (uuid)
  - shop_name (text) -- Used in PWA name
  - slug (text) -- Used for subdomain
  - description (text) -- PWA description
  - logo_url (text) -- Source for PWA icons
  - theme_color (text) -- PWA theme color
  - pwa_icons (jsonb) -- Generated icon URLs
  - pwa_icons_generated_at (timestamp)
```

### Affiliate Shops Table
```sql
affiliate_shops
  - id (uuid)
  - shop_name (text)
  - slug (text)
  - description (text)
  - logo_url (text)
  - theme_color (text)
  - pwa_icons (jsonb)
  - pwa_icons_generated_at (timestamp)
```

## 🛠️ Setup Instructions

### 1. Deploy Supabase Functions

```bash
# Deploy manifest generator
supabase functions deploy generate-manifest

# Deploy service worker generator
supabase functions deploy generate-sw

# Deploy icon generator (optional, for auto-generation)
supabase functions deploy generate-pwa-icons
```

### 2. Configure DNS for Subdomains

Set up wildcard DNS record:
```
*.flamia.store CNAME flamia.store
```

### 3. Configure SSL for Subdomains

Ensure SSL certificates cover:
- `flamia.store`
- `*.flamia.store`

### 4. Update Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Enable Service Worker Registration

The `DynamicManifest` component automatically handles service worker registration for storefronts.

## 📱 Testing PWA Installation

### Desktop (Chrome/Edge)
1. Visit seller storefront: `https://sellername.flamia.store`
2. Look for "Install App" button in header
3. Click to install
4. App opens in standalone window

### Mobile (Android)
1. Visit storefront in Chrome
2. "Add to Home Screen" banner appears
3. Or click "Install App" button
4. App installs to home screen

### Mobile (iOS)
1. Visit storefront in Safari
2. Click "Install App" button
3. Follow instructions: Share → Add to Home Screen
4. App installs to home screen

## 🎨 Customization Guide

### For Sellers: Customize Your PWA

1. **Shop Name**: Set in seller dashboard → becomes PWA name
2. **Logo**: Upload square logo (recommended 1024x1024px)
3. **Theme Color**: Choose primary color → becomes PWA theme
4. **Description**: Write shop description → becomes PWA description

### Logo Requirements

- **Format**: PNG, JPG, or WebP
- **Size**: Minimum 512x512px (recommended 1024x1024px)
- **Aspect Ratio**: 1:1 (square)
- **File Size**: Under 1MB
- **Background**: Transparent or white recommended
- **Content**: Center your logo, avoid edges

### Best Practices

1. **Simple Logo**: Works well at small sizes
2. **High Contrast**: Readable on various backgrounds
3. **No Text**: Logos without text scale better
4. **Square Design**: Designed for square format
5. **Safe Zones**: Keep important content 10% from edges

## 🔧 Troubleshooting

### PWA Not Installing

**Problem**: Install button doesn't appear
**Solutions**:
- Ensure HTTPS is enabled
- Check manifest is loading (DevTools → Application → Manifest)
- Verify service worker is registered
- Clear browser cache

**Problem**: Manifest errors
**Solutions**:
- Check API endpoint is accessible
- Verify shop slug in URL
- Ensure logo URL is valid
- Check CORS headers

### Service Worker Issues

**Problem**: Service worker not registering
**Solutions**:
- Check scope matches URL structure
- Verify service worker URL is correct
- Clear existing service workers
- Check browser console for errors

**Problem**: Multiple service workers conflict
**Solutions**:
- Each scope should be unique
- Unregister conflicting workers
- Check service worker scope in registration

### Icon Issues

**Problem**: Icons not displaying
**Solutions**:
- Verify logo URL is publicly accessible
- Check icon sizes are correct (192, 512)
- Ensure CORS allows icon loading
- Regenerate icons from dashboard

## 🔒 Security Considerations

1. **Service Worker Scope**: Each SW is scoped to prevent conflicts
2. **Manifest CORS**: Proper CORS headers on all endpoints
3. **Asset URLs**: All assets served over HTTPS
4. **Logo Validation**: Client-side validation before upload
5. **Storage Security**: Icons stored in public bucket with proper permissions

## 📊 Analytics & Monitoring

Track PWA metrics:
- Install events (from service worker)
- App opens (via `?source=pwa` parameter)
- Offline usage (service worker fetch events)
- Push notification engagement

## 🚀 Future Enhancements

Potential improvements:
- [ ] Server-side image optimization (WebP, compression)
- [ ] Multiple theme color support
- [ ] App screenshots for install prompts
- [ ] Splash screen customization
- [ ] Advanced offline capabilities
- [ ] Background sync for offline orders
- [ ] Share target API integration
- [ ] File handler API for product imports

## 📖 Additional Resources

- [PWA Best Practices](https://web.dev/pwa-checklist/)
- [Web App Manifest Spec](https://w3c.github.io/manifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Maskable Icons](https://maskable.app/)

## 🆘 Support

For issues or questions:
1. Check browser console for errors
2. Verify all API endpoints are accessible
3. Test in Chrome DevTools (Application tab)
4. Review service worker logs
5. Check Supabase function logs

---

**Last Updated**: November 2025
**Version**: 1.0.0
**Status**: Production Ready ✅

