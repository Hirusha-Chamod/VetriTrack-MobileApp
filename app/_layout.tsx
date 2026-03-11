import SplashScreen from '@/components/SplashScreen';
import { Toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/useAuthStore';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  const user = useAuthStore((state) => state.user);
  const segments = useSegments();
  const router = useRouter();
  
  // Controls when to hide our custom Splash Screen
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    if (!isAppReady) return;

    const inAuthGroup = (segments[0] as string) === '(auth)';

    if (!user && !inAuthGroup) {
      setTimeout(() => {
        router.replace('/(auth)/login' as any);
      }, 1);
    } else if (user && inAuthGroup) {
      setTimeout(() => {
        router.replace('/(tabs)' as any);
      }, 1);
    }
  }, [user, segments, isAppReady]);
  if (!isAppReady) {
    return (
      <SplashScreen 
        onAnimationComplete={() => setIsAppReady(true)} 
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <Toast />
    </SafeAreaView>
  );
}