import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Button,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import API from '../api';

export default function JobDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { jobId, user } = route.params;

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('pending');
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

  useEffect(() => {
    if (isFocused) fetchJobAndApplications();
  }, [isFocused]);

  const fetchJobAndApplications = async () => {
    try {
      const jobRes = await API.get(`/jobs/${jobId}`);
      setJob(jobRes.data);

      if (user?.role === 'job-seeker') {
        const appsRes = await API.get(`/applications/my-applications`);
        const applied = appsRes.data.find(app => app.job._id === jobId);
        if (applied) {
          setIsAlreadyApplied(true);
          setApplicationStatus(applied.status);
        }
      }

      if (user?.role === 'recruiter') {
        const appRes = await API.get(`/applications/job/${jobId}`);
        setApplications(appRes.data);
      }
    } catch (error) {
      console.error('❌ Error fetching job detail:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      console.log('📤 Applying to job:', { jobId });
      const payload = { jobId };
      const response = await API.post(`/applications/apply`, payload);
      console.log('✅ Application response:', response.data);
      Alert.alert('✅ Application Submitted!');
      navigation.goBack();
    } catch (err) {
      console.error('❌ Apply error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
        request: {
          url: err.request?.responseURL,
          method: err.request?.method,
          data: err.request?._data,
        },
      });
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Could not apply to this job. Please try again.'
      );
    }
  };

  const isOwnJob = user?.role === 'recruiter' && job?.postedBy?._id === user._id;

  const filteredApps =
    selectedFilter === 'all'
      ? applications
      : applications.filter((a) => a.status === selectedFilter);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>❗ Failed to load job details.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.company}>{job.company}</Text>
        <Text style={styles.meta}>
          {job.location} • {job.applicants?.length || 0} applicant(s)
        </Text>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.label}>Description:</Text>
        <Text style={styles.text}>{job.description}</Text>

        <Text style={styles.label}>Posted By:</Text>
        <Text style={styles.text}>{job.postedBy?.name || 'N/A'}</Text>
      </View>

      {user?.role === 'job-seeker' && (
        <View style={styles.jobSeekerSection}>
          {isAlreadyApplied ? (
            <View style={styles.appliedBox}>
              <Text style={styles.statusLabel}>✅ You’ve already applied to this job.</Text>
              <Text
                style={[
                  styles.statusValue,
                  applicationStatus === 'approved'
                    ? styles.approved
                    : applicationStatus === 'rejected'
                    ? styles.rejected
                    : styles.pending,
                ]}
              >
                Status: {applicationStatus.charAt(0).toUpperCase() + applicationStatus.slice(1)}
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Now</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {user?.role === 'recruiter' && (
        <>
          {!isOwnJob ? (
            <View style={styles.restrictedBox}>
              <Text style={styles.restrictedText}>
                🚫 You are not authorized to manage this job.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.filterBar}>
                {['all', 'pending', 'approved', 'rejected'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterButton,
                      selectedFilter === status && styles.activeFilterButton,
                    ]}
                    onPress={() => setSelectedFilter(status)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selectedFilter === status && styles.activeFilterText,
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)} (
                      {
                        (status === 'all'
                          ? applications
                          : applications.filter((a) => a.status === status)
                        ).length
                      })
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {filteredApps.length === 0 ? (
                <Text style={styles.noApplicants}>No applications yet.</Text>
              ) : (
                filteredApps.map((app) => (
                  <View key={app._id} style={styles.applicantCard}>
                    <Text style={styles.applicantName}>{app.applicant.name}</Text>
                    <Text>{app.applicant.email}</Text>
                    <Button
                      title="View Application"
                      onPress={() =>
                        navigation.navigate('ApplicantDetail', {
                          application: app,
                        })
                      }
                    />
                  </View>
                ))
              )}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f9ff',
    padding: 16,
  },
  header: {
    backgroundColor: '#e0edff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e40af',
  },
  company: {
    fontSize: 16,
    color: '#475569',
  },
  meta: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  detailCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#111827',
  },
  text: {
    color: '#334155',
    marginBottom: 12,
  },
  jobSeekerSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  applyButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  appliedBox: {
    backgroundColor: '#dbeafe',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    marginTop: 4,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  approved: {
    color: 'green',
  },
  rejected: {
    color: 'red',
  },
  pending: {
    color: '#f59e0b',
  },
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    marginBottom: 8,
  },
  activeFilterButton: {
    backgroundColor: '#4f46e5',
  },
  filterText: {
    fontSize: 14,
    color: '#1e40af',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  applicantCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  noApplicants: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#6b7280',
    marginTop: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restrictedBox: {
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  restrictedText: {
    color: '#991b1b',
    textAlign: 'center',
    fontWeight: '600',
  },
});