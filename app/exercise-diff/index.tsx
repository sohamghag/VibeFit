import { getExerciseAI } from "@/sanity/lib/getExerciseAI";
import { Exercise } from "@/sanity/sanity.types";
import { client } from "@/sanity/sanityClient";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../components/BackButton";

export default function ExerciseDiff() {
  const { id } = useLocalSearchParams();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    async function loadExercise() {
      const query = `
        *[_type == "exercise" && _id == $id][0]{
          _id,
          name,
          description,
          difficulty,
          videoUrl,
          image { asset->{ url } }
        }
      `;
      const result = await client.fetch(query, { id });
      setExercise(result);
      setLoading(false);
    }

    loadExercise();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6D28D9" />
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-2xl font-semibold text-gray-700">
          Exercise not found ❌
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="h-44 bg-gradient-to-b from-blue-200 to-white px-5 pt-7">
        <BackButton />
        <Text className="text-4xl font-extrabold text-gray-900 mt-5">
          Exercise Details
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 18 }}>
        {/* Exercise Image */}
        {exercise.image?.asset?.url && (
          <Image
            source={{ uri: exercise.image.asset.url }}
            style={{
              width: "100%",
              height: 280,
              borderRadius: 22,

              marginBottom: 20,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 12,
              shadowOffset: { height: 5, width: 0 },
            }}
          />
        )}

        {/* Name + Difficulty */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-3xl font-bold text-gray-900 flex-1">
            {exercise.name}
          </Text>

          <View className="bg-blue-100 px-5 py-2 rounded-2xl">
            <Text className="text-blue-700 font-semibold text-lg capitalize">
              {exercise.difficulty}
            </Text>
          </View>
        </View>

        {/* Description Card */}
        <View className="bg-gray-50 p-5 rounded-2xl mb-5 shadow-sm">
          <Text className="text-lg font-bold text-gray-700 leading-7">
            {exercise.description}
          </Text>
        </View>

        {/* AI Overview */}
        {aiResult ? (
          <View className="bg-white border border-gray-200 p-6 rounded-3xl shadow-md mb-4">
            <Text className="text-2xl font-semibold text-gray-900 mb-3">
              AI Guide
            </Text>
            <Text className="text-lg text-gray-700 leading-7">{aiResult}</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={async () => {
              setAiLoading(true);
              const text = await getExerciseAI(
                exercise.name || "",
                exercise.description || ""
              );
              setAiResult(text);
              setAiLoading(false);
            }}
            className="bg-purple-700 p-5 rounded-2xl mt-4 shadow-sm"
          >
            {aiLoading ? (
              <ActivityIndicator color="white" size="large" />
            ) : (
              <Text className="text-white text-center font-bold text-lg tracking-wide">
                ✨ Generate AI Exercise Guide
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Video Button */}
        {exercise.videoUrl && (
          <TouchableOpacity
            onPress={() => Linking.openURL(exercise.videoUrl)}
            className="bg-blue-600 p-5 rounded-2xl mt-6 shadow-md"
          >
            <Text className="text-center text-white font-bold text-lg">
              ▶ Watch Tutorial Video
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
