import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import API from '../api';
import { useIsFocused } from '@react-navigation/native';

export default function NotificationScreen({ route }) {
  const { user } = route.params;
  const isFocused = useIsFocused();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isFocused) fetchNotifications();
  }, [isFocused]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.log('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.patch('/notifications/mark-all-read');
      fetchNotifications();
    } catch (err) {
      console.log('Error marking as read:', err);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.notification,
        !item.isRead && styles.unreadNotification,
      ]}
    >
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.meta}>
        {new Date(item.createdAt).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Notifications {notifications.length > 0 ? `(${notifications.length})` : ''}
      </Text>

      <TouchableOpacity style={styles.markReadBtn} onPress={markAllAsRead}>
        <Text style={styles.markReadText}>Mark all as read</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#4f46e5" />
      ) : notifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications yet.</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchNotifications} />
          }
          contentContainerStyle={{ paddingBottom: 60 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 16,
  },
  notification: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  unreadNotification: {
    borderLeftWidth: 5,
    borderLeftColor: '#4f46e5',
  },
  message: {
    fontSize: 16,
    color: '#111827',
  },
  meta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 40,
  },
  markReadBtn: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  markReadText: {
    color: '#1e40af',
    fontWeight: '600',
  },
});
