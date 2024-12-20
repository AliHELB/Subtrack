import React, { useEffect, useState } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet, FlatList, Platform } from 'react-native';
import db from './database';
import { Ionicons } from '@expo/vector-icons';

const TodayCalendar = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState({});
  const todayDate = new Date().toISOString().split('T')[0];

  // Fonction pour convertir une date ISO au format JJ/MM/AAAA
  const formatDate = (isoDate) => {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    fetchSubscriptions(); // Charge les abonnements disponibles au chargement du composant
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const dbInstance = await db;

      // Récupère tous les abonnements
      const subscriptionsResult = await dbInstance.getAllAsync('SELECT id, name, color FROM subscriptions');

      // Récupère les abonnements déjà utilisés pour aujourd'hui
      const usedSubscriptionsResult = await dbInstance.getAllAsync(
        `SELECT subscription_name FROM subscription_usage WHERE usage_date = '${todayDate}'`
      );

      // Filtre les abonnements non encore utilisés
      const usedSubscriptionsSet = new Set(usedSubscriptionsResult.map(sub => sub.subscription_name));
      const availableSubscriptions = subscriptionsResult.filter(sub => !usedSubscriptionsSet.has(sub.name));

      setSubscriptions(availableSubscriptions);
    } catch (error) {
      console.error("Erreur lors de la récupération des abonnements :", error);
    }
  };

  const toggleSubscriptionSelection = (id) => {
    // Ajoute ou retire un abonnement de la sélection (chatgpt)
    setSelectedSubscriptions(prevState => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const handleAddUsage = async () => {
    const selectedIds = Object.keys(selectedSubscriptions).filter(id => selectedSubscriptions[id]);

    if (selectedIds.length === 0) {
      Alert.alert('Error', 'Please select at least one subscription.');
      return;
    }

    try {
      const dbTable = await db;

      // Ajoute chaque abonnement sélectionné à la table `subscription_usage`
      await Promise.all(selectedIds.map(async (id) => {
        const subscription = subscriptions.find(sub => sub.id.toString() === id);

        const insertQuery = `INSERT INTO subscription_usage (subscription_name, usage_date, color) 
                             VALUES ('${subscription.name}', '${todayDate}', '${subscription.color}')`;
        await dbTable.execAsync(insertQuery);
      }));

      Alert.alert("Success", "Uses successfully added !");
      fetchSubscriptions(); // Rafraîchit la liste des abonnements après insertion
    } catch (error) {
      console.error("Erreur lors de l'ajout des données :", error);
      Alert.alert('Erreur', 'Erreur lors de l\'ajout des données.');
    }
  };

  const renderSubscriptionItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.subscriptionContainer,
        selectedSubscriptions[item.id] && { backgroundColor: item.color },
      ]}
      onPress={() => toggleSubscriptionSelection(item.id)}
    >
      <Text style={styles.subscriptionText}>{item.name}</Text>
      <Ionicons 
        name={selectedSubscriptions[item.id] ? 'checkbox' : 'square-outline'} 
        size={24} 
        color={selectedSubscriptions[item.id] ? '#fff' : '#4fd1c5'} 
      />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, Platform.OS === 'ios' && { paddingTop: 50 }]}>
      <Text style={styles.title}>Select subscriptions used today :</Text>
      <Text style={styles.dateText}>Date : {formatDate(todayDate)}</Text>

      <FlatList
        data={subscriptions}
        renderItem={renderSubscriptionItem}
        keyExtractor={item => item.id.toString()}
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddUsage}>
        <Text style={styles.addButtonText}>Add uses</Text>
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
    fontSize: 22,
    color: '#4fd1c5',
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dateText: {
    color: '#b3b3b3',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  subscriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  subscriptionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#4fd1c5',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TodayCalendar;