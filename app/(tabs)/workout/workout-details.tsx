import { client, urlFor } from "@/sanity/sanityClient";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkoutDetailsPage() {
  const { id } = useLocalSearchParams();
  const [workout, setWorkout] = useState(null);

  const fetchWorkout = async () => {
    const query = `*[_type == "workout" && _id == "${id}"]{
      _id,
      date,
      exercises[]{
        _key,
        duration,
        sets[]{
          _key,
          reps,
          weightType,
          weightValue
        },
        exercise->{
          _id,
          name,
          image,
          description
        }
      }
    }[0]`;

    const data = await client.fetch(query);
    setWorkout(data);
  };

  useEffect(() => {
    fetchWorkout();
  }, []);

  if (!workout) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500 text-lg">Loading Workout...</Text>
      </View>
    );
  }

  const formattedDate = new Date(workout.date).toDateString();

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

  const handleDeleteExercise = async (exerciseKey) => {
    try {
      await client
        .patch(id)
        .unset([`exercises[_key=="${exerciseKey}"]`])
        .commit();

      fetchWorkout(); // refresh
    } catch (err) {
      console.log("DELETE EXERCISE ERROR:", err);
    }
  };

  return (
    <SafeAreaView className="flex-1 mt-[-50px] bg-white">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center mb-6">
          <Ionicons name="calendar-outline" size={18} color="#6B7280" />
          <Text className="text-gray-500 ml-2">{formattedDate}</Text>
        </View>

        {/* EXERCISE CARDS */}
        {workout.exercises.map((ex) => (
          <View
            key={ex._key}
            className="bg-white rounded-2xl p-5 mb-5 shadow shadow-gray-300 border border-gray-100"
          >
            {/* TOP SECTION */}
            <View className="flex-row items-center mb-4">
              <Image
                source={{
                  uri: ex.exercise?.image
                    ? urlFor(ex.exercise.image).width(200).url()
                    : undefined,
                }}
                className="w-20 h-20 rounded-xl mr-4"
              />

              <View className="flex-1">
                <Text className="text-xl font-semibold text-gray-900">
                  {ex.exercise?.name}
                </Text>

                <Text className="text-gray-500 mt-1">
                  Duration: {Math.round(ex.duration / 60)} min
                </Text>
              </View>
            </View>

            <View className="flex-row  gap-3 mt-2">
              {/* EDIT BUTTON */}
              <TouchableOpacity
                className="bg-[#3B82F6] py-2 px-4 rounded-xl self-start shadow-sm"
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/workout/exercise-modal",
                    params: {
                      workoutId: String(workout._id),
                      exerciseLogKey: ex._key,
                      exerciseId: ex.exercise?._id,
                      name: ex.exercise?.name,
                      description: ex.exercise?.description,
                      duration: String(ex.duration),
                      sets: JSON.stringify(ex.sets),
                    },
                  })
                }
              >
                <Text className="text-white font-semibold text-sm">Edit</Text>
              </TouchableOpacity>
              {/* DELETE EXERCISE */}
              <TouchableOpacity
                onPress={() => handleDeleteExercise(ex._key)}
                className="bg-red-500  py-2 px-4 rounded-xl self-start"
              >
                <Text className="text-white font-semibold text-sm">Delete</Text>
              </TouchableOpacity>
            </View>

            {/* SETS */}
            <Text className="text-gray-800 font-semibold mt-4 mb-2">Sets</Text>

            {ex.sets.map((s, i) => (
              <View
                key={s._key}
                className="flex-row justify-between bg-gray-50 p-3 rounded-xl mb-2"
              >
                <Text className="text-gray-700 font-medium">Set {i + 1}</Text>
                <Text className="text-gray-600">
                  {s.reps} reps — {s.weightValue}
                  {s.weightType}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {/* ADD EXERCISE */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(tabs)/workout/addExercise",
              params: { workoutId: id },
            })
          }
          className="bg-blue-500 py-4 rounded-2xl mt-2 shadow shadow-blue-300"
        >
          <Text className="text-white text-center font-bold text-lg">
            Add Exercise
          </Text>
        </TouchableOpacity>

        {/* DELETE WORKOUT */}
        <TouchableOpacity
          onPress={deleteWorkout}
          className="bg-red-600 py-4 rounded-2xl mt-4 shadow-sm"
        >
          <Text className="text-white text-center font-bold text-lg">
            Delete Complete Workout
          </Text>
        </TouchableOpacity>

        {/* START WORKOUT */}
        <TouchableOpacity
          className="bg-orange-500 py-4 rounded-2xl mt-4 shadow-sm"
          onPress={async () => {
            const data = await client.fetch(
              `*[_type == "workout" && _id == "${id}"][0]{ exercises }`
            );

            if (!data.exercises?.length) {
              Alert.alert(
                "No Exercises Added",
                "Please add at least one exercise before starting."
              );
              return;
            }

            router.push({
              pathname: "/(tabs)/workout/start-workout",
              params: { id },
            });
          }}
        >
          <Text className="text-white text-center font-bold text-lg">
            Start Workout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
