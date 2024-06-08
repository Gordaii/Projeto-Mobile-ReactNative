import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('1234.db');

export default function EditGroupScreen({ route, navigation }) {
  const { groupId } = route.params;
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    fetchGroupInfo();
  }, []);

  const fetchGroupInfo = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM grupos_itens WHERE id = ?;',
        [groupId],
        (_, { rows }) => {
          if (rows.length > 0) {
            const groupData = rows.item(0);
            setGroupName(groupData.nome);
          }
        },
        (_, error) => console.error(error)
      );
    });
  };

  const handleSaveGroup = () => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE grupos_itens SET nome = ? WHERE id = ?;',
        [groupName, groupId],
        () => {
          Alert.alert('Sucesso', 'Grupo atualizado com sucesso!');
          navigation.goBack(); // Volta para a tela anterior
        },
        (_, error) => console.error(error)
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text>Nome do Grupo:</Text>
      <TextInput
        style={styles.input}
        value={groupName}
        onChangeText={setGroupName}
      />
      <Button title="Salvar Alterações" onPress={handleSaveGroup} />
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
});
