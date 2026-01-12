# Mobile-First Styling Guide

How to make your web prototype look and feel like a native mobile app.

## Key Principles

1. **Design for mobile first** - Start with phone layout, expand for desktop
2. **Touch-friendly sizes** - Minimum 44px touch targets
3. **Bottom navigation** - Keep important actions within thumb reach
4. **Native-like animations** - Smooth, 60fps transitions
5. **Hide browser chrome** - Make it feel like an installed app

---

## Setup: Mobile-First CSS

### Basic Mobile-First Structure

```css
/* Mobile styles (default - most important!) */
.container {
  padding: 16px;
  max-width: 100%;
}

.button {
  font-size: 16px;
  padding: 16px;
  width: 100%;
}

/* Tablet styles (if needed) */
@media (min-width: 768px) {
  .container {
    padding: 24px;
    max-width: 600px;
    margin: 0 auto;
  }
}

/* Desktop styles */
@media (min-width: 1024px) {
  .container {
    max-width: 800px;
  }

  .button {
    width: auto;
    min-width: 200px;
  }
}
```

---

## HTML Meta Tags for Mobile

Add these to your `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

    <!-- Make it feel like a native app -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="mobile-web-app-capable" content="yes" />

    <!-- Theme color (shows in status bar) -->
    <meta name="theme-color" content="#007AFF" />

    <!-- App icons -->
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/app-icon.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />

    <title>Ballot Builder</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

---

## Progressive Web App (PWA) Manifest

Create `public/manifest.json`:

```json
{
  "short_name": "Ballot Builder",
  "name": "Ballot Builder - Smart Voting Assistant",
  "icons": [
    {
      "src": "app-icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "app-icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#007AFF",
  "background_color": "#ffffff",
  "orientation": "portrait"
}
```

**What this does:**
- Allows "Add to Home Screen" on phones
- Hides browser UI when opened from home screen
- Makes it feel like a real app!

---

## Mobile-First Component Styles

### App Container (Full Height)

```css
/* src/App.css */

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
  overflow-x: hidden;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 80px; /* Space for bottom nav */
}
```

### Swipe Card (Mobile-Optimized)

```css
/* src/components/SwipeCard.css */

.swipe-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  height: calc(100vh - 180px); /* Full height minus header */
  position: relative;
}

.swipe-card {
  width: 100%;
  max-width: 400px;
  min-height: 400px;
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: grab;
  user-select: none;
  transition: transform 0.1s ease;
  position: relative;
}

.swipe-card:active {
  cursor: grabbing;
}

.category-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  background: #007AFF;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.statement-text {
  font-size: 20px;
  line-height: 1.5;
  text-align: center;
  color: #333;
  margin: 0;
}

.swipe-indicators {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 30px;
  pointer-events: none;
}

.indicator {
  font-size: 18px;
  font-weight: bold;
  transition: opacity 0.2s;
}

.indicator.disagree {
  color: #FF3B30;
}

.indicator.agree {
  color: #34C759;
}

/* Touch-Friendly Buttons */
.button-controls {
  display: flex;
  gap: 20px;
  margin-top: 30px;
  width: 100%;
  max-width: 400px;
}

.btn-disagree,
.btn-agree {
  flex: 1;
  padding: 18px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.2s;

  /* Minimum touch target size */
  min-height: 56px;
}

.btn-disagree {
  background: #FF3B30;
  color: white;
}

.btn-agree {
  background: #34C759;
  color: white;
}

.btn-disagree:active,
.btn-agree:active {
  transform: scale(0.95);
}

/* Responsive adjustments */
@media (max-width: 375px) {
  .statement-text {
    font-size: 18px;
  }

  .swipe-card {
    min-height: 350px;
    padding: 25px;
  }
}
```

### Bottom Navigation Bar

```css
/* src/components/BottomNav.css */

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-around;
  padding: 8px 0 env(safe-area-inset-bottom); /* Safe area for iPhone notch */
  z-index: 100;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  transition: color 0.2s;
  color: #999;
  text-decoration: none;

  /* Touch target */
  min-height: 56px;
  justify-content: center;
}

.nav-item.active {
  color: #007AFF;
}

.nav-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
}

/* Desktop: Convert to sidebar or top nav */
@media (min-width: 768px) {
  .bottom-nav {
    position: relative;
    border-top: none;
    border-bottom: 1px solid #e0e0e0;
    justify-content: center;
    gap: 20px;
  }

  .nav-item {
    flex-direction: row;
    gap: 8px;
    flex: 0 0 auto;
  }

  .nav-label {
    font-size: 14px;
  }
}
```

### Confidence Gauge (Mobile-Optimized)

```css
/* src/components/ConfidenceGauge.css */

.confidence-gauge {
  padding: 20px;
  text-align: center;
  background: white;
  border-radius: 16px;
  margin: 16px 0;
}

.percentage {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 8px;
  /* Smooth color transition */
  transition: color 0.3s;
}

.label {
  font-size: 16px;
  color: #666;
  margin-bottom: 16px;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  border-radius: 6px;
  /* Smooth animation */
  transition: width 0.5s ease, background-color 0.3s;
}

.confidence-label {
  font-size: 14px;
  color: #999;
  font-weight: 500;
}

/* Desktop: Smaller, compact version */
@media (min-width: 768px) {
  .confidence-gauge {
    max-width: 300px;
    margin: 20px auto;
  }
}
```

---

## Touch Gestures (Advanced)

For even better mobile feel, use a gesture library:

```bash
npm install react-use-gesture
```

### Enhanced Swipe Card with Gestures

```typescript
import { useGesture } from 'react-use-gesture';
import { useSpring, animated } from 'react-spring';

export const SwipeCard: React.FC<SwipeCardProps> = ({ statement, onSwipe }) => {
  const [{ x, rotate, scale }, api] = useSpring(() => ({
    x: 0,
    rotate: 0,
    scale: 1,
  }));

  const bind = useGesture({
    onDrag: ({ movement: [mx], velocity, direction: [xDir], active }) => {
      const trigger = velocity > 0.2;

      if (!active && trigger) {
        const dir = xDir < 0 ? -1 : 1;
        onSwipe(dir < 0 ? 'disagree' : 'agree');
        api.start({ x: dir * 1000, rotate: dir * 45, scale: 0.8 });
      } else {
        api.start({
          x: active ? mx : 0,
          rotate: active ? mx / 10 : 0,
          scale: active ? 1.05 : 1,
        });
      }
    },
  });

  return (
    <animated.div
      {...bind()}
      style={{
        x,
        rotate,
        scale,
        touchAction: 'none',
      }}
      className="swipe-card"
    >
      {/* Card content */}
    </animated.div>
  );
};
```

---

## Smooth Animations

```css
/* Global smooth animations */
* {
  /* Hardware acceleration */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

/* Page transitions */
.page-enter {
  opacity: 0;
  transform: translateX(100%);
}

.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 300ms, transform 300ms;
}

.page-exit {
  opacity: 1;
  transform: translateX(0);
}

.page-exit-active {
  opacity: 0;
  transform: translateX(-100%);
  transition: opacity 300ms, transform 300ms;
}
```

---

## Testing on Mobile

### During Development:

1. **Get your local IP:**
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. **Start dev server:**
   ```bash
   npm start
   ```

3. **Access from phone:**
   - Open browser on phone
   - Go to: `http://YOUR_IP:3000`
   - Example: `http://192.168.1.100:3000`

### Chrome DevTools Mobile Emulation:

1. Open DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Select iPhone/Android device
4. Test different screen sizes

---

## Key Design Patterns for Mobile

### 1. Thumb Zone (Bottom 2/3 of Screen)

```
┌─────────────────┐
│   Safe Zone     │ ← Read-only content
│   (Top 1/3)     │
├─────────────────┤
│                 │
│   Thumb Zone    │ ← Interactive elements
│   (Bottom 2/3)  │ ← Buttons, swipes here
│                 │
└─────────────────┘
```

### 2. Touch Target Sizes

```css
/* Minimum 44x44px for touch targets */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 20px;
}

/* Ideal: 56x56px */
.primary-button {
  min-height: 56px;
  padding: 16px 24px;
}
```

### 3. Loading States

```css
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #007AFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## Example: Complete Mobile-First Screen

```typescript
// src/screens/SwipeScreen.tsx
import React, { useState } from 'react';
import { SwipeCard } from '../components/SwipeCard';
import { ProgressBar } from '../components/ProgressBar';
import './SwipeScreen.css';

export const SwipeScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalStatements = 30;
  const progress = ((currentIndex + 1) / totalStatements) * 100;

  return (
    <div className="swipe-screen">
      {/* Fixed header */}
      <header className="screen-header">
        <h1>Build Your Civic Blueprint</h1>
        <ProgressBar progress={progress} />
        <p className="progress-text">
          {currentIndex + 1} of {totalStatements}
        </p>
      </header>

      {/* Main content */}
      <main className="screen-content">
        <SwipeCard
          statement="Healthcare should be more affordable"
          category="healthcare"
          onSwipe={(direction) => {
            console.log('Swiped:', direction);
            setCurrentIndex(currentIndex + 1);
          }}
        />
      </main>

      {/* Bottom navigation (optional on this screen) */}
      <nav className="bottom-nav">
        <a className="nav-item" href="/home">
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </a>
        <a className="nav-item active" href="/swipe">
          <span className="nav-icon">👍</span>
          <span className="nav-label">Blueprint</span>
        </a>
        <a className="nav-item" href="/ballot">
          <span className="nav-icon">🗳️</span>
          <span className="nav-label">Ballot</span>
        </a>
      </nav>
    </div>
  );
};
```

---

## Install as App (PWA)

When users visit on mobile, they'll see "Add to Home Screen":

**iOS (Safari):**
1. Tap share button
2. Tap "Add to Home Screen"
3. Opens like native app!

**Android (Chrome):**
1. Tap menu (⋮)
2. Tap "Add to Home Screen"
3. App icon on home screen!

---

## Quick Checklist

- [ ] Mobile-first CSS (start with mobile styles)
- [ ] Viewport meta tag configured
- [ ] Touch targets min 44px
- [ ] Bottom navigation for primary actions
- [ ] Smooth animations (60fps)
- [ ] PWA manifest.json
- [ ] Test on actual phone
- [ ] Safe area insets for iPhone notch
- [ ] No horizontal scrolling
- [ ] Fast loading (<3 seconds)

---

## Resources

- **React Spring** - Smooth animations: https://www.react-spring.dev/
- **Framer Motion** - Alternative animation library: https://www.framer.com/motion/
- **Tailwind CSS** - Utility-first CSS: https://tailwindcss.com/
- **PWA Guide** - Progressive Web Apps: https://web.dev/progressive-web-apps/

---

**Result:** Your web app will look and feel like a native mobile app! 📱✨
