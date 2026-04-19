import { Colors, Fonts } from "@/constants/theme";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export default function SplashScreen({
  onAnimationComplete,
}: SplashScreenProps) {
  const colorScheme = "light";
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate the progress bar over 4.5 seconds
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 4500,
      useNativeDriver: false,
    }).start(() => {
      onAnimationComplete();
    });
  }, [progressAnim, onAnimationComplete]);

  // Interpolate the animated value to a percentage width
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].primary },
      ]}
    >
      <View style={styles.content}>
        {/* Logo */}
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Typography */}
        <Text style={[styles.title, { fontFamily: Fonts?.bold }]}>
          VetriTrack
        </Text>
        <Text style={[styles.subtitle, { fontFamily: Fonts?.sans }]}>
          Smart Veterinary Inventory Management
        </Text>

        {/* Animated Progress Bar */}
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: Colors[colorScheme].transparentWhite },
          ]}
        >
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: Colors[colorScheme].white,
                width: progressWidth,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    width: width * 0.8,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 32,
    tintColor: "#FFFFFF",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 48,
    opacity: 0.9,
  },
  progressTrack: {
    height: 4,
    width: 120,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
});
