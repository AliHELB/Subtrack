import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabaseAsync('Abonnements.db');

// Création de la table "subscriptions" avec ajout de la colonne "color"
db.then(dbTable => dbTable.execAsync(`
    CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        cost REAL NOT NULL,
        subscriptionDate TEXT NOT NULL,
        color TEXT  -- Nouvelle colonne pour stocker la couleur en hexadécimal
    );
`).then(() => {
    console.log('Table subscriptions créée avec succès ou existe déjà.');
}).catch(error => {
    console.error('Erreur lors de la création de la table subscriptions:', error);
}));

// Recréation de la table "subscription_usage" avec "subscription_name"
db.then(dbTable => dbTable.execAsync(`
    CREATE TABLE IF NOT EXISTS subscription_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subscription_name TEXT NOT NULL,  -- On stocke le nom de l'abonnement
        usage_date TEXT NOT NULL,
        color TEXT 
    );
`).then(() => {
    console.log('Table subscription_usage créée avec succès.');
}).catch(error => {
    console.error('Erreur lors de la création de la table subscription_usage:', error);
}));

db.then((dbInstance) => {
    dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS colors (
          color TEXT PRIMARY KEY
      );
  
      INSERT OR IGNORE INTO colors (color) VALUES 
          ('#FF5733'), ('#33FF57'), ('#3357FF'), ('#FF33A8'), ('#F5A623'),
          ('#8B572A'), ('#FF6F61'), ('#6B5B95'), ('#88B04B'), ('#F7CAC9'),
          ('#92A8D1'), ('#955251'), ('#B565A7'), ('#009688'), ('#3F51B5'),
          ('#CDDC39'), ('#FFC107'), ('#9C27B0'), ('#FF9800'), ('#795548'),
          ('#607D8B'), ('#E91E63'), ('#03A9F4'), ('#4CAF50');
    `)
      .then(() => {
        console.log("Table colors créée et initialisée avec succès.");
      })
      .catch((error) => {
        console.error("Erreur lors de la création ou de l'initialisation de la table colors:", error);
      });
  });

export default db;
