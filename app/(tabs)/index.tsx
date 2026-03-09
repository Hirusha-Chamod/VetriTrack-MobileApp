
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet } from 'react-native';

export default function DashboardScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">VetriTrack Dashboard</ThemedText>
      {/* This is where your Figma button grid will go */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});