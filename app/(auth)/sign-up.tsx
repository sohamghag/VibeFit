import { useOAuth, useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // LOADING UI
  const LoadingScreen = () => (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="black" />
      <Text className="mt-3 text-gray-600 text-lg">Please wait…</Text>
    </SafeAreaView>
  );

  // SIGN UP
  const handleSignUp = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (err: any) {
      console.log("SIGN UP ERROR:", err);
      alert(err?.errors?.[0]?.longMessage || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // VERIFY
  const handleVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)/home");
      }
    } catch (err: any) {
      console.log("VERIFY ERROR:", err);
      alert(err?.errors?.[0]?.longMessage || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE
  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        router.replace("/(tabs)/home");
      }
    } catch (err) {
      console.log("Google Sign Up Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // LOADING
  if (loading) return <LoadingScreen />;

  // OTP SCREEN
  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-white px-6">
        <View className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <Text className="text-2xl font-bold text-center mb-4">
            Verify Your Email
          </Text>

          <Text className="text-gray-600 text-center mb-6">
            Enter the 6-digit code sent to your email.
          </Text>

          <TextInput
            placeholder="Verification Code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            className="border border-gray-300 rounded-xl p-4 text-center text-lg tracking-widest bg-gray-50 mb-6"
          />

          <TouchableOpacity
            onPress={handleVerify}
            className="bg-blue-600 py-4 rounded-xl active:opacity-90"
          >
            <Text className="text-white text-center font-semibold text-base">
              Verify & Continue
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // MAIN SIGN-UP
  return (
    <SafeAreaView className="flex-1 bg-white px-6 justify-center">
      {/* Logo + Header */}
      <View className="items-center mb-8">
        <Image
          source={require("../../assets/splash.png")}
          style={{ width: 65, height: 65, borderRadius: 16 }}
        />
        <Text className="text-2xl font-bold mt-4">VibeFit</Text>
        <Text className="text-gray-500 font-semibold text-md">
          Create your account to get started
        </Text>
      </View>

      {/* Card */}
      <View className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
        <Text className="text-center text-xl font-semibold mb-6">
          Create Account
        </Text>

        {/* FIRST NAME */}
        <Text className="text-gray-700 mb-1">First Name</Text>
        <TextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4 bg-gray-50"
        />

        {/* LAST NAME */}
        <Text className="text-gray-700 mb-1">Last Name</Text>
        <TextInput
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4 bg-gray-50"
        />

        {/* EMAIL */}
        <Text className="text-gray-700 mb-1">Email</Text>
        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          value={emailAddress}
          onChangeText={setEmailAddress}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4 bg-gray-50"
        />

        {/* PASSWORD */}
        <Text className="text-gray-700 mb-1">Password</Text>
        <View className="relative mb-4">
          <TextInput
            placeholder="Password"
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

        {/* CONTINUE */}
        <TouchableOpacity
          onPress={handleSignUp}
          className="bg-blue-600 py-4 rounded-xl active:opacity-90"
        >
          <Text className="text-white text-center font-semibold text-base">
            Continue
          </Text>
        </TouchableOpacity>

        {/* OR */}
        <View className="flex-row items-center my-4">
          <View className="flex-1 h-[1px] bg-gray-300" />
          <Text className="px-2 text-gray-500">or</Text>
          <View className="flex-1 h-[1px] bg-gray-300" />
        </View>

        {/* GOOGLE */}
        <TouchableOpacity
          onPress={handleGoogleSignUp}
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
        <Link href="/(auth)/sign-in">
          <Text className="text-center text-gray-600">
            Already have an account?{" "}
            <Text className="text-blue-600 font-semibold">Sign In</Text>
          </Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}
