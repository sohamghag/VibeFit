import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export default function ResetPassword() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const router = useRouter();

  // TWO independent loading states
  const [sendingCode, setSendingCode] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);

  // ---------------------
  // SEND RESET CODE
  // ---------------------
  const onSendCode = async () => {
    if (!isLoaded) return;
    setSendingCode(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      setPendingVerification(true);
    } catch (err) {
      console.log("Error sending reset code:", err);
    } finally {
      setSendingCode(false);
    }
  };

  // ---------------------
  // VERIFY + RESET PASSWORD
  // ---------------------
  const onResetPassword = async () => {
    if (!isLoaded) return;
    setResettingPassword(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)/home");
      }
    } catch (err) {
      console.log("Error verifying code:", err);
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-blue-600 to-indigo-700">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="bg-white mx-5 p-6 rounded-2xl shadow-lg">
            <Text className="text-3xl font-bold text-center text-gray-900 mb-3">
              Forgot Password
            </Text>

            {!pendingVerification && (
              <>
                <Text className="text-gray-500 text-center mb-4">
                  Enter your email. We’ll send you a reset code.
                </Text>

                <TextInput
                  className="border border-gray-300 rounded-xl p-3 mb-4 bg-gray-50"
                  placeholder="Email address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />

                <TouchableOpacity
                  className="bg-blue-600 p-3 rounded-xl mt-2 active:bg-blue-700"
                  onPress={onSendCode}
                  disabled={sendingCode}
                >
                  {sendingCode ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-center font-semibold">
                      Send Reset Code
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {pendingVerification && (
              <>
                <Text className="text-gray-500 text-center mb-4">
                  Enter the verification code & your new password.
                </Text>

                <TextInput
                  className="border border-gray-300 rounded-xl p-3 mb-3 bg-gray-50"
                  placeholder="Reset Code"
                  value={code}
                  onChangeText={setCode}
                />

                <TextInput
                  className="border border-gray-300 rounded-xl p-3 mb-4 bg-gray-50"
                  placeholder="New Password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />

                <TouchableOpacity
                  className="bg-green-600 p-3 rounded-xl mt-2 active:bg-green-700"
                  onPress={onResetPassword}
                  disabled={resettingPassword}
                >
                  {resettingPassword ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-center font-semibold">
                      Reset Password
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          <TouchableOpacity className="mt-5" onPress={() => router.back()}>
            <Text className="text-white text-center underline text-lg">
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
