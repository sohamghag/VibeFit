import { Stack } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Workout History",
          headerTitleStyle: {
            fontSize: 26,
            fontWeight: "700",
            color: "black",
          },

          headerShadowVisible: false,
        }}
      />

      <Stack.Screen
        name="workout-record"
        options={{
          title: "Workout Details",
          headerShown: true,
          headerTitle: "Workout Details",
          headerTitleStyle: {
            fontSize: 26,
            fontWeight: "700",
            color: "black",
          },
          headerBackTitle: "History",
        }}
      />
    </Stack>
  );
};

export default Layout;

const styles = StyleSheet.create({});
