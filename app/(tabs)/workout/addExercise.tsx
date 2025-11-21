import { getAllExercises } from "@/sanity/lib/exerciseApi";
import { Exercise } from "@/sanity/sanity.types";
import { urlFor } from "@/sanity/sanityClient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useWorkoutStore } from "@/store/workoutstore";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { saveWorkout } from "../../../sanity/lib/workoutApi";

export default function AddExercise() {
  const { workoutId } = useLocalSearchParams();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const addedExercises = useWorkoutStore((state) => state.exercises);
  const resetWorkout = useWorkoutStore((state) => state.resetWorkout);
  const { user } = useUser();

  useEffect(() => {
    async function loadData() {
      const data = await getAllExercises();
      setExercises(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSelect = (exercise: Exercise) => {
    router.push({
      pathname: "/(tabs)/workout/exercise-modal",
      params: {
        id: exercise._id,
        name: exercise.name,
        description: exercise.description,
        imageUrl: urlFor(exercise?.image).url(),
        videoUrl: exercise.videoUrl,
        workoutId: workoutId ? String(workoutId) : "",
      },
    });
  };

  const handleSaveWorkout = async () => {
    if (addedExercises.length === 0) return;

    try {
      await saveWorkout(user?.id, addedExercises);
      resetWorkout();
      router.back();
    } catch (err) {
      console.log("SAVE ERROR:", err);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4B6CF7" />
        <Text className="mt-2 text-gray-500">Loading exercises…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-4 pb-6">
      {/* HEADER */}
      <Text className="text-2xl font-bold text-gray-900 mb-4">
        Choose Your Exercises
      </Text>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={exercises}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelect(item)}
            className="bg-white p-4 rounded-2xl mb-4 flex-row items-center shadow shadow-gray-200"
            activeOpacity={0.8}
          >
            {/* Image */}
            <Image
              source={{ uri: urlFor(item?.image).width(200).url() }}
              className="w-20 h-20 rounded-xl"
            />

            {/* Name */}
            <View className="flex-1 ml-4">
              <Text className="text-xl font-semibold text-gray-900">
                {item.name}
              </Text>
              <Text className="text-gray-500 text-md mt-1">
                Tap to add to workout
              </Text>
            </View>

            {/* Plus Icon */}
            <Ionicons name="add-circle" size={32} color="#4B6CF7" />
          </TouchableOpacity>
        )}
      />

      {/* SAVE BUTTON */}
      {addedExercises.length > 0 && (
        <TouchableOpacity
          onPress={handleSaveWorkout}
          className="bg-[#4B6CF7] py-4 rounded-2xl shadow-lg mt-4"
          activeOpacity={0.9}
        >
          <Text className="text-center text-white font-semibold text-lg tracking-wide">
            Save Workout ({addedExercises.length})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
