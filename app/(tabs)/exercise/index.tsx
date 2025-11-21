import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllExercises } from "../../../sanity/lib/exerciseApi";
import { Exercise } from "@/sanity/sanity.types";
import { urlFor } from "@/sanity/sanityClient";
import { getExerciseAI } from "@/sanity/lib/getExerciseAI";
import { router } from "expo-router";

export default function ExerciseScreen() {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string>("");

  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [filtered, setFiltered] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Exercise | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  // Fetch data
  const loadData = async () => {
    const data = await getAllExercises();
    setAllExercises(data);
    setFiltered(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  // Search Filter Logic
  const handleSearch = (text: string) => {
    setSearch(text);

    if (!text.trim()) return setFiltered(allExercises);

    const lower = text.toLowerCase();

    const filteredList = allExercises.filter((ex) =>
      ex.name?.toLowerCase().includes(lower)
    );

    setFiltered(filteredList);
  };

  useEffect(() => {
    console.log("Items", selected);
  }, [selected]);

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      {/* 🔍 Search Bar */}
      <TextInput
        value={search}
        onChangeText={handleSearch}
        placeholder="Search exercises..."
        className="bg-gray-100 p-4 rounded-2xl text-base mb-4"
      />

      {/* 🏋️ Exercise List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View className="items-center mt-20">
            <Text className="text-gray-500 text-lg">No exercises found.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              router.push({
                pathname: "/exercise-diff",
                params: { id: item._id, from: "exercise" },
              });
            }}
            className="flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100"
          >
            <Image
              source={{ uri: urlFor(item.image).width(200).url() }}
              className="w-[70px] h-[70px] rounded-xl mr-4"
            />

            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {item.name}
              </Text>
              <Text className="text-gray-500 capitalize">
                {item.difficulty}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
