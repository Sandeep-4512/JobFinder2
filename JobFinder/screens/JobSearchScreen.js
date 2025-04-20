// JobSearchScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Button } from 'react-native';
import API from '../api';

export default function JobSearchScreen({ navigation }) {
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [results, setResults] = useState([]);
  const [allJobs, setAllJobs] = useState([]);

  // Fetch all jobs initially to display when no filters are applied
  const fetchAllJobs = async () => {
    try {
      const res = await API.get('/jobs');
      setAllJobs(res.data);
      setResults(res.data); // Display all jobs initially
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  // Apply filters based on input fields
  const handleFilter = () => {
    // If no filter is entered, show all jobs
    if (!company && !location && !skills) {
      setResults(allJobs);
      return;
    }

    // Filter jobs based on entered details
    const filtered = allJobs.filter(job => {
      const skillMatch = skills ? job.skills?.join(',').toLowerCase().includes(skills.toLowerCase()) : true;
      const companyMatch = company ? job.company.toLowerCase().includes(company.toLowerCase()) : true;
      const locationMatch = location ? job.location.toLowerCase().includes(location.toLowerCase()) : true;
      return skillMatch && companyMatch && locationMatch;
    });

    setResults(filtered);
  };

  // Reset search fields and display all jobs again
  const resetFilters = () => {
    setCompany('');
    setLocation('');
    setSkills('');
    setResults(allJobs); // Show all jobs after reset
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.jobItem}
      onPress={() => navigation.navigate('JobDetail', { jobId: item._id })} // Navigate to the original JobDetailScreen with jobId as parameter
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.sub}>{item.company} — {item.location}</Text>
      <Text style={styles.skillText}>Skills: {item.skills?.join(', ') || 'N/A'}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    fetchAllJobs(); // Fetch all jobs when the screen is loaded
  }, []);

  useEffect(() => {
    handleFilter(); // Apply filter whenever the search fields change
  }, [company, location, skills]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Search Jobs</Text>

      <TextInput
        placeholder="Company"
        style={styles.input}
        value={company}
        onChangeText={setCompany}
      />
      <TextInput
        placeholder="Location"
        style={styles.input}
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        placeholder="Skills (comma-separated)"
        style={styles.input}
        value={skills}
        onChangeText={setSkills}
      />

      {/* Reset Button */}
      <Button title="Reset Search" onPress={resetFilters} />

      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ marginTop: 20, textAlign: 'center' }}>No jobs found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9fafb',
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1e3a8a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  jobItem: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginTop: 12,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  sub: {
    color: '#6b7280',
    fontSize: 13,
  },
  skillText: {
    marginTop: 6,
    fontSize: 12,
    color: '#334155',
  },
});
