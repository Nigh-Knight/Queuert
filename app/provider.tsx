import { useRouter } from 'expo-router';
import { RoleSelectionScreen } from '@/components/provider/screens/RoleSelectionScreen';

export default function ProviderApp() {
  const router = useRouter();

  const handleRoleSelect = (role: 'serviceUser' | 'volunteer' | 'teamLeader') => {
    console.log('Selected role:', role);

    if (role === 'teamLeader') {
      // Navigate to admin page with slide animation
      router.push('/(admin)');
    } else {
      // For now, just log - future phases will handle volunteer/service user flows
      console.log('Service user and volunteer flows coming in future phases');
    }
  };

  return (
    <RoleSelectionScreen
      onRoleSelect={handleRoleSelect}
    />
  );
}
