import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import API from '../api';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function PostJobScreen() {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [requirements, setRequirements] = useState('');

  const navigation = useNavigation();
  const route = useRoute();
  const user = route.params?.user;

  const handlePost = async () => {
    if (!title || !company || !location || !description) {
      return Alert.alert('Please fill all required fields');
    }

    if (!user || !user._id) {
      return Alert.alert('User information missing. Please re-login.');
    }

    try {
      console.log('🔍 Posting user:', user); // Confirm user presence

      const res = await API.post('/jobs', {
        title,
        company,
        location,
        description,
        skills: skills.split(',').map((s) => s.trim()),
        requirements: requirements.split(',').map((r) => r.trim()),
        postedBy: user._id,
      });

      Alert.alert('✅ Success', 'Job posted!');
      navigation.goBack();
    } catch (err) {
      console.error('❌ Job post error:', err.message);
      Alert.alert('Error', 'Could not post job');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Post a New Job</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Job Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Full Stack Developer"
          />

          <Text style={styles.label}>Company *</Text>
          <TextInput
            style={styles.input}
            value={company}
            onChangeText={setCompany}
            placeholder="e.g. ABC Corp"
          />

          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. New York"
          />

          <Text style={styles.label}>Job Description *</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Write job details..."
            multiline
          />

          <Text style={styles.label}>Skills (comma separated)</Text>
          <TextInput
            style={styles.input}
            value={skills}
            onChangeText={setSkills}
            placeholder="e.g. React, Node.js, MongoDB"
          />

          <Text style={styles.label}>Requirements (comma separated)</Text>
          <TextInput
            style={styles.input}
            value={requirements}
            onChangeText={setRequirements}
            placeholder="e.g. 2+ years experience, Bachelor's degree"
          />

          <TouchableOpacity style={styles.button} onPress={handlePost}>
            <Text style={styles.buttonText}>Post Job</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1e3a8a',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
    backgroundColor: '#fff',
    color: '#111827',
  },
  button: {
    backgroundColor: '#4f46e5',
    padding: 14,
    borderRadius: 10,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
