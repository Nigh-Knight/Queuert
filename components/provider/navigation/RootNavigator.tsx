import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RoleSelectionScreen } from '../screens/RoleSelectionScreen';
import { PhoneInputScreen } from '../screens/PhoneInputScreen';
import { VerificationScreen } from '../screens/VerificationScreen';
import { WelcomeBackScreen } from '../screens/WelcomeBackScreen';
import { RegistrationFormScreen, RegistrationData } from '../screens/RegistrationFormScreen';
import { QRCodeScannerScreen } from '../screens/QRCodeScannerScreen';
import { LaundryStatusScreen } from '../screens/LaundryStatusScreen';
import { Colors } from '@/constants/theme';

export type RootStackParamList = {
  RoleSelection: undefined;
  PhoneInput: { role: 'serviceUser' | 'volunteer' | 'teamLeader' };
  Verification: { phoneNumber: string; countryCode: string };
  WelcomeBack: undefined;
  Registration: undefined;
  QRCodeScanner: undefined;
  LaundryStatus: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface NavigationState {
  selectedRole: 'serviceUser' | 'volunteer' | 'teamLeader' | null;
  phoneNumber: string;
  countryCode: string;
  registrationData: RegistrationData | null;
}

export function RootNavigator() {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    selectedRole: null,
    phoneNumber: '',
    countryCode: '+1',
    registrationData: null,
  });

  const defaultScreenOptions = {
    headerShown: false,
    cardStyle: { backgroundColor: Colors.background },
  };

  return (
    <Stack.Navigator
      screenOptions={defaultScreenOptions}
      initialRouteName="RoleSelection"
    >
        <Stack.Screen
          name="RoleSelection"
          options={{ animationEnabled: false }}
        >
          {({ navigation }) => (
            <RoleSelectionScreen
              onRoleSelect={(role) => {
                setNavigationState((prev) => ({ ...prev, selectedRole: role }));
                navigation.navigate('PhoneInput', { role });
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="PhoneInput">
          {({ navigation, route }) => (
            <PhoneInputScreen
              onPhoneSubmit={(countryCode, phoneNumber) => {
                setNavigationState((prev) => ({
                  ...prev,
                  countryCode,
                  phoneNumber,
                }));
                navigation.navigate('Verification', {
                  phoneNumber,
                  countryCode,
                });
              }}
              onBack={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Verification">
          {({ navigation, route }) => (
            <VerificationScreen
              phoneNumber={navigationState.phoneNumber}
              onVerificationComplete={(code) => {
                // After verification, check if user is new or returning
                // For now, navigate to registration
                navigation.navigate('Registration');
              }}
              onBack={() => navigation.goBack()}
              onResendCode={() => {
                // Handle resend logic
                console.log('Resend code');
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="WelcomeBack">
          {({ navigation }) => (
            <WelcomeBackScreen
              onContinue={(phoneNumber) => {
                setNavigationState((prev) => ({
                  ...prev,
                  phoneNumber,
                }));
                navigation.navigate('Verification', {
                  phoneNumber,
                  countryCode: navigationState.countryCode,
                });
              }}
              onBack={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Registration">
          {({ navigation }) => (
            <RegistrationFormScreen
              onSubmit={(formData) => {
                setNavigationState((prev) => ({
                  ...prev,
                  registrationData: formData,
                }));
                navigation.navigate('QRCodeScanner');
              }}
              onBack={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="QRCodeScanner">
          {({ navigation }) => (
            <QRCodeScannerScreen
              onQRCodeScanned={(code) => {
                // QR code scanned, navigate to laundry status
                navigation.navigate('LaundryStatus');
              }}
              onCancel={() => navigation.goBack()}
              onBack={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="LaundryStatus">
          {({ navigation }) => (
            <LaundryStatusScreen
              placeInLine={3}
              estimatedWaitTime="15-20 minutes"
              machineNumber={7}
              machineStatus="Washing"
              machineTimeRemaining="25:30"
              onEndWash={() => {
                // Handle wash completion
                alert('Wash ended!');
              }}
              onBack={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
    </Stack.Navigator>
  );
}
