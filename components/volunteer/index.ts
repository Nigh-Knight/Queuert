/**
 * Volunteer Component Exports
 * 
 * This file provides a centralized export point for all volunteer-related components.
 * Import components using: import { QueueCard, EventDashboardScreen } from '@/components/volunteer'
 */

// Atomic Components
export { StatusBadge } from './atoms/StatusBadge';
export type { StatusBadgeProps } from './atoms/StatusBadge';

export { InfoRow } from './atoms/InfoRow';
export type { InfoRowProps } from './atoms/InfoRow';

export { StatCard } from './atoms/StatCard';
export type { StatCardProps } from './atoms/StatCard';

export { TimerDisplay } from './atoms/TimerDisplay';
export type { TimerDisplayProps } from './atoms/TimerDisplay';

export { MachineStatusChip } from './atoms/MachineStatusChip';
export type { MachineStatusChipProps } from './atoms/MachineStatusChip';

export { MachineTypeCard } from './atoms/MachineTypeCard';
export type { MachineTypeCardProps } from './atoms/MachineTypeCard';

export { CycleDurationControl } from './atoms/CycleDurationControl';
export type { CycleDurationControlProps } from './atoms/CycleDurationControl';

export { QueueCard } from './atoms/QueueCard';
export type { QueueCardProps } from './atoms/QueueCard';

// Screen Components
export { EventDashboardScreen } from './screens/EventDashboardScreen';
export type { EventDashboardScreenProps } from './screens/EventDashboardScreen';

export { UserRegistrationScreen } from './screens/UserRegistrationScreen';
export type { UserRegistrationScreenProps, UserRegistrationFormData } from './screens/UserRegistrationScreen';

export { QRCodeGenerationScreen } from './screens/QRCodeGenerationScreen';
export type { QRCodeGenerationScreenProps } from './screens/QRCodeGenerationScreen';

export { AssignLaundryCycleScreen } from './screens/AssignLaundryCycleScreen';
export type { AssignLaundryCycleScreenProps, MachineInUse } from './screens/AssignLaundryCycleScreen';

export { UserDetailsScreen } from './screens/UserDetailsScreen';
export type { 
  UserDetailsScreenProps,
  UserRegistrationData,
  LaundryStatus,
  LaundryUpdateData,
} from './screens/UserDetailsScreen';

export { QueueListScreen } from './screens/QueueListScreen';
export type { QueueListScreenProps, QueueUser } from './screens/QueueListScreen';
