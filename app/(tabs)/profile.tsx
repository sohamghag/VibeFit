import {
  getTotalMinutesTrained,
  getWorkoutCount,
} from "@/sanity/lib/historyApi";
import { useUser } from "@clerk/clerk-expo";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SignOutButton from "../components/SignOutButton";

function formatMinutes(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return "0 min";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}h`;

  return `${hours}h ${minutes}m`;
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const loadWorkoutInfo = async () => {
    if (user?.id) {
      const count = await getWorkoutCount(user.id);
      const minutes = await getTotalMinutesTrained(user.id);

      setWorkoutCount(count);
      setTotalMinutes(minutes);
    }
  };

  useEffect(() => {
    loadWorkoutInfo();
  }, [user]);

  useEffect(() => {
    console.log("This is our user", user);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadWorkoutInfo();
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  // ---------- EDIT PROFILE (Name) ----------
  const handleEditName = async () => {
    Alert.prompt("Edit Name", "Enter your new full name:", async (newName) => {
      if (!newName) return;
      const [firstName, ...last] = newName.split(" ");
      try {
        await user?.update({
          firstName,
          lastName: last.join(" "),
        });
        Alert.alert("Success", "Name updated!");
      } catch (err) {
        Alert.alert("Error", "Could not update name.");
      }
    });
  };

  // ---------- CHANGE PROFILE IMAGE ----------
  const handleChangeImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const file = {
        uri: result.assets[0].uri,
        type: "image/jpeg",
        name: "profile.jpg",
      };

      try {
        await user?.setProfileImage({ file });
        Alert.alert("Success", "Profile image updated!");
      } catch (err) {
        Alert.alert("Error", "Image upload failed.");
      }
    }
  };

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <View className="items-center">
          <View className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full items-center justify-center mb-4">
            <Ionicons name="person" size={28} color="white" />
          </View>
          <Text className="text-lg font-medium text-gray-600">
            Loading your vibe...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const formattedTime = useMemo(
    () => formatMinutes(totalMinutes),
    [totalMinutes]
  );

  const joinedDate = user?.createdAt ? new Date(user.createdAt) : new Date();
  const joinedLabel = joinedDate.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

  const settingsItems = [
    {
      iconSet: Ionicons,
      icon: "person-outline" as const,
      label: "Personal",
      onPress: () =>
        Alert.alert("Personal Info", "Will Be Coming In Next Update"),
    },
    {
      iconSet: Ionicons,
      icon: "settings-outline" as const,
      label: "General",
      onPress: () => setSettingsVisible(true),
    },
    {
      iconSet: Ionicons,
      icon: "notifications-outline" as const,
      label: "Notification",
      onPress: () => Alert.alert("Notifications", "Coming soon 🚧"),
    },
    {
      iconSet: Ionicons,
      icon: "help-circle-outline" as const,
      label: "Help",
      onPress: () =>
        Alert.alert(
          "Help",
          "For any issues, please contact support or your trainer."
        ),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Premium Gradient Background */}
        <View className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-indigo-50/80 via-white to-white" />

        {/* Subtle Pattern Overlay */}
        <View className="absolute top-0 left-0 right-0 h-80 opacity-5">
          <View className="flex-row justify-between px-8 mt-20">
            {[...Array(3)].map((_, i) => (
              <View key={i} className="w-20 h-20 rounded-full bg-indigo-300" />
            ))}
          </View>
        </View>

        {/* Header Section */}
        <View className="pt-8 pb-6 items-center px-6">
          <Text className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">
            VibeFit
          </Text>
          <Text className="text-md font-medium text-gray-500 mb-6">
            PROFILE
          </Text>

          {/* Premium Avatar with Glow Effect */}
          <View className="relative mb-4">
            <View className="absolute -inset-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full opacity-20 blur-lg" />
            <TouchableOpacity onPress={handleChangeImage} className="relative">
              <Image
                source={{
                  uri:
                    user?.imageUrl ||
                    "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
                }}
                className="w-36 h-36 rounded-full border-4 border-white shadow-2xl"
                resizeMode="cover"
              />
              {/* Glassmorphism Edit Button */}
              <View className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm w-12 h-12 rounded-full items-center justify-center shadow-2xl border border-white/80">
                <Feather name="edit-3" size={18} color="#4F46E5" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Name & Email with Enhanced Typography */}
          <TouchableOpacity
            onPress={handleEditName}
            className="items-center active:opacity-70"
          >
            <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
              {user?.fullName || "User"}
            </Text>
            <View className="flex-row items-center bg-gray-50/80 rounded-full px-4 py-2">
              <Ionicons name="mail-outline" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2">
                {user?.primaryEmailAddress?.emailAddress ?? "Email hidden"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Premium Stats Grid */}
        <View className="px-6 mt-2 mb-8 ">
          <View className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-indigo-100 border border-white/80 p-6">
            <View className="flex-row justify-between">
              {/* Total Time */}
              <View className="items-center flex-1">
                <View className=" w-20 h-20 rounded-2xl items-center justify-center mb-3">
                  <Feather name="clock" size={30} color="#6B7280" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-1">
                  {formattedTime}
                </Text>
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Time
                </Text>
              </View>

              {/* Workouts */}
              <View className="items-center flex-1">
                <View className=" w-20 h-20 rounded-2xl items-center justify-center mb-3">
                  <Feather name="activity" size={26} color="#10B981" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-1">
                  {workoutCount}
                </Text>
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workouts
                </Text>
              </View>

              {/* Member Since */}
              <View className="items-center flex-1">
                <View className=" w-20 h-20 rounded-2xl items-center justify-center mb-3">
                  <Feather name="calendar" size={26} color="#6B7280" />
                </View>
                <Text className="text-xl font-bold text-gray-900 mb-1">
                  {joinedLabel}
                </Text>
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member Since
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Enhanced Account Details Card */}
        <View className="px-6 mb-6">
          <View className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl shadow-gray-200/80 border border-gray-100/80 overflow-hidden">
            <View className="p-6 border-b border-gray-100">
              <Text className="text-xl font-bold text-gray-900">
                Activity Summary
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                Your fitness journey
              </Text>
            </View>

            <View className="p-1">
              <View className="flex-row justify-between items-center px-7 py-4">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-indigo-50 rounded-lg items-center justify-center mr-3">
                    <MaterialCommunityIcons
                      name="dumbbell"
                      size={20}
                      color="#4F46E5"
                    />
                  </View>
                  <Text className="text-gray-700 font-medium">
                    Total Workouts
                  </Text>
                </View>
                <Text className="text-lg font-bold text-gray-900">
                  {workoutCount}
                </Text>
              </View>

              <View className="h-px bg-gray-100 mx-5" />

              <View className="flex-row justify-between items-center px-7 py-4">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-emerald-50 rounded-lg items-center justify-center mr-3">
                    <Ionicons name="time" size={20} color="#10B981" />
                  </View>
                  <Text className="text-gray-700 font-medium">
                    Minutes Trained
                  </Text>
                </View>
                <Text className="text-lg font-bold text-gray-900">
                  {totalMinutes}
                </Text>
              </View>

              <View className="h-px bg-gray-100 mx-5" />

              <View className="flex-row justify-between items-center px-7 py-4">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-amber-50 rounded-lg items-center justify-center mr-3">
                    <Ionicons name="calendar" size={20} color="#F59E0B" />
                  </View>
                  <Text className="text-gray-700 font-medium">Joined On</Text>
                </View>
                <Text className="text-base font-semibold text-gray-900">
                  {joinedDate.toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Premium Settings Card */}
        <View className="px-6 mb-8">
          <View className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl shadow-gray-200/80 border border-white/80 overflow-hidden">
            {settingsItems.map((item, index) => {
              const IconComponent = item.iconSet;
              const isLast = index === settingsItems.length - 1;

              return (
                <TouchableOpacity
                  key={item.label}
                  className={`flex-row items-center px-6 py-5 active:bg-gray-50/80 ${
                    !isLast ? "border-b border-gray-100" : ""
                  }`}
                  onPress={item.onPress}
                >
                  <View className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl items-center justify-center shadow-sm mr-4">
                    <IconComponent name={item.icon} size={22} color="#4B5563" />
                  </View>
                  <Text className="flex-1 text-lg font-medium text-gray-800">
                    {item.label}
                  </Text>
                  <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                    <Feather name="chevron-right" size={16} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Enhanced Sign Out */}
        <View className="px-6">
          <SignOutButton />
        </View>

        {/* Premium Settings Modal */}
        <Modal
          visible={settingsVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setSettingsVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl overflow-hidden">
              {/* Handle Bar */}
              <View className="items-center py-3">
                <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </View>

              {/* Header */}
              <View className="px-6 pb-4 border-b border-gray-100">
                <Text className="text-2xl font-bold text-gray-900">
                  Settings
                </Text>
                <Text className="text-gray-600 mt-1">
                  Manage your account preferences
                </Text>
              </View>

              {/* Content */}
              <View className="p-6">
                <Text className="text-gray-700 leading-6 mb-6">
                  More advanced account settings will come here later including
                  email preferences, password management, and personalized
                  workout recommendations.
                </Text>

                <TouchableOpacity
                  onPress={() => setSettingsVisible(false)}
                  className="bg-gray-500 
             rounded-2xl py-3 px-6 
             flex-row items-center justify-center 
             shadow-sm active:opacity-90"
                >
                  <Text className=" text-white  font-bold text-xl ">
                    Got It
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
