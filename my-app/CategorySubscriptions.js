import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, Platform } from 'react-native';
import db from './database.js';

const CategorySubscriptions = ({ route, navigation }) => {
  const { category } = route.params; // Récupère la catégorie sélectionnée à partir des paramètres
  const [subscriptions, setSubscriptions] = useState([]);

  const fetchSubscriptions = async () => {
    try {
      const dbInstance = await db;
      // Récupère les abonnements filtrés par catégorie
      const result = await dbInstance.getAllAsync(`SELECT * FROM subscriptions WHERE category = '${category}'`);
      setSubscriptions(result.map(sub => ({ ...sub, logoFailed: false }))); // Initialise le statut de l'image
    } catch (error) {
      console.error('Erreur lors de la récupération des abonnements :', error);
    }
  };

  useEffect(() => {
    fetchSubscriptions(); // Charge les abonnements lors du montage du composant
  }, []);

  const getLogoUrl = (name) => {
    // Génère l'URL du logo basé sur le nom de l'abonnement
    return `https://logo.clearbit.com/${name.toLowerCase()}.com`;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: item.color || '#333' }]}
      onPress={() => navigation.navigate('SubscriptionDetails', { subscription: item })} // Navigation vers les détails
    >
      {!item.logoFailed ? (
        <Image
          source={{ uri: getLogoUrl(item.name) }}
          style={styles.logo}
          onError={() => {
            // Si le chargement du logo échoue, bascule sur le fallback (chatgpt)
            setSubscriptions((prev) =>
              prev.map((sub) =>
                sub.id === item.id ? { ...sub, logoFailed: true } : sub
              )
            );
          }}
        />
      ) : (
        <View style={styles.fallbackLogo}>
          <Text style={styles.firstLetter}>{item.name[0]}</Text>
        </View>
      )}
      <Text style={styles.cardText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, Platform.OS === 'ios' && { paddingTop: 50 }]}>
      <Text style={styles.title}>Subscriptions for {category}</Text>
      <FlatList 
        data={subscriptions}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 30,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 15,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 5,
  },
  fallbackLogo: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: '#4fd1c5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstLetter: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
});

export default CategorySubscriptions;
