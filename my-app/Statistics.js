import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Image, Platform } from 'react-native';
import db from './database';

const Statistics = ({ route }) => {
  const { month } = route.params; // Mois au format 'YYYY-MM'
  const [statisticsData, setStatisticsData] = useState([]);

  // Convertit le mois au format 'YYYY-MM' en 'MM/AAAA'
  const formatMonth = (month) => {
    const [year, monthNumber] = month.split('-');
    return `${monthNumber}/${year}`;
  };

  const fetchStatistics = async () => {
    try {
      const dbInstance = await db;

      // Récupère les données des abonnements et calcule les statistiques
      const query = `
        SELECT 
          s.name AS subscription_name, 
          s.cost AS monthly_cost,
          s.color AS color,
          COUNT(u.id) AS usage_count, 
          (s.cost / COUNT(u.id)) AS cost_per_use
        FROM 
          subscriptions s
        LEFT JOIN 
          subscription_usage u ON s.name = u.subscription_name 
        WHERE 
          u.usage_date LIKE '${month}%' 
        GROUP BY 
          s.name
      `;

      const result = await dbInstance.getAllAsync(query);

      // Ajout d'un champ logoFailed pour gérer les erreurs d'image
      setStatisticsData(result.map(sub => ({ ...sub, logoFailed: false })));

    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques :", error);
    }
  };

  useEffect(() => {
    fetchStatistics(); // Charge les données lors du montage du composant
  }, []);

  const getLogoUrl = (name) => `https://logo.clearbit.com/${name.toLowerCase()}.com`;

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: item.color || '#333' }]}>
      {/* Affiche le logo ou un fallback si le logo échoue */}
      {!item.logoFailed ? (
        <Image
          source={{ uri: getLogoUrl(item.subscription_name) }}
          style={styles.logo}
          onError={() => {
            setStatisticsData(prev =>
              prev.map(sub =>
                sub.subscription_name === item.subscription_name
                  ? { ...sub, logoFailed: true }
                  : sub
              )
            );
          }}
        />
      ) : (
        <View style={styles.fallbackLogo}>
          <Text style={styles.firstLetter}>{item.subscription_name[0]}</Text>
        </View>
      )}

      {/* Informations sur l'abonnement */}
      <View style={styles.infoContainer}>
        <Text style={styles.subscriptionName}>{item.subscription_name}</Text>
        <Text style={styles.text}>Monthly cost : {item.monthly_cost.toFixed(2)} €</Text>
        <Text style={styles.text}>Number of uses : {item.usage_count}</Text>
        <Text style={styles.text}>
          Cost per use :{' '}
          {item.usage_count > 0 ? `${item.cost_per_use.toFixed(2)} €` : 'N/A'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, Platform.OS === 'ios' && { paddingTop: 50 }]}>
      <Text style={styles.title}>Statistics for {formatMonth(month)}</Text>
      <FlatList
        data={statisticsData}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
      />
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4fd1c5',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
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
  infoContainer: {
    marginLeft: 15,
  },
  subscriptionName: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    color: '#b6c1cd',
  },
});

export default Statistics;
