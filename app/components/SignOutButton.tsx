import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { useClerk } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { useState } from "react";

const SignOutButton = () => {
  const { signOut } = useClerk();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      Linking.openURL(Linking.createURL("/"));
    } catch (error) {
      console.log("Sign-out error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleSignOut}
      disabled={loading}
      className="bg-red-600 p-2 px-7 rounded-md"
      style={{ opacity: loading ? 0.7 : 1 }}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-white text-xl font-semibold text-center">
          Sign Out
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default SignOutButton;
