# Quick Reference Guide - Cheat Sheet

A quick lookup guide for common tasks, commands, and patterns in Ballot Builder.

## File Organization

```
Where to put your code:

📱 UI Components          → src/components/
📺 Full Screens          → src/screens/
⚙️  Business Logic       → src/services/
🗃️  Data Structures      → src/models/
🔧 Helper Functions      → src/utils/
🧭 Navigation Setup      → src/navigation/
```

## Common TypeScript Patterns

### Define an Interface

```typescript
export interface MyData {
  id: string;
  name: string;
  count: number;
  optional?: boolean; // ? means optional
}
```

### Define a Type

```typescript
export type Status = 'pending' | 'success' | 'error';
export type Callback = (data: string) => void;
```

### Use Generics

```typescript
// Array of specific type
const items: BallotItem[] = [];

// Promise that resolves to BallotItem
const fetchItem = async (): Promise<BallotItem> => {
  // ...
};
```

## React Native Components

### Basic Component

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const MyComponent = () => {
  return (
    <View style={styles.container}>
      <Text>Hello!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
```

### Component with Props

```typescript
interface MyProps {
  title: string;
  count: number;
  onPress: () => void;
}

export const MyComponent: React.FC<MyProps> = ({ title, count, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}: {count}</Text>
    </TouchableOpacity>
  );
};
```

### Component with State

```typescript
import { useState } from 'react';

export const Counter = () => {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  return (
    <View>
      <Text>{count}</Text>
      <Button title="+" onPress={increment} />
    </View>
  );
};
```

### Component with Effect (runs on mount)

```typescript
import { useEffect, useState } from 'react';

export const DataLoader = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // This runs when component mounts
    fetchData().then(setData);
  }, []); // Empty array = run once on mount

  return <View>{/* render data */}</View>;
};
```

## Common Hooks

```typescript
// State
const [value, setValue] = useState(initialValue);

// Effect (runs after render)
useEffect(() => {
  // do something
  return () => {
    // cleanup
  };
}, [dependencies]);

// Context
const value = useContext(MyContext);

// Ref (for accessing DOM or storing mutable values)
const ref = useRef(initialValue);

// Callback (memoized function)
const memoizedCallback = useCallback(() => {
  // function
}, [dependencies]);

// Memo (memoized value)
const memoizedValue = useMemo(() => {
  return expensiveCalculation();
}, [dependencies]);
```

## Styling Patterns

### Basic Styles

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
```

### Flexbox (most common layout)

```typescript
{
  // Container
  flexDirection: 'row' | 'column',
  justifyContent: 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around',
  alignItems: 'center' | 'flex-start' | 'flex-end' | 'stretch',

  // Item
  flex: 1, // Take up available space
}
```

### Conditional Styles

```typescript
<View style={[
  styles.base,
  isActive && styles.active,
  { backgroundColor: customColor }
]} />
```

## API Call Patterns

### Simple Fetch

```typescript
const data = await fetch('/api/endpoint').then(res => res.json());
```

### With Error Handling

```typescript
try {
  const response = await fetch('/api/endpoint');
  if (!response.ok) throw new Error('Request failed');
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Error:', error);
  throw error;
}
```

### POST Request

```typescript
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ key: 'value' }),
});
```

### With Loading State

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const loadData = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await fetchData();
    // use data
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

## Common React Native Components

### Layout

```typescript
<View>         {/* Basic container */}
<ScrollView>   {/* Scrollable container */}
<SafeAreaView> {/* Respects device safe areas */}
<KeyboardAvoidingView> {/* Moves content when keyboard opens */}
```

### Text & Input

```typescript
<Text>Hello</Text>
<TextInput
  value={text}
  onChangeText={setText}
  placeholder="Enter text"
/>
```

### Buttons & Touch

```typescript
<Button title="Click" onPress={handlePress} />
<TouchableOpacity onPress={handlePress}>
  <Text>Custom Button</Text>
</TouchableOpacity>
<Pressable onPress={handlePress}>
  <Text>Modern Touch</Text>
</Pressable>
```

### Lists

```typescript
<FlatList
  data={items}
  renderItem={({ item }) => <Text>{item.name}</Text>}
  keyExtractor={item => item.id}
/>
```

### Images

```typescript
<Image source={{ uri: 'https://...' }} style={styles.image} />
<Image source={require('./local-image.png')} />
```

### Other Useful

```typescript
<Modal visible={isVisible} onRequestClose={onClose}>
  {/* content */}
</Modal>

<ActivityIndicator size="large" color="#007AFF" />

<Switch value={enabled} onValueChange={setEnabled} />
```

## Navigation (React Navigation)

### Navigate to Screen

```typescript
navigation.navigate('ScreenName', { param: 'value' });
```

### Go Back

```typescript
navigation.goBack();
```

### Get Route Params

```typescript
const { param } = route.params;
```

### Set Navigation Options

```typescript
useEffect(() => {
  navigation.setOptions({
    title: 'Custom Title',
    headerRight: () => <Button title="Save" />,
  });
}, [navigation]);
```

## Array Methods (JavaScript)

```typescript
// Transform each item
const doubled = numbers.map(n => n * 2);

// Filter items
const evens = numbers.filter(n => n % 2 === 0);

// Find single item
const found = items.find(item => item.id === '123');

// Check if any match
const hasActive = items.some(item => item.active);

// Check if all match
const allValid = items.every(item => item.valid);

// Reduce to single value
const sum = numbers.reduce((acc, n) => acc + n, 0);

// Sort
const sorted = items.sort((a, b) => a.value - b.value);

// Get subset
const first3 = items.slice(0, 3);
```

## Async/Await Patterns

### Sequential (one after another)

```typescript
const result1 = await fetchData1();
const result2 = await fetchData2(result1);
const result3 = await fetchData3(result2);
```

### Parallel (all at once)

```typescript
const [result1, result2, result3] = await Promise.all([
  fetchData1(),
  fetchData2(),
  fetchData3(),
]);
```

### With Timeout

```typescript
const timeout = (ms: number) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
  );

const data = await Promise.race([
  fetchData(),
  timeout(5000), // 5 second timeout
]);
```

## Common Validation Patterns

### Email

```typescript
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
```

### Required Field

```typescript
const isRequired = (value: string) => {
  return value.trim().length > 0;
};
```

### Number Range

```typescript
const isInRange = (value: number, min: number, max: number) => {
  return value >= min && value <= max;
};
```

## Error Handling

### Try-Catch

```typescript
try {
  const result = await riskyOperation();
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Error Boundaries (for React errors)

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <Text>Something went wrong</Text>;
    }
    return this.props.children;
  }
}
```

## Git Commands

```bash
# Check status
git status

# Create new branch
git checkout -b feature-name

# Stage files
git add .
git add specific-file.ts

# Commit
git commit -m "Description of changes"

# Push to remote
git push origin branch-name

# Pull latest changes
git pull origin main

# See commit history
git log --oneline

# See changes
git diff

# Undo last commit (keep changes)
git reset HEAD~1

# Discard local changes
git checkout -- file-name.ts
```

## npm Commands

```bash
# Install dependencies
npm install

# Add new package
npm install package-name
npm install --save-dev package-name  # Dev dependency

# Remove package
npm uninstall package-name

# Run scripts (from package.json)
npm start
npm test
npm run build

# Update packages
npm update

# Check for outdated packages
npm outdated

# Clear cache
npm cache clean --force
```

## Debugging

### Console Methods

```typescript
console.log('Normal message');
console.error('Error message');
console.warn('Warning message');
console.table(arrayOfObjects);
console.time('operation');
// ... code ...
console.timeEnd('operation');
```

### React Native Debugger

```typescript
// In code
debugger; // Pauses execution

// In app
// Shake device → Enable Remote JS Debugging
```

### Check if Variable is What You Think

```typescript
console.log('Type:', typeof variable);
console.log('Value:', JSON.stringify(variable, null, 2));
console.log('Is Array?:', Array.isArray(variable));
console.log('Is null?:', variable === null);
console.log('Is undefined?:', variable === undefined);
```

## Performance Tips

```typescript
// ❌ Don't: Create function in render
<Button onPress={() => handlePress(item.id)} />

// ✅ Do: Use callback
const handleItemPress = useCallback(() => {
  handlePress(item.id);
}, [item.id]);
<Button onPress={handleItemPress} />

// ❌ Don't: Inline object in props (creates new object each render)
<Component style={{ margin: 10 }} />

// ✅ Do: Use StyleSheet
const styles = StyleSheet.create({ container: { margin: 10 } });
<Component style={styles.container} />

// ❌ Don't: Expensive calculation in render
const total = items.reduce((sum, item) => sum + item.price, 0);

// ✅ Do: Memoize
const total = useMemo(
  () => items.reduce((sum, item) => sum + item.price, 0),
  [items]
);
```

## Common Gotchas

### 1. Async in useEffect

```typescript
// ❌ Wrong
useEffect(async () => {
  const data = await fetchData();
}, []);

// ✅ Correct
useEffect(() => {
  const loadData = async () => {
    const data = await fetchData();
  };
  loadData();
}, []);
```

### 2. State Updates are Async

```typescript
// ❌ Wrong
setCount(count + 1);
console.log(count); // Still old value!

// ✅ Correct
setCount(prevCount => {
  const newCount = prevCount + 1;
  console.log(newCount); // New value
  return newCount;
});
```

### 3. Dependency Arrays

```typescript
// Runs on every render
useEffect(() => { });

// Runs once on mount
useEffect(() => { }, []);

// Runs when value changes
useEffect(() => { }, [value]);

// ⚠️  If you use a variable, include it!
useEffect(() => {
  console.log(count); // count should be in deps!
}, [count]);
```

## Testing Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test MyComponent.test.tsx

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

## Useful VSCode Shortcuts

```
Ctrl/Cmd + P       - Quick file open
Ctrl/Cmd + Shift + P - Command palette
Ctrl/Cmd + /       - Toggle comment
Ctrl/Cmd + D       - Select next occurrence
Alt + Up/Down      - Move line up/down
Ctrl/Cmd + Space   - Trigger autocomplete
F12                - Go to definition
Shift + F12        - Find all references
```

## Common Error Messages & Fixes

### "Cannot read property 'X' of undefined"
**Fix:** Variable is undefined. Check with `variable?.property`

### "Objects are not valid as a React child"
**Fix:** You're trying to render an object. Use `JSON.stringify()` or render its properties.

### "Maximum update depth exceeded"
**Fix:** Infinite loop in `useEffect`. Check dependencies array.

### "Element type is invalid"
**Fix:** Wrong import. Check `import { Component }` vs `import Component`.

### "Module not found"
**Fix:** Run `npm install`. Or check import path.

## Helpful Resources

### Documentation
- React Native: https://reactnative.dev
- React: https://react.dev
- TypeScript: https://typescriptlang.org

### When Stuck
1. Read the error message carefully
2. Google: "react native [error message]"
3. Check Stack Overflow
4. Ask the team
5. Use AI assistants (ChatGPT, Claude)

---

## Ballot Builder Specific

### Our File Naming

```
Components:     PascalCase.tsx       (ConfidenceGauge.tsx)
Screens:        PascalCase.tsx       (BallotBrowserScreen.tsx)
Services:       camelCase.ts         (ballotService.ts)
Utils:          camelCase.ts         (cosineSimilarity.ts)
Models:         PascalCase.ts        (BallotItem.ts)
```

### Our Style Guide

```typescript
// Use named exports
export const MyComponent = () => { };

// Use interfaces for objects
interface Props { }

// Use types for unions/primitives
type Status = 'active' | 'inactive';

// Comments for public APIs
/**
 * Calculates confidence score
 * @param similarity - Cosine similarity value
 * @returns Confidence percentage (0-100)
 */
export const calculateConfidence = (similarity: number): number => { };
```

### Common Patterns in Our App

```typescript
// Confidence calculation
const confidence = similarityToConfidence(
  cosineSimilarity(userVector, itemVector)
);

// API calls
const data = await ballotService.fetchBallot(userId);

// Navigation
navigation.navigate('BallotBrowser', { ballotId });

// Error handling
try {
  // operation
} catch (error) {
  console.error('Operation failed:', error);
  Alert.alert('Error', 'Something went wrong');
}
```

---

**Keep this file handy! Bookmark it in your browser or IDE.**

*Last updated: January 9, 2026*
