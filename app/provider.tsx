import { useRouter } from 'expo-router';
import { RoleSelectionScreen } from '@/components/provider/screens/RoleSelectionScreen';
import { SessionGuard } from '@/components/auth/SessionGuard';

export default function ProviderApp() {
  const router = useRouter();

  const handleRoleSelect = (role: 'serviceUser' | 'volunteer' | 'teamLeader') => {
    console.log('Selected role:', role);

    if (role === 'teamLeader') {
      // Navigate directly to admin verification screen
      router.push('/(admin)/verify');
    } else if (role === 'serviceUser') {
      // Navigate to service user flow (scan session QR)
      router.push('/(user)');
    } else if (role === 'volunteer') {
      // Navigate to volunteer flow (scan volunteer QR)
      router.push('/(volunteer)');
    }
  };

  const handleSessionEnd = () => {
    // Session ended, stay on role selection (already here)
    // User can select a new role to join a different session
  };

  return (
    <SessionGuard onSessionEnd={handleSessionEnd}>
      <RoleSelectionScreen onRoleSelect={handleRoleSelect} />
    </SessionGuard>
  );
}
