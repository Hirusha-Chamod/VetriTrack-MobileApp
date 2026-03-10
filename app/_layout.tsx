import { Toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/useAuthStore';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';

export default function RootLayout() {
  const user = useAuthStore((state) => state.user);
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // 1. First, tell the app we are mounted and ready
  useEffect(() => {
    setIsReady(true);
  }, []);

  // 2. Handle the Auth Redirection
  useEffect(() => {
    if (!isReady) return; // Don't redirect if navigation isn't ready

    const inAuthGroup = (segments[0] as string) === '(auth)';

    if (!user && !inAuthGroup) {
      // Use setTimeout to push the redirect to the next tick
      // This solves the "navigating before mounting" error
      setTimeout(() => {
        router.replace('/(auth)/login' as any);
      }, 1);
    } else if (user && inAuthGroup) {
      setTimeout(() => {
        router.replace('/(tabs)' as any);
      }, 1);
    }
  }, [user, segments, isReady]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <Toast />
    </>
  );
}