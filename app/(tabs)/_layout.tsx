import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <>
      {/* If user is NOT signed in → redirect to login */}
      <SignedOut>
        <Redirect href="/sign-in" />
      </SignedOut>

      {/* User signed in → show tabs */}
      <SignedIn>
        <Tabs
          screenOptions={{
            headerShown: false, // Hide header for all tab screens
            tabBarActiveTintColor: "#4F46E5",
            tabBarInactiveTintColor: "#9CA3AF",
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="history"
            options={{
              title: "History",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="time-outline" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="workout"
            options={{
              title: "Workout",
              tabBarIcon: ({ color }) => (
                <Ionicons name="add-circle-outline" size={29} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="exercise"
            options={{
              title: "Exercise",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="book-outline" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-outline" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </SignedIn>
    </>
  );
}
