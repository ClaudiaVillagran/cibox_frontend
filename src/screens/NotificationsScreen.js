import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../services/notificationService';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getNotifications({
        unreadOnly: activeFilter === 'unread',
        limit: 50,
      });

      setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
      setUnreadCount(data?.unread_count ?? 0);
    } catch (error) {
      console.log('GET NOTIFICATIONS ERROR:', error?.response?.data || error.message);
      Alert.alert('Error', 'No se pudieron cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  const handleMarkOne = async (notificationId, isRead) => {
    if (isRead) return;

    try {
      await markNotificationAsRead(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.log('MARK NOTIFICATION ERROR:', error?.response?.data || error.message);
      Alert.alert('Error', 'No se pudo marcar la notificación');
    }
  };

  const handleMarkAll = async () => {
    try {
      setMarkingAll(true);
      await markAllNotificationsAsRead();
      await fetchNotifications();
    } catch (error) {
      console.log('MARK ALL NOTIFICATIONS ERROR:', error?.response?.data || error.message);
      Alert.alert('Error', 'No se pudieron marcar todas');
    } finally {
      setMarkingAll(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const renderNotification = ({ item }) => {
    const title = item?.title || item?.type || 'Notificación';
    const message = item?.message || 'Sin detalle';
    const isRead = item?.is_read;
    const createdAt = item?.created_at
      ? new Date(item.created_at).toLocaleString()
      : '';

    return (
      <Pressable
        onPress={() => handleMarkOne(item._id, isRead)}
        style={{
          borderWidth: 1,
          borderColor: isRead ? '#e8e8e8' : '#d6d6d6',
          backgroundColor: isRead ? '#fff' : '#f8f8f8',
          borderRadius: 14,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 6,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 12 }}>
            {title}
          </Text>

          {!isRead ? (
            <View
              style={{
                backgroundColor: '#111',
                borderRadius: 999,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                Nueva
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={{ color: '#444', marginBottom: 8 }}>
          {message}
        </Text>

        <Text style={{ color: '#777', fontSize: 12 }}>
          {createdAt}
        </Text>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderNotification}
        contentContainerStyle={{
          padding: 16,
          width: '100%',
          maxWidth: 900,
          alignSelf: 'center',
          paddingBottom: 32,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
              Notificaciones
            </Text>

            <Text style={{ color: '#666', marginBottom: 16 }}>
              No leídas: {unreadCount}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 14,
              }}
            >
              <Pressable
                onPress={() => setActiveFilter('all')}
                style={{
                  backgroundColor: activeFilter === 'all' ? '#111' : '#fff',
                  borderWidth: 1,
                  borderColor: '#111',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 10,
                  marginRight: 10,
                }}
              >
                <Text
                  style={{
                    color: activeFilter === 'all' ? '#fff' : '#111',
                    fontWeight: 'bold',
                  }}
                >
                  Todas
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setActiveFilter('unread')}
                style={{
                  backgroundColor: activeFilter === 'unread' ? '#111' : '#fff',
                  borderWidth: 1,
                  borderColor: '#111',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    color: activeFilter === 'unread' ? '#fff' : '#111',
                    fontWeight: 'bold',
                  }}
                >
                  No leídas
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={handleMarkAll}
              disabled={markingAll || unreadCount === 0}
              style={{
                backgroundColor:
                  markingAll || unreadCount === 0 ? '#999' : '#111',
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                {markingAll ? 'Marcando...' : 'Marcar todas como leídas'}
              </Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View
            style={{
              paddingVertical: 40,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
              No hay notificaciones
            </Text>
            <Text style={{ color: '#666', textAlign: 'center' }}>
              Cuando ocurran eventos importantes, aparecerán aquí.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}