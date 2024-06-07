// src/screens/ShoppingListsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TextInput } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('1234.db');

export default function ShoppingListsScreen({ route, navigation }) {
  const { userId } = route.params;
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState('');
  const [totalPlanned, setTotalPlanned] = useState('');

  useEffect(() => {
    fetchLists();
  }, []);

  console.log('ShoppingListsScreen userId:', userId);

  const fetchLists = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM listas_compras WHERE usuario_id = ?;',
        [userId],
        (_, { rows }) => setLists(rows._array),
        (_, error) => console.error(error)
      );
    });
  };

  const addList = () => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO listas_compras (nome, data, valor_total_lista, valor_total_gasto, usuario_id) VALUES (?, ?, ?, ?, ?);',
        [listName, new Date().toISOString(), totalPlanned, 0, userId],  // valor_total_gasto iniciado em 0
        () => fetchLists(),
        (_, error) => console.error(error)
      );
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nome da Lista"
        value={listName}
        onChangeText={setListName}
      />
      <TextInput
        style={styles.input}
        placeholder="Valor Total Planejado"
        value={totalPlanned}
        onChangeText={setTotalPlanned}
      />
      <Button title="Adicionar Lista" onPress={addList} />
      <FlatList
        data={lists}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.nome}</Text>
            <Button
              title="Ver Detalhes"
              onPress={() => {
                navigation.navigate('ListDetails', { listId: item.id });
                console.log('Navigating to ListDetails with listId:', item.id);
              }}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 8,
    padding: 8,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
});
