import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import db from './database';
import { Ionicons } from '@expo/vector-icons'; 

const CalendarScreen = ({ navigation }) => {
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7)); // YYYY-MM

  const formatDate = (isoDate) => {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`; // Formate la date en JJ/MM/AAAA
  };

  useEffect(() => {
    fetchUsageData(); // Charge les données d'utilisation pour marquer les dates
  }, []);

  const fetchUsageData = async () => {
    try {
      const dbInstance = await db;
      const result = await dbInstance.getAllAsync('SELECT subscription_name, usage_date, color FROM subscription_usage');

      // Structure les données pour le calendrier avec des périodes marquées
      const usageData = result.reduce((acc, item) => {
        const { usage_date, color, subscription_name } = item;

        if (!acc[usage_date]) {
          acc[usage_date] = { periods: [] };
        }

        acc[usage_date].periods.push({
          color: color || '#999999',
          startingDay: true,
          endingDay: true,
          subscriptionName: subscription_name,
        });

        return acc;
      }, {});

      setMarkedDates(usageData);
    } catch (error) {
      console.error("Erreur lors de la récupération des données d'utilisation :", error);
      Alert.alert('Erreur', 'Impossible de charger les données du calendrier.');
    }
  };

  const handleDayPress = (day) => {
    // Affiche les informations des abonnements pour une date sélectionnée
    const selectedInfo = markedDates[day.dateString]?.periods || [];
    setSelectedDateInfo(selectedInfo);
    setSelectedDate(day.dateString);
  };

  const handleMonthChange = (month) => {
    setCurrentMonth(month.dateString.slice(0, 7)); // Met à jour le mois affiché
  };

  return (
    <View style={[styles.container, Platform.OS === 'ios' && { paddingTop: 50 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Statistics', { month: currentMonth })} // Accès à l'écran des statistiques
          style={styles.statsButton}
        >
          <Ionicons name="stats-chart" size={24} color="#4fd1c5" />
        </TouchableOpacity>
      </View>

      <Calendar
        monthFormat={'MMMM yyyy'}
        markingType={'multi-period'}
        markedDates={markedDates}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        firstDay={1}
        theme={{
          calendarBackground: '#1c1c1e',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#4fd1c5',
          todayTextColor: '#4fd1c5',
          dayTextColor: '#ffffff',
          textDisabledColor: '#666666',
          dotColor: '#4fd1c5',
          selectedDotColor: '#ffffff',
          arrowColor: '#4fd1c5',
          monthTextColor: '#4fd1c5',
          indicatorColor: '#4fd1c5',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 20,
          textDayHeaderFontSize: 16,
        }}
      />

      {selectedDateInfo && (
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>
            Subscriptions for {selectedDate ? formatDate(selectedDate) : ''} :
          </Text>
          {selectedDateInfo.map((period, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: period.color }]} />
              <Text style={styles.legendText}>{period.subscriptionName}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4fd1c5',
  },
  statsButton: {
    padding: 10,
  },
  legendContainer: {
    padding: 15,
    backgroundColor: '#1c1c1e',
    marginTop: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: '#ffffff',
  },
});

export default CalendarScreen;
