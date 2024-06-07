import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('1234.db');

export default function EditListDetailsScreen({ route, navigation }) {
  const { listId } = route.params;
  const [listName, setListName] = useState('');
  const [totalPlanned, setTotalPlanned] = useState('');

  useEffect(() => {
    fetchListInfo();
  }, []);

  const fetchListInfo = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM listas_compras WHERE id = ?;',
        [listId],
        (_, { rows }) => {
          if (rows.length > 0) {
            const listInfo = rows.item(0);
            setListName(listInfo.nome);
            if (listInfo.valor_total_lista !== undefined) {
              setTotalPlanned(listInfo.valor_total_lista.toString());
            }
          }
        },
        (_, error) => console.error(error)
      );
    });
  };

  const handleSaveChanges = () => {
    if (!listName || !totalPlanned) {
      console.error('Por favor, preencha todos os campos.');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'UPDATE listas_compras SET nome = ?, valor_total_lista = ? WHERE id = ?;',
        [listName, parseFloat(totalPlanned), listId],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            navigation.navigate('ListDetails', { listId: listId });
          } else {
            console.error('Nenhuma alteração foi feita.');
          }
        },
        (_, error) => console.error(error)
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text>Nome da Lista:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome da Lista"
        value={listName}
        onChangeText={setListName}
      />
      <Text>Valor Total Planejado:</Text>
      <TextInput
        style={styles.input}
        placeholder="Valor Total Planejado"
        value={totalPlanned}
        onChangeText={setTotalPlanned}
        keyboardType="numeric"
      />
      <Button title="Salvar Alterações" onPress={handleSaveChanges} />
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
    marginBottom: 16,
    padding: 8,
  },
});
