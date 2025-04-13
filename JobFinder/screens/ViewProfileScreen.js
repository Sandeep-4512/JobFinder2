import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function ViewProfileScreen({ navigation, route }) {
  const user = route.params?.user;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>My Profile 👤</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.name}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>

        <Text style={styles.label}>Contact</Text>
        <Text style={styles.value}>{user?.contact || 'Not added'}</Text>

        <Text style={styles.label}>Date of Birth</Text>
        <Text style={styles.value}>
          {user?.dob ? new Date(user.dob).toDateString() : 'Not added'}
        </Text>

        <Text style={styles.label}>Experience</Text>
        <Text style={styles.value}>{user?.experience || 'Not added'}</Text>

        <Text style={styles.label}>Skills</Text>
        {user?.skills?.length ? (
          <View style={styles.chipList}>
            {user.skills.map((skill, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{skill}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.value}>No skills added</Text>
        )}

        <Text style={styles.label}>Education</Text>
        {user?.education?.length ? (
          user.education.map((edu, index) => (
            <View key={index} style={styles.eduBlock}>
              <Text style={styles.value}>
                {edu.level} - {edu.instituteName}
              </Text>
              <Text style={styles.value}>
                {edu.courseDuration} ({edu.percentage})
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.value}>No education added</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('EditProfile', { user })}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#eef6fc',
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
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
    elevation: 3,
  },
  label: {
    fontWeight: '600',
    color: '#555',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#222',
  },
  button: {
    backgroundColor: '#007acc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  chipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  chip: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
    marginTop: 5,
  },
  chipText: {
    color: '#0369a1',
    fontWeight: '500',
  },
  eduBlock: {
    marginTop: 8,
  },
});
