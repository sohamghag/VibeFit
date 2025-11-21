import { Redirect } from "expo-router";

export default function NotFound() {
  // When Clerk triggers OAuth callback, send user directly to home tab
  return <Redirect href="/(tabs)/home" />;
}
