/**
 * Tabs Layout
 *
 * Main app navigation for authenticated users.
 * Tab order: Home → Smart → Blueprint → Build
 * Icons blend construction/building with civic/democracy themes.
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

// Brand colors
const Colors = {
  primary: '#7C3AED',
  inactive: '#9CA3AF',
};

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.inactive,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerShadowVisible: false,
        headerTintColor: '#111827',
      }}
    >
      {/* ==================== ACTIVE TABS ==================== */}

      {/* 1. Home - Dashboard with progress overview */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flag-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 2. Smart - Adaptive assessment to discover values */}
      <Tabs.Screen
        name="adaptive-assessment"
        options={{
          title: 'Smart',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 3. Blueprint - View and edit policy positions */}
      <Tabs.Screen
        name="blueprint-v3"
        options={{
          title: 'Blueprint',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 4. Build - Build your ballot with candidate selection */}
      <Tabs.Screen
        name="ballot-builder"
        options={{
          title: 'Build',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ==================== HIDDEN TABS ==================== */}

      {/* Legacy blueprint versions - hidden from tab bar */}
      <Tabs.Screen
        name="blueprint-v2"
        options={{
          href: null, // Hides from tab bar
        }}
      />
    </Tabs>
  );
}
