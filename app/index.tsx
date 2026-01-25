import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to provider (role selection) on app launch
  return <Redirect href="/provider" />;
}
