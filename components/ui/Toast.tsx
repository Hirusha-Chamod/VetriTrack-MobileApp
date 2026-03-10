import { useToastStore } from '@/store/useToastStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export const Toast = () => {
  const { visible, message, type } = useToastStore();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start(() => slideAnim.setValue(-100));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          colors: ['#4CAF50', '#2E7D32'],
          iconColor: '#FFFFFF',
        };
      case 'error':
        return {
          icon: 'alert-circle',
          colors: ['#FF5252', '#D32F2F'],
          iconColor: '#FFFFFF',
        };
      default:
        return {
          icon: 'information-circle',
          colors: ['#2196F3', '#1565C0'],
          iconColor: '#FFFFFF',
        };
    }
  };

  const config = getConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={config.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.toastContent}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={config.icon as any} size={24} color={config.iconColor} />
        </View>
        <Text style={styles.text}>{message}</Text>
        <View style={styles.closeButton}>
          <Ionicons name="close" size={18} color="rgba(255,255,255,0.7)" />
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 100,
    width: '100%',
    // Premium shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    // Subtle inner glow
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconContainer: {
    marginRight: 12,
    // Glow effect
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.3,
    lineHeight: 20,
    // Text shadow for depth
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
});