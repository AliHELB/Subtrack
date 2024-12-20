import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Platform } from 'react-native';
import db from './database';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const SubscriptionScreen = ({ navigation }) => {
  const [categoryCounts, setCategoryCounts] = useState({});
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);

  const fetchCategories = async () => {
    try {
      const dbInstance = await db;
      // Récupère les catégories d'abonnements depuis la base de données
      const result = await dbInstance.getAllAsync('SELECT category FROM subscriptions');
      
      const counts = {};
      result.forEach(sub => {
        const category = sub.category;
        counts[category] = counts[category] ? counts[category] + 1 : 1;
      });

      // Trie les catégories par ordre alphabétique
      const sortedCounts = Object.fromEntries(
        Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]))
      );

      setCategoryCounts(sortedCounts);
      setTotalSubscriptions(result.length); // Totalise le nombre d'abonnements
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories :", error);
    }
  };

  // Actualise les données à chaque fois que l'écran est affiché
  useFocusEffect(
    React.useCallback(() => {
      fetchCategories();
    }, [])
  );

  const handleCategoryPress = (category) => {
    // Navigue vers les abonnements filtrés par catégorie
    navigation.navigate('CategorySubscriptions', { category });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleCategoryPress(item[0])}
    >
      <View style={styles.cardContent}>
        <Ionicons name="albums-outline" size={32} color="#4fd1c5" />
        <Text style={styles.cardText}>{item[0]}</Text>
      </View>
      <Text style={styles.cardNumber}>{item[1]}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, Platform.OS === 'ios' && { paddingTop: 50 }]}>
      <Text style={styles.title}>Subscription categories</Text>
      <Text style={styles.totalText}>Total subscriptions : {totalSubscriptions}</Text>

      <FlatList
        data={Object.entries(categoryCounts)} // Affiche les catégories et leur nombre
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item[0]}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddSubscriptionForm')}
      >
        <Ionicons name="add-circle-outline" size={24} color="#000" />
        <Text style={styles.addButtonText}>Add a subscription</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  totalText: {
    color: '#b3b3b3',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    color: '#ffffff',
    fontSize: 18,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  cardNumber: {
    color: '#4fd1c5',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4fd1c5',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default SubscriptionScreen;
