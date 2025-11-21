import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        router.replace("/(auth)/sign-in");
      }, 900);
    });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.Image
        source={require("../assets/splash.png")}
        style={{
          width: 200,
          height: 200,
          opacity,
          borderRadius: 20,
        }}
      />

      <Animated.Text
        style={{
          marginTop: 20,
          fontSize: 28,
          fontWeight: "700",
          opacity,
        }}
      >
        VibeFit
      </Animated.Text>
    </View>
  );
}
