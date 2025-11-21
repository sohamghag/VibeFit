import { getWorkoutHistory } from "@/sanity/lib/historyApi";
import { useWorkoutStore } from "@/store/workoutstore";
import { useUser } from "@clerk/clerk-expo";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WorkoutPlan = () => {
  const exercises = useWorkoutStore((state) => state.exercises);
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workouts, setWorkouts] = useState([]);

  const loadWorkout = async () => {
    if (!user) return;
    setLoading(true);
    const result = await getWorkoutHistory(user.id);
    setWorkouts(result);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadWorkout();
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkout();
    setRefreshing(false);
  };

  if (loading)
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4B6CF7" />
        <Text className="text-gray-400 mt-2">Loading workouts…</Text>
      </View>
    );

  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* WORKOUT LIST */}
        {workouts.map((workout, index) => {
          const totalDuration = workout.exercises.reduce(
            (sum, e) => sum + (e.duration || 0),
            0
          );

          const workoutDate = new Date(workout.date).toDateString();

          return (
            <TouchableOpacity
              key={workout._id}
              className="bg-white rounded-2xl p-5 mb-5 shadow shadow-gray-200 border border-gray-100"
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/workout/workout-details",
                  params: { id: workout._id },
                })
              }
            >
              {/* TOP ROW */}
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-semibold text-gray-900">
                  Plan {index + 1}
                </Text>
                <Feather name="chevron-right" size={20} color="#9CA3AF" />
              </View>

              {/* DATE */}
              <View className="flex-row items-center mb-2">
                <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                <Text className="text-gray-600 ml-2">{workoutDate}</Text>
              </View>

              {/* STATS ROW */}
              <View className="flex-row mt-3">
                <View className="flex-row items-center mr-5">
                  <Ionicons name="time-outline" size={18} color="#3B82F6" />
                  <Text className="text-gray-700 ml-1">
                    {(totalDuration / 60).toFixed(2)} min
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Ionicons name="barbell-outline" size={18} color="#10B981" />
                  <Text className="text-gray-700 ml-1">
                    {workout.exercises.length} exercises
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* ADD NEW BUTTON */}
        <TouchableOpacity
          className="bg-blue-600 mt-2 p-4 rounded-2xl items-center shadow shadow-blue-300 active:opacity-80"
          onPress={() => router.push("/(tabs)/workout/addExercise")}
        >
          <Text className="text-white text-lg font-semibold">
            + Add New Plan
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkoutPlan;
