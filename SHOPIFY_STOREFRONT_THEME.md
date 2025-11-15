# Shopify-Inspired Storefront Theme Guide

This document outlines the complete transformation from Flamia's orange theme to Shopify's clean, professional aesthetic for all storefronts (seller & affiliate).

## 🎨 Color Scheme Changes

### Before (Flamia Theme):
- Primary: `#FF4D00` (Orange)
- Gradients: `from-orange-500 to-orange-600`
- Borders: `border-orange-200`
- Backgrounds: `bg-orange-50`

### After (Shopify Theme):
- Primary: `#008060` (Shopify Green)
- Primary Hover: `#006e52`
- Light Background: `#F7F8FA`
- Borders: `border-gray-200`
- No gradients - solid colors only

## 📐 Layout Structure (Shopify-like)

### Header
```
- Clean white background
- 64px height (h-16)
- Simple border-bottom (border-gray-200)
- Logo + Name on left
- Actions on right
- No gradients
```

### Navigation
```
- Sticky positioning
- White/light gray backgrounds
- Clear hierarchy
- Minimal shadows
```

### Content Area
```
- Max-width: 1280px (max-w-7xl)
- Padding: px-4 sm:px-6 lg:px-8
- White background
- Clean grid layouts
```

## 🔄 Component Transformations

### 1. Buttons

**Primary Button:**
```jsx
// OLD (Flamia)
className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"

// NEW (Shopify)
className="bg-[#008060] hover:bg-[#006e52] text-white font-medium"
```

**Secondary/Outline Button:**
```jsx
// OLD
className="border-orange-300 hover:bg-orange-50 text-orange-600"

// NEW
className="border-gray-300 hover:bg-gray-50 text-gray-700"
```

### 2. Headers

**Section Headers:**
```jsx
// OLD
className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 text-transparent bg-clip-text"

// NEW
className="text-2xl font-semibold text-gray-900"
```

**Subheaders:**
```jsx
// OLD
className="text-gray-600 font-medium"

// NEW
className="text-gray-700 font-medium"
```

### 3. Input Fields

```jsx
// OLD
className="border-gray-300 rounded-full focus:border-orange-500 focus:ring-orange-500"

// NEW
className="border-gray-300 rounded-md focus:border-[#008060] focus:ring-1 focus:ring-[#008060]"
```

### 4. Product Cards

```jsx
// OLD
className="bg-white rounded-lg shadow-md hover:shadow-xl border-orange-100"

// NEW
className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
```

### 5. Badges/Tags

```jsx
// OLD - Featured badge
className="bg-orange-500 text-white"

// NEW
className="bg-[#008060] text-white"
```

### 6. Icons & Avatars

```jsx
// OLD - Avatar background
className="bg-orange-500"

// NEW
className="bg-[#008060]"
```

## 📋 Specific Component Updates

### StorefrontHeader (`src/components/storefront/StorefrontHeader.tsx`) ✅

**Changes Applied:**
- White background (no gradient)
- Clean border-bottom
- Shopify green for primary actions
- Simplified layout
- 64px height
- Clean spacing

### SellerStorefront (`src/pages/SellerStorefront.tsx`) ⚠️ Partial

**Changes Applied:**
- Shop info banner: white background, clean borders
- Search bar: gray background, rounded corners
- Filter buttons: Shopify green when active
- Removed gradients

**Still Needs Update:**
- Desktop filters sidebar
- Product grid section styles
- Empty state messages
- View mode toggles

### AffiliateStorefront (`src/pages/AffiliateStorefront.tsx`) ⚠️ Needs Update

Apply same transformations as SellerStorefront.

## 🎯 Complete Styling Patterns

### 1. Container Widths
```jsx
// Standard container
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
```

### 2. Section Spacing
```jsx
// Section padding
className="py-6 sm:py-8"

// Section margins
className="space-y-6"
```

### 3. Border Styles
```jsx
// Standard border
className="border border-gray-200"

// Divider
className="border-b border-gray-200"
```

### 4. Shadow Styles
```jsx
// Card shadow
className="shadow-sm hover:shadow-md"

// No heavy shadows - keep it minimal
```

### 5. Text Colors
```jsx
// Heading: text-gray-900
// Body: text-gray-700
// Secondary: text-gray-600
// Tertiary: text-gray-500
```

### 6. Background Colors
```jsx
// Main: bg-white
// Alt: bg-gray-50
// Surface: bg-gray-100
```

## 🔧 Global Find & Replace Guide

Use these patterns to complete the transformation:

### Color Replacements

```
FIND: bg-orange-500
REPLACE: bg-[#008060]

FIND: bg-orange-600
REPLACE: bg-[#006e52]

FIND: hover:bg-orange-600
REPLACE: hover:bg-[#006e52]

FIND: border-orange-200
REPLACE: border-gray-200

FIND: border-orange-300
REPLACE: border-gray-300

FIND: bg-orange-50
REPLACE: bg-gray-50

FIND: text-orange-600
REPLACE: text-[#008060]

FIND: text-orange-500
REPLACE: text-[#008060]
```

### Gradient Removals

```
FIND: bg-gradient-to-r from-orange-
REPLACE: bg-

FIND: text-transparent bg-clip-text
REPLACE: text-gray-900
```

### Border Radius

```
FIND: rounded-full
REPLACE: rounded-md (for buttons/inputs)

FIND: rounded-lg
KEEP: rounded-lg (for cards)
```

## 📊 Component Checklist

### ✅ Completed
- [x] StorefrontHeader
- [x] Header navigation
- [x] Sign in button
- [x] Avatar styling
- [x] Shop info banner
- [x] Search bar
- [x] Mobile filter buttons
- [x] Category buttons
- [x] Sort buttons
- [x] Theme colors file created

### ⚠️ Partially Complete
- [x] SellerStorefront layout
- [ ] Desktop filters
- [ ] Product grid
- [ ] Product cards styling

### ❌ To Do
- [ ] AffiliateStorefront (apply same as SellerStorefront)
- [ ] StorefrontLayout background
- [ ] ProductCard component (if custom for storefronts)
- [ ] Analytics sections
- [ ] Store performance widgets
- [ ] Empty states
- [ ] Loading states
- [ ] Modal/Sheet headers

## 🎨 Shopify Design Principles

### 1. **Simplicity**
- Clean, uncluttered
- Plenty of whitespace
- Clear hierarchy

### 2. **Consistency**
- Same spacing system
- Same border radius
- Same shadow depth

### 3. **Professional**
- No playful gradients
- Solid, trusted colors
- Clean typography

### 4. **Minimal**
- Subtle shadows
- Clean borders
- Light backgrounds

### 5. **Functional**
- Clear CTAs
- Easy navigation
- Obvious interactions

## 📱 Responsive Design

### Mobile (< 768px)
- Stack elements vertically
- Full-width buttons
- Sheet/drawer for filters
- Simplified navigation

### Tablet (768px - 1024px)
- 2-3 column grids
- Some sidebar elements
- Medium spacing

### Desktop (> 1024px)
- Full sidebar navigation
- 3-4 column grids
- Maximum spacing
- All features visible

## 🚀 Implementation Steps

### Phase 1: Core Components ✅
1. Theme colors file
2. Header component
3. Navigation

### Phase 2: Layout (In Progress)
1. Container widths
2. Section spacing
3. Background colors

### Phase 3: Interactive Elements
1. All buttons
2. Input fields
3. Dropdowns
4. Toggles

### Phase 4: Content
1. Product cards
2. Product grids
3. Empty states
4. Loading states

### Phase 5: Polish
1. Hover states
2. Transitions
3. Focus states
4. Accessibility

## 💡 Quick Reference

### Shopify Green
- Primary: `#008060`
- Hover: `#006e52`
- Light: `#e8f5f2`

### Typography
- Heading: `font-semibold text-gray-900`
- Body: `font-normal text-gray-700`
- Caption: `text-sm text-gray-600`

### Spacing
- Section: `py-6 sm:py-8`
- Container: `px-4 sm:px-6 lg:px-8`
- Gap: `gap-4` or `gap-6`

### Borders
- Standard: `border border-gray-200`
- Radius: `rounded-md` or `rounded-lg`

### Shadows
- Card: `shadow-sm hover:shadow-md`
- None for flat design

---

## 🔍 Testing Checklist

- [ ] All orange colors removed
- [ ] All gradients removed
- [ ] Buttons use Shopify green
- [ ] Clean borders everywhere
- [ ] Proper spacing (max-w-7xl)
- [ ] Consistent typography
- [ ] Hover states work
- [ ] Mobile responsive
- [ ] No visual bugs

---

**Status**: Theme transformation in progress  
**Files Modified**: StorefrontHeader, SellerStorefront (partial)  
**Files Pending**: AffiliateStorefront, ProductCard, remaining sections

**Next Steps**: Apply color replacements to remaining components using the find & replace guide above.

