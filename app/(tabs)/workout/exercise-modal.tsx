import { client } from "@/sanity/sanityClient";
import { useWorkoutStore } from "@/store/workoutstore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ExerciseModalPage = () => {
  const {
    id,
    name,
    description,
    workoutId,
    exerciseLogKey,
    exerciseId,
    duration: existingDuration,
    sets: existingSets,
  } = useLocalSearchParams();

  const router = useRouter();
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const initialSets = existingSets ? JSON.parse(existingSets) : null;

  const [duration, setDuration] = useState(
    existingDuration ? Number(existingDuration) : 20
  );

  const [sets, setSets] = useState(
    initialSets || [{ reps: 10, weightType: "kg", weightValue: 0 }]
  );

  const updateSet = (index, key, value) => {
    const updated = [...sets];
    updated[index][key] = value;
    setSets(updated);
  };

  const addNewSet = () => {
    setSets([...sets, { reps: 10, weightType: "kg", weightValue: 0 }]);
  };

  const handleAdd = async () => {
    // ================================
    // CASE 1: EDIT EXISTING EXERCISE
    // ================================
    if (workoutId && exerciseLogKey) {
      await client
        .patch(String(workoutId))
        .set({
          [`exercises[_key=="${exerciseLogKey}"]`]: {
            _type: "exerciseLog",
            _key: exerciseLogKey,
            exercise: { _type: "reference", _ref: String(exerciseId) },
            duration,
            sets: sets.map((s) => ({
              _key: Math.random().toString(36).slice(2),
              reps: s.reps,
              weightType: s.weightType,
              weightValue: s.weightValue,
            })),
          },
        })
        .commit();

      router.replace(`/(tabs)/workout/workout-details?id=${workoutId}`);
      return;
    }

    // ================================
    // CASE 2: ADD TO EXISTING WORKOUT
    // ================================
    if (workoutId) {
      try {
        await client
          .patch(String(workoutId))
          .setIfMissing({ exercises: [] })
          .append("exercises", [
            {
              _type: "exerciseLog",
              _key: Math.random().toString(36).slice(2),
              exercise: { _type: "reference", _ref: id },
              duration,
              sets: sets.map((s) => ({
                _key: Math.random().toString(36).slice(2),
                reps: s.reps,
                weightType: s.weightType,
                weightValue: s.weightValue,
              })),
            },
          ])
          .commit();

        router.replace(`/(tabs)/workout/workout-details?id=${workoutId}`);
        return;
      } catch (err) {
        console.log("ADD ERROR:", err);
      }
    }

    // ================================
    // CASE 3: NEW PLAN (ZUSTAND)
    // ================================
    addExercise({
      exerciseId: id,
      name,
      description,
      duration,
      sets,
    });

    router.back();
  };

  return (
    <SafeAreaView className="flex-1 mt-[-50px] bg-white px-6 pt-10">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Title */}
        <Text className="text-3xl font-bold text-gray-900">{name}</Text>

        {/* Description */}
        <Text className="text-gray-600 mt-2 leading-6">{description}</Text>

        {/* Duration */}
        <Text className="text-xl font-semibold text-gray-900 mt-8">
          Duration
        </Text>

        <View className="flex-row items-center mt-3">
          <TouchableOpacity
            onPress={() => setDuration((d) => Math.max(0, d - 5))}
            className="w-12 h-12 rounded-xl bg-gray-200 items-center justify-center"
          >
            <Text className="text-3xl text-gray-700">−</Text>
          </TouchableOpacity>

          <Text className="text-3xl mx-6 font-semibold text-gray-900">
            {duration}s
          </Text>

          <TouchableOpacity
            onPress={() => setDuration((d) => d + 5)}
            className="w-12 h-12 rounded-xl bg-blue-600 items-center justify-center"
          >
            <Text className="text-3xl text-white">+</Text>
          </TouchableOpacity>
        </View>

        {/* Sets */}
        <Text className="text-xl font-semibold text-gray-900 mt-10">Sets</Text>

        {sets.map((set, index) => (
          <View key={index} className="bg-gray-100 p-5 rounded-2xl mt-4">
            <Text className="text-gray-700 font-semibold">Set {index + 1}</Text>

            {/* Reps */}
            <TextInput
              keyboardType="numeric"
              value={String(set.reps)}
              onChangeText={(v) => updateSet(index, "reps", Number(v))}
              className="bg-white p-4 rounded-xl mt-3 border border-gray-300 text-gray-800"
              placeholder="Reps"
            />

            {/* Weight */}
            <View className="flex-row mt-3">
              <TextInput
                keyboardType="numeric"
                value={String(set.weightValue)}
                onChangeText={(v) => updateSet(index, "weightValue", Number(v))}
                className="bg-white p-4 rounded-xl flex-1 border border-gray-300 text-gray-800"
                placeholder="Weight"
              />

              <TouchableOpacity
                onPress={() =>
                  updateSet(
                    index,
                    "weightType",
                    set.weightType === "kg" ? "lbs" : "kg"
                  )
                }
                className="bg-blue-600 px-6 ml-3 rounded-xl justify-center"
              >
                <Text className="text-white font-semibold text-lg">
                  {set.weightType}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add new set */}
        <TouchableOpacity onPress={addNewSet} className="mt-6">
          <Text className="text-blue-600 text-lg font-semibold">+ Add Set</Text>
        </TouchableOpacity>

        {/* Confirm Button */}
        <TouchableOpacity
          onPress={handleAdd}
          className="bg-blue-600 py-4 rounded-2xl mt-10"
        >
          <Text className="text-center text-white text-lg font-bold">
            {exerciseLogKey ? "Save Changes" : "Add Exercise"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExerciseModalPage;
