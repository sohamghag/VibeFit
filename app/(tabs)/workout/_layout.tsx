import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "My Training",
          headerTitleStyle: {
            fontSize: 26,
            fontWeight: "700",
            color: "black",
          },

          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="addExercise"
        options={{
          headerTitle: "Add Exercise",
          headerTitleStyle: {
            fontSize: 26,
            fontWeight: "700",
            color: "black",
          },
          headerBackButtonMenuEnabled: true,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="exercise-modal"
        options={{
          headerTitle: "Exercise",
          headerTitleStyle: {
            fontSize: 26,
            fontWeight: "700",
            color: "black",
          },
          headerBackButtonMenuEnabled: true,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="workout-details"
        options={{
          headerTitle: "Workout Details",
          headerTitleStyle: {
            fontSize: 26,
            fontWeight: "700",
            color: "black",
          },
          headerBackButtonMenuEnabled: true,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="start-workout"
        options={{
          headerTitle: "Start Workout",
          headerTitleStyle: {
            fontSize: 26,
            fontWeight: "700",
            color: "black",
          },
          headerBackButtonMenuEnabled: true,
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
