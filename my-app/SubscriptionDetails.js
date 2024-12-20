import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform } from 'react-native';
import db from './database.js'; // Assurez-vous que ce chemin est correct
import { Ionicons } from '@expo/vector-icons';

const SubscriptionDetails = ({ route, navigation }) => {
  const { subscription } = route.params; // Données de l'abonnement sélectionné

  const deleteSubscription = async () => {
    try {
      const dbInstance = await db;
      // Supprime l'abonnement de la base de données
      await dbInstance.execAsync(`DELETE FROM subscriptions WHERE id = ${subscription.id}`);
      Alert.alert("Success", "Subscription deleted !");
      navigation.navigate('SubscriptionScreen'); // Retourne à l'écran des abonnements
    } catch (error) {
      console.error('Error when deleting subscription :', error);
      Alert.alert("Error", "Subscription deletion failed.");
    }
  };

  return (
    <View style={[styles.container, Platform.OS === 'ios' && { paddingTop: 50 }]}>
      <Text style={styles.title}>{subscription.name}</Text>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Ionicons name="albums-outline" size={20} color="#4fd1c5" />
          <Text style={styles.detail}>Category: {subscription.category}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={20} color="#4fd1c5" />
          <Text style={styles.detail}>Cost: {subscription.cost} €</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={20} color="#4fd1c5" />
          <Text style={styles.detail}>Date: {subscription.subscriptionDate}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={deleteSubscription}>
        <Ionicons name="trash-outline" size={24} color="#fff" />
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 28,
    color: '#4fd1c5',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailsContainer: {
    backgroundColor: '#1c1c1e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detail: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#ff4d4d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default SubscriptionDetails;
