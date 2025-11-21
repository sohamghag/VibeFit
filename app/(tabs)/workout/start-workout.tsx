import { client, urlFor } from "@/sanity/sanityClient";
import * as Haptics from "expo-haptics";
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

const StartWorkoutPage = () => {
  const { id } = useLocalSearchParams();

  const [workout, setWorkout] = useState(null);
  const [index, setIndex] = useState(0);

  // GET READY
  const [ready, setReady] = useState(true);
  const [readyTimer, setReadyTimer] = useState(10);

  // EXERCISE MODE
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch workout
  useEffect(() => {
    const fetchWorkout = async () => {
      const query = `*[_type == "workout" && _id == "${id}"]{
        _id,
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
            description,
            image
          }
        }
      }[0]`;

      const data = await client.fetch(query);
      setWorkout(data);
    };

    fetchWorkout();
  }, []);

  // READY TIMER
  useEffect(() => {
    if (!ready) return;

    if (readyTimer === 0) {
      setReady(false);
      return;
    }

    const interval = setInterval(() => {
      setReadyTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [ready, readyTimer]);

  // EXERCISE TIMER
  useEffect(() => {
    if (ready || isPaused) return;

    const currentDuration = workout?.exercises[index]?.duration;

    if (exerciseTimer >= currentDuration) {
      handleNext();
      return;
    }

    const interval = setInterval(() => {
      setExerciseTimer((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [ready, isPaused, exerciseTimer]);

  if (!workout) return null;

  const current = workout.exercises[index];

  // NEXT
  const handleNext = () => {
    const last = index === workout.exercises.length - 1;

    if (!last) {
      setIndex((prev) => prev + 1);
      setExerciseTimer(0);
      setIsPaused(false);
      setReady(true);
      setReadyTimer(10);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Alert.alert("Workout Completed 🎉", "Amazing work! Keep pushing 💪", [
      {
        text: "OK",
        onPress: () => router.replace("/(tabs)/workout"),
      },
    ]);
  };

  /* ---------------------------------------------------
      GET READY SCREEN (Beautiful White Version)
  -----------------------------------------------------*/
  if (ready) {
    return (
      <SafeAreaView className="flex-1 bg-white px-6 pt-10 pb-8">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Text className="text-center text-4xl font-bold text-gray-900">
            Get Ready
          </Text>

          <Text className="text-center text-7xl font-extrabold text-blue-600 mt-10">
            {readyTimer}
          </Text>

          <Text className="text-center text-gray-500 mt-4 text-lg">
            Upcoming Exercise
          </Text>

          <Text className="text-center text-2xl font-semibold text-gray-900 mt-2">
            {current.exercise?.name}
          </Text>

          <View className="bg-gray-100 rounded-3xl p-4 mt-8 shadow-sm">
            <Image
              source={{ uri: urlFor(current.exercise?.image).url() }}
              style={{
                width: "100%",
                height: 250,
                borderRadius: 20,
              }}
            />
          </View>

          {/* SKIP BUTTON */}
          <TouchableOpacity
            onPress={() => setReady(false)}
            className="bg-blue-600 py-4 rounded-xl mt-12"
          >
            <Text className="text-center text-white text-lg font-semibold">
              Skip
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ---------------------------------------------------
      EXERCISE SCREEN (Scroll + Premium UI)
  -----------------------------------------------------*/
  return (
    <SafeAreaView className="flex-1 bg-white px-6 pt-8 pb-8">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* Header */}
        <Text className="text-gray-900 text-2xl font-bold">
          Exercise {index + 1} / {workout.exercises.length}
        </Text>

        <View className="bg-gray-100 rounded-3xl p-4 mt-5 shadow-sm">
          <Image
            source={{ uri: urlFor(current.exercise?.image).url() }}
            style={{
              width: "100%",
              height: 240,
              borderRadius: 20,
            }}
          />
        </View>

        <Text className="text-3xl font-bold text-gray-900 mt-6">
          {current.exercise?.name}
        </Text>

        <Text className="text-gray-500 mt-1 text-lg">
          Duration: {current.duration}s
        </Text>

        {/* Sets */}
        <Text className="text-gray-900 font-semibold mt-8 text-lg">Sets</Text>

        {current.sets.map((s, i) => (
          <View
            key={s._key}
            className="bg-gray-100 p-4 rounded-xl mt-3 flex-row justify-between"
          >
            <Text className="text-gray-800 font-semibold">Set {i + 1}</Text>
            <Text className="text-gray-600">
              {s.reps} reps — {s.weightValue}
              {s.weightType}
            </Text>
          </View>
        ))}

        {/* Timer */}
        <Text className="text-center text-blue-600 text-6xl font-extrabold mt-12">
          {exerciseTimer}s
        </Text>

        {/* Pause / Resume */}
        <TouchableOpacity
          onPress={() => setIsPaused(!isPaused)}
          className={`py-4 rounded-xl mt-10 ${
            isPaused ? "bg-green-600" : "bg-red-600"
          }`}
        >
          <Text className="text-center text-white text-lg font-semibold">
            {isPaused ? "Resume" : "Pause"}
          </Text>
        </TouchableOpacity>

        {/* NEXT */}
        <TouchableOpacity
          onPress={handleNext}
          className="bg-blue-600 py-4 rounded-xl mt-4"
        >
          <Text className="text-center text-white text-lg font-bold">
            {index < workout.exercises.length - 1
              ? "Next Exercise"
              : "Finish Workout"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StartWorkoutPage;
