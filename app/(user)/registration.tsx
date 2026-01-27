import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import {
  RegistrationFormScreen,
  RegistrationData,
} from '@/components/provider/screens/RegistrationFormScreen';

/**
 * Registration form screen for service users
 * Collects user information before QR scan
 *
 * Flow: Registration → QR Scan → Status
 */
export default function UserRegistration() {
  const router = useRouter();
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  const handleSubmit = (data: RegistrationData) => {
    // Store registration data temporarily
    setRegistrationData(data);

    // Navigate to QR scan with registration data
    router.push({
      pathname: '/(user)/scan-qr',
      params: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
        livingCondition: data.livingCondition,
        estimatedLoads: data.estimatedLoads,
        estimatedWeight: data.estimatedWeight,
      },
    });
  };

  return (
    <RegistrationFormScreen
      onSubmit={handleSubmit}
    />
  );
}
