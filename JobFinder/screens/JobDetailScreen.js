import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
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
  const [portfolioLink, setPortfolioLink] = useState('');

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
      console.error('❌ Error fetching job detail:', error);
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  const isOwnJob = user?.role === 'recruiter' && job?.postedBy?._id === user._id;

  const handlePortfolioCheck = async () => {
    if (!portfolioLink) {
      Alert.alert(
        'No Portfolio Added',
        'You haven’t added a portfolio link. Do you want to apply anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Apply Anyway', onPress: () => applyNow() },
        ]
      );
    } else {
      applyNow();
    }
  };

  const handleApply = () => {
    const isProfileIncomplete =
      !user?.name ||
      !user?.email ||
      !user?.resume ||
      !user?.education ||
      user?.education.trim().length === 0 ||
      !user?.skills ||
      !Array.isArray(user.skills) ||
      user.skills.length === 0;

    if (isProfileIncomplete) {
      Alert.alert(
        '⚠ Incomplete Profile',
        'Your profile is missing required details (name, email, resume, education, or skills). Do you want to proceed anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Proceed Anyway', onPress: handlePortfolioCheck },
        ]
      );
    } else {
      handlePortfolioCheck();
    }
  };

  const applyNow = async () => {
    try {
      const payload = { jobId, portfolioLink };
      await API.post(`/applications/apply`, payload);
      Alert.alert('✅ Application Submitted!');
      navigation.goBack();
    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Could not apply to this job. Please try again.'
      );
    }
  };

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

        <Text style={styles.label}>Skills:</Text>
        {job.skills?.length > 0 ? (
          job.skills.map((skill, index) => (
            <Text key={index} style={styles.skillText}>
              {skill}
            </Text>
          ))
        ) : (
          <Text style={styles.text}>No skills required</Text>
        )}

        <Text style={styles.label}>Requirements:</Text>
        {job.requirements?.length > 0 ? (
          job.requirements.map((req, index) => (
            <Text key={index} style={styles.text}>
              {req}
            </Text>
          ))
        ) : (
          <Text style={styles.text}>No specific requirements listed</Text>
        )}
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
            <>
              <TextInput
                style={styles.portfolioInput}
                placeholder="Enter Portfolio URL (optional)"
                value={portfolioLink}
                onChangeText={setPortfolioLink}
              />
              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.applyButtonText}>Apply Now</Text>
              </TouchableOpacity>
            </>
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
                          : applications.filter((a) => a.status === status)).length
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
                    {app.portfolioLink ? (
                      <Text style={styles.portfolioLink}>
                        <Text style={{ fontWeight: 'bold' }}>Portfolio:</Text> {app.portfolioLink}
                      </Text>
                    ) : (
                      <Text>No portfolio link available</Text>
                    )}
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() =>
                        navigation.navigate('ApplicantDetail', { application: app })
                      }
                    >
                      <Text style={styles.viewButtonText}>View Application</Text>
                    </TouchableOpacity>
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
  skillText: {
    color: '#334155',
    fontSize: 14,
    marginBottom: 4,
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
  portfolioInput: {
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    width: '100%',
  },
  appliedBox: {
    backgroundColor: '#dbeafe',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  statusLabel: {
    fontWeight: 'bold',
  },
  statusValue: {
    marginTop: 6,
  },
  approved: {
    color: 'green',
  },
  rejected: {
    color: 'red',
  },
  pending: {
    color: '#ffba08',
  },
  recruiterSection: {
    marginTop: 20,
  },
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginVertical: 16,
  },
  filterButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 4,
  },
  activeFilterButton: {
    backgroundColor: '#4f46e5',
  },
  filterText: {
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fff',
  },
  applicantCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  applicantName: {
    fontWeight: '600',
    fontSize: 16,
  },
  portfolioLink: {
    marginTop: 10,
    fontSize: 14,
    color: '#4f46e5',
  },
  restrictedBox: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  restrictedText: {
    color: '#9b2c2c',
  },
  noApplicants: {
    textAlign: 'center',
    color: '#475569',
  },
  viewButton: {
    marginTop: 10,
    backgroundColor: '#4f46e5',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
