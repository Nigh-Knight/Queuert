import { RoleSelectionScreen } from '@/components/provider/screens/RoleSelectionScreen';

export default function ProviderApp() {
  const handleRoleSelect = (role: 'serviceUser' | 'volunteer' | 'teamLeader') => {
    // Navigation will be handled here in the future
    console.log('Selected role:', role);
  };

  return (
    <RoleSelectionScreen
      onRoleSelect={handleRoleSelect}
    />
  );
}
