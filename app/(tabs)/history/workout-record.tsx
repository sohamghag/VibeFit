import { Workout } from "@/sanity/sanity.types";
import { client } from "@/sanity/sanityClient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WorkoutRecordPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    console.log("====================================");
    console.log("Let's see what is there in EX", workout);
    console.log("====================================");
  }, [workout]);
  async function loadWorkout() {
    const query = `
      *[_type == "workout" && _id == $id][0] {
        _id,
        date,
        exercises[] {
          _key,
          duration,
          exercise->{
            name,
            _id,
            difficulty,
            image{ asset->{ url } }
          },
          sets[] {
            reps,
            weightValue,
            weightType
          }
        }
      }
    `;

    const result = await client.fetch(query, { id });
    setWorkout(result);
    setLoading(false);
  }

  useEffect(() => {
    loadWorkout();
  }, [id]);

  useEffect(() => {
    {
      workout?.exercises?.length ? (
        workout.exercises.map((ex) => console.log(ex._key))
      ) : (
        <Text>No exercises added</Text>
      );
    }
  }, [workout]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkout();
    setRefreshing(false);
  };

  // Delete Workout
  async function deleteWorkout() {
    Alert.alert("Delete Workout?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await client.delete(id);
            router.back();
          } catch (error) {
            console.log("Delete ERROR:", error);
          }
        },
      },
    ]);
  }

  // Loading State
  if (loading)
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-3 text-gray-600">Loading Workout...</Text>
      </View>
    );

  // If workout is deleted or missing
  if (!workout)
    return (
      <ScrollView
        className="flex-1 p-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-1 items-center justify-center mt-20">
          <Text className="text-2xl font-bold text-gray-700">
            Workout Not Found
          </Text>
          <Text className="text-gray-500 mt-2 text-center">
            This workout may have been deleted.
          </Text>
        </View>
      </ScrollView>
    );

  return (
    <ScrollView
      className="p-5 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Delete button */}
      <TouchableOpacity
        onPress={deleteWorkout}
        className="bg-red-600 mb-5 p-4 rounded-2xl shadow-md"
        activeOpacity={0.8}
      >
        <Text className="text-white text-center font-semibold text-lg">
          Delete Workout
        </Text>
      </TouchableOpacity>

      {/* Exercises */}
      {workout.exercises?.map((ex) => (
        <View
          key={ex._key}
          className="bg-white p-5 rounded-2xl shadow-sm mb-6 border border-gray-100"
        >
          {/* Top */}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              router.push({
                pathname: "/exercise-diff",
                params: { id: ex?.exercise?._id, from: "history" },
              });
            }}
            className="flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100"
          >
            <View className="flex-row items-center gap-4">
              <Image
                source={{ uri: ex.exercise?.image?.asset?.url }}
                style={{ width: 80, height: 80, borderRadius: 12 }}
              />
              <View className="flex-1">
                <Text className="text-xl font-semibold text-gray-800">
                  {ex.exercise?.name}
                </Text>

                <Text className="text-gray-500 capitalize mt-1">
                  Difficulty: {ex.exercise?.difficulty}
                </Text>

                <Text className="text-gray-500">
                  Duration: {Math.round((ex.duration || 0) / 60)} min
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Sets */}
          <View className="mt-4">
            <Text className="font-semibold text-gray-700 mb-2">Sets</Text>

            {ex.sets && ex.sets.length > 0 ? (
              ex.sets.map((s, i) => (
                <View
                  key={i}
                  className="flex-row justify-between bg-gray-50 p-3 rounded-xl mb-2"
                >
                  <Text className="text-gray-700 font-medium">Set {i + 1}</Text>
                  <Text className="text-gray-600">
                    {s.reps} reps — {s.weightValue} {s.weightType}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 italic">No sets recorded</Text>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
