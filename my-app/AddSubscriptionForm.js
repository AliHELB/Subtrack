import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, TouchableOpacity, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import db from './database.js';

export default function AddSubscriptionForm({ navigation }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [cost, setCost] = useState('');
  const [subscriptionDate, setSubscriptionDate] = useState(new Date());
  const [availableColors, setAvailableColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchAvailableColors(); // Charge les couleurs disponibles depuis la base de données.
  }, []);

  const fetchAvailableColors = async () => {
    try {
      const database = await db;
      const result = await database.getAllAsync('SELECT color FROM colors'); // Récupération des couleurs depuis la table `colors`.
      setAvailableColors(result.map(row => row.color));
      setSelectedColor(result.length > 0 ? result[0].color : null); // Définit une couleur par défaut si disponible.
    } catch (error) {
      console.error('Erreur lors de la récupération des couleurs :', error);
      Alert.alert('Erreur', 'Impossible de charger les couleurs disponibles.');
    }
  };

  const insertSubscription = async () => {
    try {
      if (!selectedColor) {
        Alert.alert('Erreur', 'Please select a color.');
        return;
      }

      const database = await db;
      const formattedDate = `${subscriptionDate.getDate()}/${subscriptionDate.getMonth() + 1}/${subscriptionDate.getFullYear()}`;

      // Insère un nouvel abonnement dans la base de données et supprime la couleur utilisée.
      const insertQuery = `
        INSERT INTO subscriptions (name, category, cost, subscriptionDate, color)
        VALUES ('${name}', '${category}', ${parseFloat(cost)}, '${formattedDate}', '${selectedColor}')
      `;
      await database.execAsync(insertQuery);

      const deleteQuery = `DELETE FROM colors WHERE color = '${selectedColor}'`;
      await database.execAsync(deleteQuery);

      Alert.alert('Success', 'Subscription successfully added !');
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de l\'insertion dans la base de données :', error);
      Alert.alert('Erreur', 'Échec de l\'ajout de l\'abonnement.');
    }
  };

  const handleSave = () => {
    if (!name || !category || !cost || !subscriptionDate) {
      Alert.alert('Error', 'All fields are required !');
      return;
    }
    insertSubscription();
  };

  const onChangeDate = (event, selectedDate) => {
    if (selectedDate !== undefined) {
      setSubscriptionDate(selectedDate);
    }
    setShowDatePicker(false);
  };

  return (
    <View style={[styles.container, Platform.OS === 'ios' && { paddingTop: 50 }]}>
      <Text style={styles.title}>Add a subscription</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Category"
        placeholderTextColor="#aaa"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="Monthly cost"
        placeholderTextColor="#aaa"
        value={cost}
        onChangeText={setCost}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateButtonText}>Select a subscription date</Text>
      </TouchableOpacity>

      <Text style={styles.selectedDate}>
        Subscription date : {subscriptionDate.getDate()}/{subscriptionDate.getMonth() + 1}/{subscriptionDate.getFullYear()}
      </Text>

      {showDatePicker && (
        <DateTimePicker
          value={subscriptionDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={new Date()} // Empêche de sélectionner une date future
        />
      )}

      <Text style={styles.label}>Available colors :</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPalette}>
        {availableColors.map((colorOption) => (
          <TouchableOpacity
            key={colorOption}
            style={[styles.colorOption, { backgroundColor: colorOption }, colorOption === selectedColor && styles.selectedColor]}
            onPress={() => setSelectedColor(colorOption)}
          />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1c1c1e',
    color: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  selectedDate: {
    color: '#fff',
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
  dateButton: {
    backgroundColor: '#4fd1c5',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
  },
  dateButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  colorPalette: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 10,
  },
  selectedColor: {
    borderColor: '#000',
  },
  saveButton: {
    backgroundColor: '#4fd1c5',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
  },
});