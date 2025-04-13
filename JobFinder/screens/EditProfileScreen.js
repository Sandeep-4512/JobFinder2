import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { TextInput as PaperInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import API from '../api';

export default function EditProfileScreen({ navigation, route }) {
  const user = route.params?.user;

  const [contact, setContact] = useState(user?.contact || '');
  const [dob, setDob] = useState(user?.dob ? new Date(user.dob) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [experience, setExperience] = useState(user?.experience || '');
  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [education, setEducation] = useState(
    user?.education?.length
      ? user.education
      : [
          {
            level: '',
            instituteName: '',
            courseDuration: '',
            percentage: '',
          },
        ]
  );

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    const updated = [...skills];
    updated.splice(index, 1);
    setSkills(updated);
  };

  const handleAddEducation = () => {
    setEducation([
      ...education,
      {
        level: '',
        instituteName: '',
        courseDuration: '',
        percentage: '',
      },
    ]);
  };

  const handleEducationChange = (index, key, value) => {
    const updated = [...education];
    updated[index][key] = value;
    setEducation(updated);
  };

  const handleSave = async () => {
    try {
      await API.put('/auth/update-profile', {
        contact,
        dob,
        experience,
        education,
        skills,
      });
      alert('Profile updated!');
      navigation.navigate('ViewProfile', {
        user: {
          ...user,
          contact,
          dob,
          experience,
          education,
          skills,
        },
      });
    } catch (error) {
      console.error('Save profile error:', error.response?.data || error);
      alert('Failed to save profile');
    }
  };

  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 20);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.header}>Edit Profile</Text>

          <Text style={styles.label}>Contact</Text>
          <PaperInput
            label="Contact"
            value={contact}
            onChangeText={setContact}
            mode="outlined"
            style={styles.input}
          />

          <Text style={styles.label}>Date of Birth</Text>
          <View style={styles.dobContainer}>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[styles.input, styles.dobBox]}
            >
              <Text style={{ color: '#111' }}>{dob.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dob}
                mode="date"
                display="default"
                maximumDate={maxDob}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDob(selectedDate);
                }}
              />
            )}
          </View>

          <Text style={styles.label}>Experience</Text>
          <PaperInput
            label="Experience"
            value={experience}
            onChangeText={setExperience}
            mode="outlined"
            style={styles.input}
          />

          <Text style={styles.sectionTitle}>Education</Text>
          {education.map((edu, idx) => (
            <View key={idx} style={styles.eduBlock}>
              <Text style={styles.label}>Level</Text>
              <PaperInput
                label="Level"
                value={edu.level}
                onChangeText={(text) => handleEducationChange(idx, 'level', text)}
                mode="outlined"
                style={styles.input}
              />
              <Text style={styles.label}>Institute Name</Text>
              <PaperInput
                label="Institute Name"
                value={edu.instituteName}
                onChangeText={(text) => handleEducationChange(idx, 'instituteName', text)}
                mode="outlined"
                style={styles.input}
              />
              <Text style={styles.label}>Course Duration</Text>
              <PaperInput
                label="Course Duration"
                value={edu.courseDuration}
                onChangeText={(text) => handleEducationChange(idx, 'courseDuration', text)}
                mode="outlined"
                style={styles.input}
              />
              <Text style={styles.label}>Percentage</Text>
              <PaperInput
                label="Percentage"
                value={edu.percentage}
                onChangeText={(text) => handleEducationChange(idx, 'percentage', text)}
                mode="outlined"
                style={styles.input}
              />
            </View>
          ))}

          <TouchableOpacity onPress={handleAddEducation} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Education</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Enter Skill</Text>
            <PaperInput
              label="Enter Skill"
              value={newSkill}
              onChangeText={setNewSkill}
              mode="outlined"
              style={[styles.input, { flex: 1 }]}
            />
            <TouchableOpacity onPress={handleAddSkill} style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.skillsList}>
            {skills.map((skill, index) => (
              <View key={index} style={styles.skillItem}>
                <Text style={styles.skillText}>{skill}</Text>
                <TouchableOpacity onPress={() => handleRemoveSkill(index)}>
                  <Text style={styles.removeSkill}>❌</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ViewProfile', { user })}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef6fc' },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#007acc',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: { marginBottom: 10 },
  dobContainer: {
    marginBottom: 10,
  },
  dobBox: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
    color: '#333',
  },
  eduBlock: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  addButton: {
    backgroundColor: '#007acc',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  addButtonText: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center' },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  skillItem: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillText: { color: '#0369a1', marginRight: 5 },
  removeSkill: { color: '#dc2626', fontSize: 14 },
  saveButton: {
    backgroundColor: '#007acc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#888',
    fontWeight: '600',
  },
});