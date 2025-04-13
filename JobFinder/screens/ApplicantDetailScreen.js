import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import API from '../api';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ApplicantDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { application } = route.params;
  const applicant = application.applicant;

  const handleStatusUpdate = async (status) => {
    try {
      await API.patch(`/applications/${application._id}/status`, { status });
      Alert.alert('Success', `Application ${status}`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Applicant Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{applicant.name}</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{applicant.email}</Text>

        <Text style={styles.label}>Contact:</Text>
        <Text style={styles.value}>{applicant.contact || 'N/A'}</Text>

        <Text style={styles.label}>Experience:</Text>
        <Text style={styles.value}>{applicant.experience || 'N/A'}</Text>

        <Text style={styles.label}>Skills:</Text>
        <Text style={styles.value}>
          {Array.isArray(applicant.skills) ? applicant.skills.join(', ') : 'N/A'}
        </Text>

        <Text style={styles.label}>Education:</Text>
        {Array.isArray(applicant.education) && applicant.education.length ? (
          applicant.education.map((edu, index) => (
            <View key={index} style={styles.eduBlock}>
              <Text>{edu.level} - {edu.instituteName}</Text>
              <Text>{edu.courseDuration} ({edu.percentage}%)</Text>
            </View>
          ))
        ) : (
          <Text style={styles.value}>No education info</Text>
        )}

        <Text style={styles.label}>Current Status:</Text>
        <Text
          style={[
            styles.statusText,
            application.status === 'approved'
              ? styles.approved
              : application.status === 'rejected'
              ? styles.rejected
              : styles.pending,
          ]}
        >
          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
        </Text>
      </View>

      {application.status === 'pending' && (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: '#16a34a' }]}
            onPress={() => handleStatusUpdate('approved')}
          >
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: '#dc2626' }]}
            onPress={() => handleStatusUpdate('rejected')}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#eef6fc',
    padding: 20,
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#007acc',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  label: {
    fontWeight: '600',
    marginTop: 10,
    color: '#444',
  },
  value: {
    fontSize: 16,
    color: '#222',
  },
  eduBlock: {
    marginTop: 6,
    marginLeft: 10,
  },
  statusText: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: 'bold',
  },
  approved: {
    color: 'green',
  },
  rejected: {
    color: 'red',
  },
  pending: {
    color: '#888',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  statusButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
