import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons'; 
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import SubscriptionScreen from './SubscriptionScreen';
import CalendarScreen from './CalendarScreen';
import TodayCalendar from './TodayCalendar';
import SubscriptionDetails from './SubscriptionDetails';
import CategorySubscriptions from './CategorySubscriptions';
import AddSubscriptionForm from './AddSubscriptionForm';
import Statistics from './Statistics';

const Stack = createStackNavigator();

// Définit le comportement global des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function HomeScreen({ navigation }) {
  const [expoPushToken, setExpoPushToken] = useState(''); // Stocke le token Expo pour les notifications
  const responseListener = useRef(); // Gère les réponses aux notifications

  useEffect(() => {
    // Enregistre l'appareil pour les notifications et configure un rappel quotidien
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token))
      .catch((err) => console.log(err));

    scheduleDailyNotification();

    // Ajoute un listener pour réagir aux notifications reçues
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      navigation.navigate('TodayCalendar'); // Redirige vers la page TodayCalendar
    });

    return () => {
      // Supprime le listener lors du démontage
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === 'android') {
      // Configure un canal de notification pour Android
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      // Vérifie et demande les permissions pour les notifications
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Failed to get push token for push notification!');
        return;
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: 'b9122d43-dbbc-48af-8382-e4c94c42b6ad',
        })
      ).data;
      console.log('Expo Push Token:', token);
    } else {
      Alert.alert('Must use physical device for Push Notifications');
    }

    return token;
  };

  const scheduleDailyNotification = async () => {
    // Planifie une notification locale quotidienne
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Rappel quotidien",
        body: "N'oubliez pas de vérifier vos abonnements !",
        sound: 'default',
      },
      trigger: {
        hour: 12,
        minute: 0o5,
        repeats: true, // Répétition quotidienne
      },
    });
    console.log("Notification quotidienne programmée pour midi");
  };

  return (
    <View style={[styles.container, Platform.OS === 'ios' && { paddingTop: 50 }]}>
      <Text style={styles.appName}>SubTrack</Text>

      <View style={styles.gridContainer}>
        <TouchableOpacity
          style={[styles.tile, styles.tile1]}
          onPress={() => navigation.navigate('SubscriptionScreen')}
        >
          <Ionicons name="list" size={32} color="#fff" />
          <Text style={styles.tileText}>My Subscriptions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tile, styles.tile2]}
          onPress={() => navigation.navigate('CalendarScreen')}
        >
          <Ionicons name="calendar" size={32} color="#fff" />
          <Text style={styles.tileText}>Calendar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('TodayCalendar')}
      >
        <Ionicons name="today" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SubscriptionScreen"
          component={SubscriptionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CalendarScreen"
          component={CalendarScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TodayCalendar"
          component={TodayCalendar}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SubscriptionDetails"
          component={SubscriptionDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CategorySubscriptions"
          component={CategorySubscriptions}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddSubscriptionForm"
          component={AddSubscriptionForm}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Statistics" 
        component={Statistics}
        options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4fd1c5',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20,
  },
  tile: {
    flex: 1,
    height: 150,
    margin: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  tile1: {
    backgroundColor: '#4a90e2',
  },
  tile2: {
    backgroundColor: '#7ed321',
  },
  tileText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#e74c3c',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});
