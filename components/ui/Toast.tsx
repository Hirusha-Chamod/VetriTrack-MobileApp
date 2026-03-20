import { useToastStore } from '@/store/useToastStore';
import { Ionicons } from '@expo/vector-icons';
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
          bgColor: '#16A34A', // Professional solid green
        };
      case 'error':
        return {
          icon: 'alert-circle',
          bgColor: '#DC2626', // Professional solid red
        };
      default:
        return {
          icon: 'information-circle',
          bgColor: '#1E3A8A', // Professional solid dark blue
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
      <View style={[styles.toastContent, { backgroundColor: config.bgColor }]}>
        <View style={styles.iconContainer}>
          <Ionicons name={config.icon as any} size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.text}>{message}</Text>
        <View style={styles.closeButton}>
          <Ionicons name="close" size={18} color="rgba(255,255,255,0.7)" />
        </View>
      </View>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8, // Professional, subtle rounding instead of full pill
    width: '100%',
    // Clean, modern drop shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  iconContainer: {
    marginRight: 12,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});