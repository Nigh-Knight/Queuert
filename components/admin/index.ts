/**
 * Admin Component Exports
 * Barrel export file for all admin-specific components
 */

// ============================================================================
// Admin-specific Atoms
// ============================================================================
export { PhoneNumberInput } from './atoms/PhoneNumberInput';
export type { PhoneNumberInputProps, CountryCode } from './atoms/PhoneNumberInput';

export { QRCodeDisplay } from './atoms/QRCodeDisplay';
export type { QRCodeDisplayProps } from './atoms/QRCodeDisplay';

export { TeamMemberCard } from './atoms/TeamMemberCard';
export type { TeamMemberCardProps } from './atoms/TeamMemberCard';

export { SearchBar } from './atoms/SearchBar';
export type { SearchBarProps } from './atoms/SearchBar';

export { FloatingActionButton } from './atoms/FloatingActionButton';
export type { FloatingActionButtonProps } from './atoms/FloatingActionButton';

export { SessionCard } from './atoms/SessionCard';

export { EmptyState } from './atoms/EmptyState';

// ============================================================================
// Admin Screens
// ============================================================================
export { TeamLeaderLoginScreen } from './screens/TeamLeaderLoginScreen';
export type { TeamLeaderLoginScreenProps } from './screens/TeamLeaderLoginScreen';

export { QueueListScreen } from './screens/QueueListScreen';
export type { QueueListScreenProps, QueueUser } from './screens/QueueListScreen';

export { AssignLaundryCycleScreen } from './screens/AssignLaundryCycleScreen';
export type { AssignLaundryCycleScreenProps, InUseMachine } from './screens/AssignLaundryCycleScreen';

export { UserRegistrationScreen } from './screens/UserRegistrationScreen';
export type { UserRegistrationScreenProps, UserRegistrationData } from './screens/UserRegistrationScreen';

export { GenerateQRScreen } from './screens/GenerateQRScreen';
export type { GenerateQRScreenProps } from './screens/GenerateQRScreen';

export { TeamManagementScreen } from './screens/TeamManagementScreen';
export type { TeamManagementScreenProps, TeamMember } from './screens/TeamManagementScreen';

// ============================================================================
// Re-export commonly used components from volunteer
// ============================================================================
export { StatusBadge } from '../volunteer/atoms/StatusBadge';
export type { StatusBadgeProps } from '../volunteer/atoms/StatusBadge';

export { MachineTypeCard } from '../volunteer/atoms/MachineTypeCard';
export type { MachineTypeCardProps } from '../volunteer/atoms/MachineTypeCard';

export { MachineStatusChip } from '../volunteer/atoms/MachineStatusChip';
export type { MachineStatusChipProps } from '../volunteer/atoms/MachineStatusChip';

export { CycleDurationControl } from '../volunteer/atoms/CycleDurationControl';
export type { CycleDurationControlProps } from '../volunteer/atoms/CycleDurationControl';

export { InfoRow } from '../volunteer/atoms/InfoRow';
export type { InfoRowProps } from '../volunteer/atoms/InfoRow';

export { QueueCard } from '../volunteer/atoms/QueueCard';
export type { QueueCardProps } from '../volunteer/atoms/QueueCard';

// ============================================================================
// Re-export commonly used components from provider
// ============================================================================
export { CustomButton } from '../provider/atoms/CustomButton';
export type { CustomButtonProps } from '../provider/atoms/CustomButton';

export { InputField } from '../provider/atoms/InputField';
export type { InputFieldProps } from '../provider/atoms/InputField';

export { DropdownSelect } from '../provider/atoms/DropdownSelect';
export type { DropdownSelectProps, DropdownOption } from '../provider/atoms/DropdownSelect';

export { Header } from '../provider/atoms/Header';
export type { HeaderProps } from '../provider/atoms/Header';
