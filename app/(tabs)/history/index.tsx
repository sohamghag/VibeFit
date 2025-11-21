import { groupByDate } from "@/sanity/lib/utils/groupByDate";
import { Workout } from "@/sanity/sanity.types";
import { useUser } from "@clerk/clerk-expo";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getWorkoutHistory } from "../../../sanity/lib/historyApi";

// Loading component for better reusability
const LoadingState = () => (
  <View className="flex-1 items-center justify-center bg-gradient-to-b from-slate-50 to-white">
    <View className="items-center">
      <View className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full items-center justify-center mb-4 shadow-lg">
        <Ionicons name="fitness" size={32} color="white" />
      </View>
      <ActivityIndicator size="large" color="#6366F1" />
      <Text className="mt-4 text-lg font-medium text-gray-600">
        Loading your workouts
      </Text>
      <Text className="text-gray-400 mt-1">
        Getting your fitness journey ready...
      </Text>
    </View>
  </View>
);

// Empty state component
const EmptyState = ({
  onRefresh,
  refreshing,
}: {
  onRefresh: () => void;
  refreshing: boolean;
}) => (
  <SafeAreaView className="flex-1 bg-gradient-to-b from-slate-50 to-white">
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="items-center px-8">
        <View className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full items-center justify-center mb-6 shadow-sm">
          <Feather name="calendar" size={48} color="#6366F1" />
        </View>
        <Text className="text-3xl font-bold text-gray-800 text-center mb-3">
          No Workouts Yet
        </Text>
        <Text className="text-gray-500 text-center text-lg leading-7 mb-8">
          Your fitness journey starts here!{"\n"}
          Complete your first workout to see it in history.
        </Text>
      </View>
    </ScrollView>
  </SafeAreaView>
);

// Workout card component
interface WorkoutCardProps {
  workout: Workout;
  onPress: () => void;
}

const WorkoutCard = ({ workout, onPress }: WorkoutCardProps) => {
  const exerciseCount = workout.exercises?.length ?? 0;
  const displayedExercises = workout.exercises?.slice(0, 3) ?? [];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="bg-white rounded-3xl p-6 mb-4 shadow-lg shadow-gray-200/80 border border-gray-100/80 active:scale-95 active:shadow-md transition-all"
    >
      {/* Header with exercise count and chevron */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-indigo-50 rounded-2xl items-center justify-center mr-3">
            <Ionicons name="barbell" size={20} color="#6366F1" />
          </View>
          <View>
            <Text className="text-xl font-bold text-gray-900">
              {exerciseCount} Exercise{exerciseCount !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
        <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
          <Feather name="chevron-right" size={20} color="#9CA3AF" />
        </View>
      </View>

      {/* Exercises list */}
      <View className="space-y-3">
        {displayedExercises.map((ex) => (
          <View key={ex._key} className="flex-row items-center">
            <View className="w-6 h-6 bg-emerald-50 rounded-full items-center justify-center mr-3">
              <Feather name="check-circle" size={14} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium text-sm">
                {ex.exercise?.name ?? "Unknown Exercise"}
              </Text>
              <Text className="text-gray-400 text-xs mt-1">
                {ex.sets?.length ?? 0} set
                {(ex.sets?.length ?? 0) !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        ))}

        {exerciseCount > 3 && (
          <View className="flex-row items-center pt-2">
            <View className="w-6 h-6 bg-gray-100 rounded-full items-center justify-center mr-3">
              <Feather name="plus" size={14} color="#6B7280" />
            </View>
            <Text className="text-gray-500 text-sm font-medium">
              {exerciseCount - 3} more exercise
              {exerciseCount - 3 !== 1 ? "s" : ""}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Date section component
interface DateSectionProps {
  date: string;
  workouts: Workout[];
}

const DateSection = ({ date, workouts }: DateSectionProps) => (
  <View className="mb-8">
    {/* Date header with subtle background */}
    <View className="flex-row items-center mb-4 px-2">
      <View className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full mr-3" />
      <Text className="text-xl font-bold text-gray-800 flex-1">{date}</Text>
      <Text className="text-gray-400 text-sm font-medium">
        {workouts.length} session{workouts.length !== 1 ? "s" : ""}
      </Text>
    </View>

    {/* Workout cards */}
    <View>
      {workouts.map((workout) => (
        <WorkoutCard
          key={workout._id}
          workout={workout}
          onPress={() =>
            router.push({
              pathname: "/history/workout-record",
              params: { id: workout._id, from: "history" },
            })
          }
        />
      ))}
    </View>
  </View>
);

export default function HistoryScreen() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState<Record<string, Workout[]>>({});

  async function loadHistory() {
    try {
      const res = await getWorkoutHistory(user?.id);
      const grouped = groupByDate(res);
      setHistory(grouped);
    } catch (error) {
      console.error("Failed to load workout history:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user) loadHistory();
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  if (loading) return <LoadingState />;

  const isEmpty = Object.keys(history).length === 0;
  if (isEmpty)
    return <EmptyState onRefresh={onRefresh} refreshing={refreshing} />;

  return (
    <SafeAreaView className="flex-1  mt-[-40px] bg-gradient-to-b from-slate-50 to-white">
      {/* Content with improved spacing */}
      <ScrollView
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6366F1"]}
            tintColor="#6366F1"
          />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {Object.keys(history).map((date) => (
          <DateSection key={date} date={date} workouts={history[date] ?? []} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
