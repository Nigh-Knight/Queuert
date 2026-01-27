/**
 * Volunteer Dashboard
 *
 * Main volunteer hub with bottom tabs for:
 * - Dashboard: Event overview with stats
 * - Queue: Full queue management
 * - QR Code: Generate QR codes for service users
 */

import { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { SessionStorage } from '@/utils/session-storage';
import { Colors, Typography, Spacing, ComponentSize } from '@/constants/theme';
import type { Id } from '@/convex/_generated/dataModel';
import QRCode from 'react-native-qrcode-svg';

// Components
import { BottomTabBar, TabKey } from '@/components/volunteer/atoms/BottomTabBar';
import { StatCard } from '@/components/volunteer/atoms/StatCard';
import { QueueCard } from '@/components/volunteer/atoms/QueueCard';
import { SearchBar } from '@/components/admin/atoms/SearchBar';
import { FloatingActionButton } from '@/components/admin/atoms/FloatingActionButton';
import { CustomButton } from '@/components/provider/atoms/CustomButton';
import {
  AssignAndStartCycleModal,
  AssignmentData,
} from '@/components/volunteer/modals/AssignAndStartCycleModal';
import { RemoveConfirmationModal } from '@/components/volunteer/modals/RemoveConfirmationModal';
import { red } from 'react-native-reanimated/lib/typescript/Colors';

// Types
interface QueueItem {
  _id: Id<'queue'>;
  status: 'waiting' | 'washing' | 'drying' | 'ready_to_remove' | 'served' | 'removed';
  position: number;
  timerStartedAt?: number;
  timerDuration: number;
  machineNumber?: string;
  machineType?: 'washer' | 'dryer';
  user: {
    _id: Id<'users'>;
    firstName: string;
    lastName: string;
  } | null;
  intake: {
    estimatedLaundryLoads: number;
  } | null;
}

interface SelectedUser {
  id: Id<'queue'>;
  name: string;
}

export default function VolunteerDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Session state
  const [sessionId, setSessionId] = useState<Id<'sessions'> | null>(null);
  const [volunteerId, setVolunteerId] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  // Queue search
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Load session on mount
  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    const session = await SessionStorage.load();
    if (!session || session.role !== 'volunteer') {
      router.replace('./scan-qr');
      return;
    }
    setSessionId(session.sessionId as Id<'sessions'>);
    setVolunteerId(session.volunteerId || null);
  };

  // Convex queries
  const session = useQuery(
    api.sessions.getSessionById,
    sessionId ? { sessionId } : 'skip'
  );

  const queueData = useQuery(
    api.queue.getActiveQueue,
    sessionId ? { sessionId } : 'skip'
  ) as QueueItem[] | undefined;

  const volunteers = useQuery(
    api.volunteers.getVolunteersBySession,
    sessionId ? { sessionId } : 'skip'
  );

  // Convex mutations
  const assignAndStartMutation = useMutation(api.queue.assignAndStartCycle);
  const endCycleMutation = useMutation(api.queue.endCycle);
  const removeFromQueueMutation = useMutation(api.queue.removeFromQueue);
  const ensureVolunteerUserMutation = useMutation(api.volunteers.ensureVolunteerUser);

  // Computed values
  const activeQueue = useMemo(() => {
    if (!queueData) return [];
    return queueData.filter(
      (item) => item.status !== 'removed' && item.status !== 'served'
    );
  }, [queueData]);

  const filteredQueue = useMemo(() => {
    if (!searchQuery.trim()) return activeQueue;
    const query = searchQuery.toLowerCase();
    return activeQueue.filter((item) => {
      const name = `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.toLowerCase();
      return name.includes(query);
    });
  }, [activeQueue, searchQuery]);

  const stats = useMemo(() => {
    const activeWashes = activeQueue.filter(
      (item) => item.status === 'washing' || item.status === 'drying'
    ).length;
    return {
      totalInQueue: activeQueue.length,
      activeWashes,
      availableMachines: Math.max(0, 10 - activeWashes), // Assuming 10 machines total
    };
  }, [activeQueue]);

  // Get current volunteer's QR code
  const currentVolunteerQR = useMemo(() => {
    if (!volunteers || !volunteerId) return null;
    const volunteer = volunteers.find((v) => v._id === volunteerId);
    return volunteer?.qrCode || volunteerId;
  }, [volunteers, volunteerId]);

  // Event date formatting
  const eventDate = useMemo(() => {
    if (!session?.scheduledDate) return '';
    return new Date(session.scheduledDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [session]);

  // Handlers
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await SessionStorage.clear();
          router.replace('./scan-qr');
        },
      },
    ]);
  };

  const handleViewDetails = (queueId: Id<'queue'>) => {
    router.push({
      pathname: './user-details',
      params: { queueId, sessionId },
    });
  };

  const handleStartWash = async (queueId: Id<'queue'>) => {
    // For "Start Wash" without assignment, we need a volunteer user ID
    // This requires looking up the volunteer's user record
    Alert.alert(
      'Start Wash',
      'Use "Assign & Start Cycle" to assign a machine and set duration.'
    );
  };

  const handleAssignAndStart = (item: QueueItem) => {
    const name = `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim();
    setSelectedUser({ id: item._id, name: name || 'Unknown User' });
    setAssignModalVisible(true);
  };

  const handleAssignSubmit = async (data: AssignmentData) => {
    if (!selectedUser) return;

    // Find the current volunteer's userId from the volunteers list
    const currentVolunteer = volunteers?.find((v) => v._id === volunteerId);
    if (!currentVolunteer) {
      Alert.alert('Error', 'Volunteer not found. Please re-scan QR code.');
      return;
    }

    setIsActionLoading(true);
    try {
      // Ensure volunteer has a user record (creates one if needed)
      let volunteerUserId = currentVolunteer.userId;
      if (!volunteerUserId) {
        volunteerUserId = await ensureVolunteerUserMutation({
          volunteerId: currentVolunteer._id,
        });
      }

      await assignAndStartMutation({
        queueId: selectedUser.id,
        volunteerUserId,
        machineNumber: data.machineNumber,
        machineType: data.machineType,
        durationMinutes: data.durationMinutes,
      });
      setAssignModalVisible(false);
      setSelectedUser(null);
    } catch {
      Alert.alert('Error', 'Failed to start cycle. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEndCycle = async (queueId: Id<'queue'>) => {
    try {
      await endCycleMutation({ queueId });
    } catch {
      Alert.alert('Error', 'Failed to end cycle. Please try again.');
    }
  };

  const handleRemoveUser = (item: QueueItem) => {
    const name = `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim();
    setSelectedUser({ id: item._id, name: name || 'Unknown User' });
    setRemoveModalVisible(true);
  };

  const handleRemoveConfirm = async () => {
    if (!selectedUser) return;

    setIsActionLoading(true);
    try {
      await removeFromQueueMutation({ queueId: selectedUser.id });
      setRemoveModalVisible(false);
      setSelectedUser(null);
    } catch {
      Alert.alert('Error', 'Failed to remove user. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddUser = () => {
    router.push({
      pathname: './add-user',
      params: { sessionId },
    });
  };

  // Loading state
  if (!sessionId || session === undefined) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Session not found or ended
  if (session === null || !session.isActive) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {session === null ? 'Session not found' : 'Session has ended'}
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>Scan New QR Code</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'queue':
        return renderQueue();
      case 'qrcode':
        return renderQRCode();
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner}>
      {/* Event Info Card */}
      <View style={styles.eventCard}>
        <Text style={styles.eventName}>{session.location || 'Community Laundry Day'}</Text>
        <Text style={styles.eventDate}>{eventDate}</Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <StatCard
            icon={<Text style={styles.statIcon}>👥</Text>}
            value={stats.totalInQueue}
            label="Total in Queue"
            containerStyle={styles.statCard}
          />
          <StatCard
            icon={<Text style={styles.statIcon}>🧺</Text>}
            value={stats.activeWashes}
            label="Active Washes"
            containerStyle={styles.statCard}
          />
        </View>
        <View style={styles.statsRowCentered}>
          <StatCard
            icon={<Text style={styles.statIcon}>✓</Text>}
            value={stats.availableMachines}
            label="Available Machines"
            containerStyle={styles.statCardCentered}
          />
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <CustomButton
          label="Logout"
          onPress={handleLogout}
          variant="alert"
        />
      </View>
    </ScrollView>
  );

  const renderQueue = () => (
    <View style={styles.queueContainer}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search users..."
      />

      <ScrollView
        style={styles.queueList}
        contentContainerStyle={styles.queueListContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredQueue.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No users match your search' : 'No users in queue'}
            </Text>
          </View>
        ) : (
          filteredQueue.map((item) => {
            const userName = `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim();
            const displayStatus = item.status === 'ready_to_remove' ? 'done' : item.status;

            return (
              <QueueCard
                key={item._id}
                userName={userName || 'Unknown User'}
                estimatedLoads={item.intake?.estimatedLaundryLoads || 0}
                status={displayStatus as 'waiting' | 'washing' | 'drying' | 'done'}
                onViewDetails={() => handleViewDetails(item._id)}
                onStartWash={
                  item.status === 'waiting' ? () => handleStartWash(item._id) : undefined
                }
                onAssignAndStart={
                  item.status === 'waiting' ? () => handleAssignAndStart(item) : undefined
                }
                onEndCycle={
                  item.status === 'washing' || item.status === 'drying'
                    ? () => handleEndCycle(item._id)
                    : undefined
                }
                onRemove={() => handleRemoveUser(item)}
              />
            );
          })
        )}
      </ScrollView>

      <FloatingActionButton onPress={handleAddUser} position="bottom-right" />
    </View>
  );

  const renderQRCode = () => {
    // Generate SESSION QR code value for service users (not volunteer QR!)
    const qrValue = JSON.stringify({
      sessionId,
      type: 'session_join',
    });

    return (
      <ScrollView style={styles.tabContent} contentContainerStyle={styles.qrContent}>
        <View style={styles.qrHeader}>
          <Text style={styles.qrTitle}>Session QR Code</Text>
          <Text style={styles.qrSubtitle}>
            Have service users scan this code to join the queue
          </Text>
          <Text style={[styles.qrSubtitle, { marginTop: Spacing.sm, fontSize: 12, color: Colors.text.tertiary }]}>
            (This is different from your volunteer QR code)
          </Text>
        </View>

        {/* QR Code Display */}
        <View style={styles.qrCodeContainer}>
          {sessionId ? (
            <View style={styles.qrCodeWrapper}>
              <QRCode
                value={qrValue}
                size={250}
                backgroundColor="white"
                color="black"
              />
            </View>
          ) : (
            <View style={styles.qrCodePlaceholder}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.qrCodeValue}>Loading QR code...</Text>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to use:</Text>
          <Text style={styles.instructionsText}>
            1. Have service users scan this QR code with their phone
          </Text>
          <Text style={styles.instructionsText}>
            2. They will be directed to register for the queue
          </Text>
          <Text style={styles.instructionsText}>
            3. You will see their registration appear in the queue
          </Text>
        </View>

        <Text style={styles.footerNote}>
          This QR code is unique to you and helps track registrations
        </Text>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={styles.headerTitle}>Event Overview</Text>
      </View>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Bottom Tab Bar */}
      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />

      {/* Modals */}
      <AssignAndStartCycleModal
        visible={assignModalVisible}
        userName={selectedUser?.name || ''}
        onClose={() => {
          setAssignModalVisible(false);
          setSelectedUser(null);
        }}
        onSubmit={handleAssignSubmit}
        isLoading={isActionLoading}
      />

      <RemoveConfirmationModal
        visible={removeModalVisible}
        userName={selectedUser?.name || ''}
        onClose={() => {
          setRemoveModalVisible(false);
          setSelectedUser(null);
        }}
        onConfirm={handleRemoveConfirm}
        isLoading={isActionLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    position: 'relative',
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  tabContent: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
  },
  tabContentInner: {
    padding: Spacing.xl,
  },
  eventCard: {
    backgroundColor: Colors.primary,
    borderRadius: ComponentSize.cardRadius,
    padding: Spacing.xl,
    marginBottom: Spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventName: {
    ...Typography.h1,
    fontSize: 26,
    color: Colors.background,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    fontWeight: '700',
  },
  eventDate: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.background,
    textAlign: 'center',
    opacity: 0.9,
  },
  statsContainer: {
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  statsRowCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: ComponentSize.cardRadius,
  },
  statCardCentered: {
    width: '48%',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: ComponentSize.cardRadius,
  },
  statIcon: {
    fontSize: 24,
  },
  logoutContainer: {
    marginTop: Spacing.xxl,
    paddingTop: Spacing.lg,
  },
  queueContainer: {
    flex: 1,
    padding: Spacing.lg,
  },
  queueList: {
    flex: 1,
  },
  queueListContent: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  qrContent: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  qrHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  qrTitle: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  qrSubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  qrCodeContainer: {
    marginBottom: Spacing.xl,
  },
  qrCodeWrapper: {
    backgroundColor: 'white',
    padding: Spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrCodePlaceholder: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: ComponentSize.cardRadius,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
  },
  qrCodePlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.text.disabled,
    marginBottom: Spacing.sm,
  },
  qrCodeValue: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },
  instructionsContainer: {
    width: '100%',
    backgroundColor: Colors.surfaceLight,
    borderRadius: ComponentSize.cardRadius,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  instructionsTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  instructionsText: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  footerNote: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: ComponentSize.buttonHeight,
    borderRadius: ComponentSize.buttonRadius,
    paddingHorizontal: Spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  errorText: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
});
