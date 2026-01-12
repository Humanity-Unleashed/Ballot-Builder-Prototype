import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface SwipeCardProps {
  statement: string;
  category: string;
  onSwipe: (direction: 'agree' | 'disagree') => void;
}

type GestureContext = {
  startX: number;
};

/**
 * SwipeCard component with gesture handling
 * Users can swipe right to agree or left to disagree
 * Also includes buttons for tapping
 */
export const SwipeCard: React.FC<SwipeCardProps> = ({
  statement,
  category,
  onSwipe,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    GestureContext
  >({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
      translateY.value = event.translationY * 0.2; // Subtle vertical movement
    },
    onEnd: (event) => {
      if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
        // Swipe detected!
        const direction = translateX.value > 0 ? 'agree' : 'disagree';

        // Animate card off screen
        translateX.value = withSpring(
          translateX.value > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH,
          {
            velocity: event.velocityX,
          }
        );

        // Call callback
        runOnJS(onSwipe)(direction);
      } else {
        // Snap back to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotation = translateX.value / 20;

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  const agreeIndicatorStyle = useAnimatedStyle(() => {
    const opacity = Math.max(0, Math.min(1, translateX.value / SWIPE_THRESHOLD));
    return { opacity };
  });

  const disagreeIndicatorStyle = useAnimatedStyle(() => {
    const opacity = Math.max(0, Math.min(1, -translateX.value / SWIPE_THRESHOLD));
    return { opacity };
  });

  const handleButtonPress = (direction: 'agree' | 'disagree') => {
    // Animate off screen
    translateX.value = withSpring(
      direction === 'agree' ? SCREEN_WIDTH : -SCREEN_WIDTH
    );

    // Call callback after animation
    setTimeout(() => onSwipe(direction), 200);
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={panGestureHandler}>
        <Animated.View style={[styles.card, animatedCardStyle]}>
          {/* Category badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>

          {/* Statement text */}
          <Text style={styles.statementText}>{statement}</Text>

          {/* Swipe indicators */}
          <Animated.View
            style={[styles.indicator, styles.disagreeIndicator, disagreeIndicatorStyle]}
          >
            <Text style={styles.indicatorText}>👎 DISAGREE</Text>
          </Animated.View>

          <Animated.View
            style={[styles.indicator, styles.agreeIndicator, agreeIndicatorStyle]}
          >
            <Text style={styles.indicatorText}>👍 AGREE</Text>
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>

      {/* Touch-friendly buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.disagreeButton]}
          onPress={() => handleButtonPress('disagree')}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>✕ Disagree</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.agreeButton]}
          onPress={() => handleButtonPress('agree')}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>✓ Agree</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 400,
    minHeight: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statementText: {
    fontSize: 20,
    lineHeight: 30,
    textAlign: 'center',
    color: '#333',
  },
  indicator: {
    position: 'absolute',
    padding: 12,
    borderRadius: 8,
  },
  disagreeIndicator: {
    top: '50%',
    left: 20,
    backgroundColor: '#FF3B30',
  },
  agreeIndicator: {
    top: '50%',
    right: 20,
    backgroundColor: '#34C759',
  },
  indicatorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 30,
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 400,
  },
  button: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  disagreeButton: {
    backgroundColor: '#FF3B30',
  },
  agreeButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
