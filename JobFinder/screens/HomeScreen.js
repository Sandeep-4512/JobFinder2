import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import API from '../api';
import { useIsFocused } from '@react-navigation/native';

export default function HomeScreen({ route, navigation }) {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('available');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();

  const user = route.params?.user;

  useEffect(() => {
    if (isFocused) {
      fetchJobsAndApplications();
      fetchNotifications();
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  const fetchJobsAndApplications = async () => {
    try {
      setRefreshing(true);
      const jobsRes = await API.get('/jobs');
      setJobs(jobsRes.data);

      if (user?.role === 'job-seeker') {
        const appsRes = await API.get('/applications/my-applications');
        setApplications(appsRes.data);
      }
    } catch (error) {
      console.error('Job fetch error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Notification fetch error:', error);
    }
  };

  const renderJob = ({ item }) => {
    const application = applications.find((app) => app.job._id === item._id);
    const isApplied = !!application;
    const status = application?.status;

    return (
      <Animated.View style={[styles.jobItem, { opacity: fadeAnim }]}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.jobCompany}>{item.company}</Text>
        <Text style={styles.meta}>
          {item.location} • {item.applicants?.length || 0} applicant(s)
        </Text>

        {user?.role === 'job-seeker' && isApplied && (
          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.statusBadge,
                status === 'approved'
                  ? styles.approved
                  : status === 'rejected'
                  ? styles.rejected
                  : styles.pending,
              ]}
            >
              Status: {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() =>
            navigation.navigate('JobDetail', {
              jobId: item._id,
              user,
            })
          }
        >
          <Text style={styles.buttonText}>View Details</Text>
        </Pressable>
      </Animated.View>
    );
  };

  const availableJobs = jobs.filter(
    (job) => !applications.some((app) => app.job._id === job._id)
  );

  const appliedJobs = jobs.filter((job) =>
    applications.some((app) => app.job._id === job._id)
  );

  const recruiterJobs = jobs.filter((job) => job.postedBy?._id === user?._id);

  const unreadNotifications = notifications.filter((notif) => !notif.isRead).length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Hello, {user?.name} 👋</Text>

        <View style={styles.iconRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications', { user })}
            style={styles.notificationWrapper}
          >
            <Icon name="notifications-outline" size={26} color="#1e3a8a" style={styles.icon} />
            {unreadNotifications > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>

          {user?.role === 'recruiter' && (
            <TouchableOpacity
              onPress={() => navigation.navigate('PostJob', { user })}
            >
              <Icon name="add-circle" size={28} color="#4f46e5" style={styles.icon} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => navigation.navigate('Profile', { user })}
          >
            <Icon name="person-circle" size={30} color="#1e3a8a" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* === Recruiter View === */}
      {user?.role === 'recruiter' && (
        <>
          <Text style={styles.subtitle}>Your Posted Jobs</Text>
          <FlatList
            data={recruiterJobs}
            renderItem={renderJob}
            keyExtractor={(item) => item._id}
            refreshing={refreshing}
            onRefresh={fetchJobsAndApplications}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>You haven’t posted any jobs yet.</Text>
            }
          />
        </>
      )}

      {/* === Job Seeker View === */}
      {user?.role === 'job-seeker' && (
        <>
          <View style={styles.tabBar}>
            {['available', 'applied'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  selectedTab === tab && styles.activeTab,
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab === 'available' ? 'Available Jobs' : 'Applied Jobs'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={selectedTab === 'available' ? availableJobs : appliedJobs}
            renderItem={renderJob}
            keyExtractor={(item) => item._id}
            refreshing={refreshing}
            onRefresh={fetchJobsAndApplications}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {selectedTab === 'available'
                  ? 'No jobs available to apply.'
                  : 'You have not applied for any jobs yet.'}
              </Text>
            }
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f4f8',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notificationWrapper: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  icon: {
    marginLeft: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
    color: '#1e40af',
  },
  jobItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  statusContainer: {
    marginVertical: 6,
    padding: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    textAlign: 'center',
  },
  approved: {
    backgroundColor: '#22c55e',
  },
  rejected: {
    backgroundColor: '#ef4444',
  },
  pending: {
    backgroundColor: '#f59e0b',
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 20,
    fontSize: 14,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 10,
  },
  tab: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#4f46e5',
  },
  tabText: {
    color: '#1e3a8a',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
  },
});