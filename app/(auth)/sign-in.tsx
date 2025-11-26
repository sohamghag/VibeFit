import { useOAuth, useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../../global.css";

WebBrowser.maybeCompleteAuthSession();

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const LoadingScreen = () => (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="black" />
      <Text className="mt-3 text-gray-600 text-lg">Signing you in...</Text>
    </SafeAreaView>
  );

  const handleSignIn = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)/home");
      }
    } catch (err) {
      console.error("Sign-in error:", err);
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        router.replace("/(tabs)/home");
      }
    } catch (err) {
      console.log("Google OAuth error:", err);
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <LoadingScreen />
  ) : (
    <SafeAreaView className="flex-1 bg-white px-5 justify-center">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Logo */}
        <View className="items-center mb-8">
          <Image
            source={require("../../assets/splash.png")}
            style={{ width: 65, height: 65, borderRadius: 16 }}
          />
          <Text className="text-3xl font-bold mt-4">VibeFit</Text>
          <Text className="text-gray-600 font-semibold text-md">
            Track your fitness journey
          </Text>
        </View>

        {/* Card */}
        <View className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <Text className="text-center text-xl font-semibold mb-6">
            Welcome Back
          </Text>

          {/* Email */}
          <Text className="text-gray-700 mb-1">Email</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#6B7280"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            className="border border-gray-300 rounded-xl px-4 py-3 mb-4 bg-gray-50"
          />

          {/* Password */}
          <Text className="text-gray-700 mb-1">Password</Text>
          <View className="relative mb-4">
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor="#6B7280"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50"
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5"
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          {/* Sign In */}
          <TouchableOpacity
            onPress={handleSignIn}
            className="bg-blue-600 py-4 rounded-xl active:opacity-90"
          >
            <Text className="text-white text-center font-semibold text-base">
              Sign In
            </Text>
          </TouchableOpacity>

          {/* OR */}
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-[1px] bg-gray-300" />
            <Text className="px-2 text-gray-500">or</Text>
            <View className="flex-1 h-[1px] bg-gray-300" />
          </View>

          {/* Google */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            className="border border-gray-300 flex-row items-center justify-center py-3 rounded-xl active:opacity-90 bg-white"
          >
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
              }}
              style={{ width: 22, height: 22, marginRight: 10 }}
            />
            <Text className="text-gray-700 font-semibold">
              Continue with Google
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="mt-6">
          <Link href="/(auth)/sign-up">
            <Text className="text-center text-gray-600">
              Don't have an account?{" "}
              <Text className="text-blue-600 font-semibold">Sign Up</Text>
            </Text>
          </Link>

          <View className="mt-3">
            <Link href="/(auth)/reset-password">
              <Text className="text-center text-blue-600 ">
                Forgot Password?
              </Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
