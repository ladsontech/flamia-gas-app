# Store Owner's Guide - Independent PWA Login

This guide explains how store owners (sellers and affiliates) can use their own storefront PWA **independently** without needing the main Flamia app.

## 🎯 Key Benefits

✅ **No Main App Required**: Store owners don't need to install Flamia's main app
✅ **Direct Login**: Log in directly to your storefront PWA
✅ **Independent Experience**: Your store operates as a standalone app
✅ **Persistent Sessions**: Stay logged in on your storefront
✅ **Full Store Management**: Access all your store features

---

## 📱 For Store Owners

### Option 1: Install Your Storefront as a PWA (Recommended)

#### On Desktop (Chrome/Edge):

1. **Visit your storefront**:
   - Subdomain: `https://yourstorename.flamia.store`
   - Or: `https://flamia.store/shop/yourstorename`

2. **Install the app**:
   - Click the "Install App" button in the header
   - Or: Click the install icon (⊕) in the address bar
   - Or: Menu → Install [Your Store Name]

3. **Your app installs** with:
   - Your store name (not "Flamia")
   - Your store logo
   - Your custom colors

4. **Open your installed app** from:
   - Desktop shortcut
   - Start Menu/Applications folder
   - Taskbar (Windows) / Dock (Mac)

5. **Log in directly**:
   - Click "Sign In" in your app
   - You'll see YOUR store's login page
   - Login options:
     - **Google** (one-click)
     - **Email & Password**
     - **Magic Link** (passwordless)

#### On Mobile (Android):

1. Visit your storefront in Chrome
2. Tap "Install App" button or "Add to Home Screen" banner
3. App installs to home screen with YOUR branding
4. Open app and sign in directly

#### On Mobile (iOS):

1. Visit your storefront in Safari
2. Tap Share button → "Add to Home Screen"
3. App appears on home screen with YOUR branding
4. Open app and sign in directly

---

### Option 2: Direct Browser Access (No Installation)

You can also manage your store without installing:

1. **Bookmark your storefront**:
   - `https://yourstorename.flamia.store`

2. **Sign in when you visit**:
   - Click "Sign In"
   - Choose your login method
   - You stay logged in (persistent session)

---

## 🔐 Authentication Methods

### 1. Google Sign In (Fastest)
- One-click login
- No password to remember
- Most secure

### 2. Email & Password
- Traditional login
- Create password during signup
- Reset password if forgotten

### 3. Magic Link (Passwordless)
- Enter email only
- Click link sent to email
- No password needed

---

## 🔄 How It Works

### For Seller Storefronts:

**Your Login URL**: 
- `https://yourstorename.flamia.store/login`
- Or: `https://flamia.store/shop/yourstorename/login`

**After Login**:
- Redirects back to YOUR storefront
- Session persists in YOUR app
- Access store dashboard
- Manage products
- View orders

### For Affiliate Storefronts:

**Your Login URL**:
- `https://flamia.store/affiliate/yourname/login`

**After Login**:
- Redirects to YOUR affiliate storefront
- Track commissions
- View performance
- Manage products

---

## 💡 Common Questions

### Q: Do customers need to sign in?
**A:** No! Customers can browse and order **without signing in**. Only YOU (the store owner) need to sign in to manage your store.

### Q: Do I need the main Flamia app installed?
**A:** No! Your storefront PWA is **completely independent**. You don't need Flamia's main app at all.

### Q: Can I have both apps installed?
**A:** Yes, you can have:
- Your storefront PWA (for managing your store)
- Flamia's main PWA (for ordering from other stores)

They're **separate apps** and won't conflict.

### Q: Will my login work on both my phone and computer?
**A:** Yes! Your Flamia account works across all devices. Sign in once on each device, and you stay logged in.

### Q: What if I forget my password?
**A:** 
1. Go to your login page
2. Click "Forgot password?"
3. Enter your email
4. Follow reset instructions
5. Or use "Send Magic Link" to log in without password

### Q: Can I use my storefront offline?
**A:** Yes! Once your PWA is installed:
- View your products offline
- Browse offline
- Some features require internet (orders, updates)

---

## 🚀 Quick Start Guide for New Store Owners

### Step 1: Set Up Your Store (One Time)
1. Sign up on Flamia
2. Create your store
3. Upload logo (becomes your PWA icon)
4. Add products

### Step 2: Install Your Storefront PWA
1. Visit your storefront URL
2. Click "Install App"
3. App installs with YOUR branding

### Step 3: Log In to Your App
1. Open your installed app
2. Click "Sign In"
3. Choose login method
4. You're in!

### Step 4: Manage Your Store
- Add/edit products
- View orders
- Track sales
- Update settings

---

## 🔧 Technical Details

### Session Persistence

Your login session is stored:
- **In browser**: Cookies + LocalStorage
- **In PWA**: IndexedDB + Service Worker
- **Duration**: 30 days (configurable)

### Security

- Secure HTTPS connections
- OAuth 2.0 authentication
- JWT tokens
- Session encryption
- CORS protection

### Multi-Device Support

Your account syncs across:
- Desktop PWA
- Mobile PWA
- Web browser
- All devices simultaneously

---

## 📊 Comparison

| Feature | Your Storefront PWA | Main Flamia App |
|---------|-------------------|-----------------|
| **Your Store Products** | ✅ Full access | ❌ Not shown |
| **Your Branding** | ✅ Your name/logo | ❌ Flamia branding |
| **Store Dashboard** | ✅ Full access | ❌ No access |
| **Order Management** | ✅ Your orders only | ✅ All orders |
| **Independent** | ✅ Standalone app | ✅ Standalone app |
| **Installation** | ✅ Optional | ✅ Optional |
| **Direct Login** | ✅ Direct sign in | ✅ Direct sign in |

---

## 🆘 Troubleshooting

### Issue: Can't see "Install App" button

**Solutions**:
1. Make sure you're using Chrome or Edge
2. Check you're on HTTPS
3. Try refreshing the page
4. Clear browser cache

### Issue: Login redirects to Flamia

**Solution**: Make sure you're using the direct login page:
- `/shop/yourstore/login`
- Not the old auth page

### Issue: Session expires quickly

**Solutions**:
1. Stay logged in checkbox
2. Use "Remember Me"
3. Don't clear browser data
4. Keep PWA installed

### Issue: Different login on phone vs desktop

**Solution**: You need to sign in separately on each device, but use the same email/account.

---

## 📞 Support

Need help?

1. **Documentation**: This guide
2. **Email**: support@flamia.store
3. **In-App**: Help center
4. **Phone**: +256 XXX XXX XXX

---

## 🎉 Benefits of Your Own PWA

### For You (Store Owner):

✅ **Professional Image**: Your own branded app
✅ **Customer Trust**: Customers see YOUR brand
✅ **Independence**: Not tied to Flamia's main app
✅ **Home Screen**: Your icon on customer devices
✅ **Push Notifications**: Send YOUR store updates
✅ **Offline Access**: Manage store without internet
✅ **Fast Loading**: App-like performance
✅ **Easy Management**: One place for everything

### For Your Customers:

✅ **Branded Experience**: Shopping in YOUR store
✅ **Fast Access**: One tap to your store
✅ **Offline Browsing**: View products offline
✅ **Push Notifications**: Store updates from YOU
✅ **App-Like**: Feels like a native app
✅ **Home Screen**: Quick access

---

## 📝 Summary

**You DON'T need**:
- ❌ Flamia's main app installed
- ❌ To log in through Flamia first
- ❌ Multiple apps to manage your store

**You DO get**:
- ✅ Your own branded PWA
- ✅ Direct login to YOUR store
- ✅ Complete independence
- ✅ Professional store management
- ✅ Customer confidence

Your storefront PWA is **your own independent store app** - no main app required!

---

**Last Updated**: November 2025  
**Version**: 2.0.0  
**For**: Store Owners (Sellers & Affiliates)

