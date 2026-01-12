# Ballot Builder Prototype

This is a functional prototype of the Ballot Builder app using mock data and simplified logic.

## What's Implemented

✅ **Swipe Interface** - Swipe through 20 policy statements
✅ **Gesture Handling** - Smooth swipe animations with React Native Reanimated
✅ **Preference Tracking** - User responses are recorded and used to build preference vector
✅ **Confidence Calculation** - Real cosine similarity math to match users with ballot items
✅ **Mock Ballot** - 5 ballot items (3 measures, 2 candidate races)
✅ **Results Screen** - Shows recommendations with confidence scores

## Mock Data

### Statements (`data/statements.json`)
- 20 policy statements across 10 categories
- Each has a pre-defined vector for similarity matching
- Categories: healthcare, education, environment, economy, infrastructure, criminal justice, immigration, foreign policy, civil rights, technology

### Ballot (`data/ballot.json`)
- 5 ballot items (candidates and measures)
- Each candidate/measure has a vector for matching
- Includes descriptions, outcomes, and explanations

## Running the Prototype

### 1. Install Dependencies (Already Done)

```bash
cd frontend
npm install
```

### 2. Start the Development Server

```bash
npm start
```

This will open the Expo DevTools in your browser.

### 3. Choose Platform

**Web (Easiest):**
```bash
# Press 'w' in terminal, or
npm run web
```
Then open: http://localhost:8081

**iOS Simulator:**
```bash
# Press 'i' in terminal, or
npm run ios
```

**Android Emulator:**
```bash
# Press 'a' in terminal, or
npm run android
```

**Physical Device:**
1. Install "Expo Go" app from App Store / Play Store
2. Scan QR code from terminal

### 4. Navigate to Prototype Tab

Once the app loads:
1. You'll see a login/signup screen (this is from the existing app structure)
2. Tap the "Prototype" tab icon (flask icon) at the bottom
3. Start swiping!

## How It Works

### 1. Swipe Phase
- User swipes through policy statements
- Right = Agree, Left = Disagree
- Can also use buttons if swiping doesn't work
- Progress bar shows completion

### 2. Calculation
- Each response updates user's preference vector
- User vector = weighted average of all responses
- Agrees add positive weight, disagrees add negative weight

### 3. Results Phase
- User vector compared to each ballot item's vector
- Cosine similarity calculated (range: -1 to 1)
- Converted to confidence percentage (0-100%)
- Recommendations based on highest confidence

## Key Files

```
frontend/
├── app/(tabs)/
│   └── prototype.tsx         # Main prototype screen
├── components/
│   ├── SwipeCard.tsx         # Swipeable card component
│   └── ConfidenceGauge.tsx   # Confidence visualization
├── data/
│   ├── statements.json       # Policy statements
│   └── ballot.json           # Sample ballot
└── utils/
    └── scoring.ts            # Vector math & confidence calculation
```

## Testing on Your Phone

### Method 1: Via Expo Go (Easiest)
1. Install Expo Go from App Store or Play Store
2. Run `npm start` in terminal
3. Scan QR code with Camera app (iOS) or Expo Go app (Android)
4. App loads on your phone!

### Method 2: Via IP Address (Web)
1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig

   # Mac/Linux
   ifconfig
   ```
2. Start server: `npm run web`
3. On phone browser, go to: `http://YOUR_IP:8081`
4. Works like a mobile web app!

## Customizing the Prototype

### Add More Statements

Edit `frontend/data/statements.json`:

```json
{
  "id": "21",
  "text": "Your new policy statement",
  "category": "your-category",
  "vector": [0.5, 0.5, 0.5, 0.5, 0.5]
}
```

Note: Vectors are 5 dimensions. Values typically range 0-1.

### Add More Ballot Items

Edit `frontend/data/ballot.json`:

```json
{
  "id": "6",
  "type": "measure",
  "title": "Your New Measure",
  "description": "What it does",
  "vector": [0.5, 0.5, 0.5, 0.5, 0.5],
  "outcomes": {
    "yes": "What happens if it passes",
    "no": "What happens if it doesn't"
  }
}
```

### Adjust Styling

Edit component files:
- `components/SwipeCard.tsx` - Card appearance and animations
- `components/ConfidenceGauge.tsx` - Gauge colors and layout
- `app/(tabs)/prototype.tsx` - Overall screen layout

## Known Limitations

⚠️ **This is a prototype!** What's NOT implemented:

- ❌ No real AI (vectors are hardcoded)
- ❌ No backend/database
- ❌ No user accounts
- ❌ No address lookup
- ❌ No real ballot data
- ❌ No adaptive questions
- ❌ No chatbot
- ❌ No PDF export
- ❌ Responses don't persist (refresh = start over)

## What's Next?

After testing the prototype, you can:

1. **Gather feedback** - Show to 5-10 people, see what they think
2. **Iterate on design** - Adjust based on feedback
3. **Add features** - Pick one feature to make real (e.g., connect real AI)
4. **Convert to full app** - Use this as foundation for production version

## Troubleshooting

### "Cannot find module" errors
```bash
cd frontend
npm install
```

### Gesture handler not working
Make sure you installed dependencies. The SwipeCard uses `react-native-gesture-handler` which should be in package.json.

### App won't start
1. Make sure you're in the `frontend` directory
2. Clear cache: `npm start --clear`
3. Reinstall: `rm -rf node_modules && npm install`

### Web version looks weird
The app is designed for mobile. Use Chrome DevTools to emulate a phone:
1. Open DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Select iPhone or Android device

## Performance

The prototype should run smoothly at 60fps with:
- Smooth swipe animations
- Instant calculations (vectors are small)
- Fast results screen

If you experience lag, try:
- Reducing number of statements
- Simplifying animations
- Testing on better device

---

## Demo Flow

1. **Start**: See first statement with category badge
2. **Swipe/Tap**: Agree or disagree with 20 statements
3. **Progress**: Watch progress bar fill up
4. **Results**: See your civic blueprint matched with ballot
5. **Confidence**: View match percentages for each item
6. **Details**: Read explanations for measures, see all candidates

**Total time**: ~2-3 minutes for full flow

---

Built with ❤️ using Expo, React Native, and TypeScript
