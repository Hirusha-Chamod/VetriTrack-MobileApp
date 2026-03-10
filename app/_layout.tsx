import { Toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/useAuthStore';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  const user = useAuthStore((state) => state.user);
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

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
  }, [user, segments, isReady]);

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