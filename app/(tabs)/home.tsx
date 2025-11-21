import { SignedOut, useUser } from "@clerk/clerk-expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getTotalMinutesTrained,
  getWorkoutCount,
  getWorkoutHistory,
} from "@/sanity/lib/historyApi";

export default function HomePage() {
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [workouts, setWorkouts] = useState([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [workoutCount, setWorkoutCount] = useState(0);

  // LOAD REAL DATA
  const loadData = async () => {
    if (!user) return;

    const history = await getWorkoutHistory(user.id);
    const minutes = await getTotalMinutesTrained(user.id);
    const count = await getWorkoutCount(user.id);

    setWorkouts(history);
    setTotalMinutes(minutes);
    setWorkoutCount(count);

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // --- PULL TO REFRESH ---
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  if (!user || loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-gray-500 mt-2">Loading your data...</Text>
      </SafeAreaView>
    );
  }

  const lastWorkout = workouts[0];

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-5"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ---- Welcome Section ---- */}
        <Text className="text-gray-500 text-lg mt-10 m">Welcome back,</Text>
        <Text className="text-3xl font-bold text-gray-900 mb-4 mt-4">
          {user.fullName || "User"} 👋
        </Text>

        {/* ---- STATS CARD ---- */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-12 mt-7">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Your Stats
          </Text>

          <View className="flex-row justify-between">
            {/* Workouts */}
            <View className="items-center flex-1">
              <Text className="text-indigo-600 font-bold text-xl">
                {workoutCount}
              </Text>
              <Text className="text-gray-500 text-sm">Total Workouts</Text>
            </View>

            {/* Total Time */}
            <View className="items-center flex-1">
              <Text className="text-green-600 font-bold text-xl">
                {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
              </Text>
              <Text className="text-gray-500 text-sm">Total Time</Text>
            </View>

            {/* Avg Duration */}
            <View className="items-center flex-1">
              <Text className="text-purple-600 font-bold text-xl">
                {workoutCount > 0
                  ? `${Math.floor(totalMinutes / workoutCount)}m`
                  : "0m"}
              </Text>
              <Text className="text-gray-500 text-sm">Avg Duration</Text>
            </View>
          </View>
        </View>

        {/* ---- QUICK ACTIONS ---- */}
        <Text className="text-lg font-semibold text-gray-800 mb-6">
          Quick Actions
        </Text>

        {/* Start Workout */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/workout")}
          className="bg-blue-600 p-5 rounded-2xl flex-row items-center mb-4 shadow-sm"
        >
          <Ionicons name="play" size={28} color="white" />
          <View className="ml-4 flex-1">
            <Text className="text-white font-bold text-lg">Start Workout</Text>
            <Text className="text-blue-100 text-sm">
              Begin your training session
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={28} color="white" />
        </TouchableOpacity>

        {/* Small Buttons */}
        <View className="flex-row gap-3 mb-5 mt-6">
          {/* History */}
          <TouchableOpacity
            className="bg-white flex-1 p-4 rounded-xl shadow-sm items-center"
            onPress={() => router.push("/(tabs)/workout")}
          >
            <Ionicons name="time-outline" size={28} color="#4F46E5" />
            <Text className="text-gray-800 mt-2 font-medium">
              Workout Training
            </Text>
          </TouchableOpacity>

          {/* Browse Exercises */}
          <TouchableOpacity
            className="bg-white flex-1 p-4 rounded-xl shadow-sm items-center"
            onPress={() => router.push("/(tabs)/exercise")}
          >
            <MaterialCommunityIcons name="dumbbell" size={28} color="#4F46E5" />
            <Text className="text-gray-800 mt-2 font-medium">
              Browse Exercises
            </Text>
          </TouchableOpacity>
        </View>

        {/* ---- LAST WORKOUT ---- */}
        <Text className="text-lg font-semibold text-gray-800 mb-6 mt-6">
          Last Workout
        </Text>

        {lastWorkout ? (
          <TouchableOpacity
            className="bg-white p-5 rounded-2xl shadow-sm flex-row justify-between items-center mb-10"
            onPress={() =>
              router.push({
                pathname: "/(tabs)/workout/workout-details",
                params: { id: lastWorkout._id },
              })
            }
          >
            <View>
              <Text className="font-semibold text-gray-900">Today</Text>
              <Text className="text-gray-500 text-sm mt-1">
                {Math.floor(lastWorkout.exercises.length)} exercises
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        ) : (
          <View className="bg-white p-5 rounded-2xl shadow-sm mb-10">
            <Text className="text-gray-500 text-center">No workouts yet</Text>
          </View>
        )}
      </ScrollView>

      {/* SIGNED OUT VIEW */}
      <SignedOut>
        <View className="px-5 pb-10">
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity className="bg-blue-600 p-4 rounded-xl">
              <Text className="text-white text-center font-semibold">
                Sign In
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity className="bg-gray-200 p-4 rounded-xl mt-4">
              <Text className="text-gray-900 text-center font-semibold">
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SignedOut>
    </SafeAreaView>
  );
}
