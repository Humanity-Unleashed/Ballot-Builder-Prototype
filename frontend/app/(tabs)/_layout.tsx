/**
 * Tabs Layout
 *
 * Main app navigation for authenticated users.
 * Uses bottom tab navigation.
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

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
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
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
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="blueprint"
        options={{
          title: 'Blueprint',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="blueprint-v2"
        options={{
          title: 'Blueprint V2',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ribbon-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="blueprint-v3"
        options={{
          title: 'Blueprint V3',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="ballot"
        options={{
          title: 'Ballot',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="ballot-builder"
        options={{
          title: 'Builder',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="construct-outline" size={size} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prototype"
        options={{
          title: 'Prototype',
          tabBarIcon: ({ color, size}) => (
            <Ionicons name="flask-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="adaptive-prototype"
        options={{
          title: 'Adaptive',
          tabBarIcon: ({ color, size}) => (
            <Ionicons name="git-branch-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="civic-assessment"
        options={{
          title: 'Assessment',
          tabBarIcon: ({ color, size}) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="adaptive-assessment"
        options={{
          title: 'Smart',
          tabBarIcon: ({ color, size}) => (
            <Ionicons name="sparkles-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
