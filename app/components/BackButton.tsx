import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function BackButton() {
  const router = useRouter();
  const { from } = useLocalSearchParams();

  const goBackTo = () => {
    if (from === "exercise") {
      router.replace("/(tabs)/exercise");
    } else if (from === "history") {
      router.replace("/(tabs)/history");
    } else {
      router.back(); // fallback
    }
  };

  return (
    <TouchableOpacity onPress={goBackTo} style={{ padding: 10 }}>
      <Ionicons name="arrow-back" size={24} color="black" />
    </TouchableOpacity>
  );
}
