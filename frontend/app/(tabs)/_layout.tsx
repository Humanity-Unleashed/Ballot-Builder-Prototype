/**
 * Tabs Layout
 *
 * Main app navigation for authenticated users.
 * Tab order: Blueprint → Build
 *
 * Blueprint is the landing tab (combined Assessment + Blueprint with 3 states).
 * Home is hidden from the tab bar.
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
          display: 'none',
          height: 0,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerShadowVisible: false,
        headerTintColor: '#111827',
      }}
    >
      {/* ==================== ACTIVE TABS ==================== */}

      {/* 1. Blueprint - Combined Assessment + Blueprint view (landing tab) */}
      <Tabs.Screen
        name="blueprint"
        options={{
          title: 'Blueprint',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 2. Build - Build your ballot with candidate selection */}
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

      {/* Home - hidden from tab bar */}
      <Tabs.Screen
        name="home"
        options={{
          href: null,
        }}
      />

      {/* Legacy tabs - hidden from tab bar */}
      <Tabs.Screen
        name="adaptive-assessment"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="blueprint-v3"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="blueprint-v2"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
