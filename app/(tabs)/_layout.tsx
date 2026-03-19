import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = 'light';

  return (
    <Tabs
  screenOptions={{
   tabBarStyle: { display: 'none' }, 
    tabBarActiveTintColor: Colors[colorScheme ?? 'light'].primary, 
    headerShown: false,
    tabBarButton: HapticTab,
  }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

    </Tabs>
  );
}
