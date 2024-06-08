import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TextInput, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('1234.db');

export default function GroupDetailsScreen({ route, navigation }) {
  const { listId } = route.params;
  const { groupId } = route.params;
  const [groupInfo, setGroupInfo] = useState(null);
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemValue, setItemValue] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');

  useEffect(() => {
    fetchGroupInfo();
    fetchItems();
  }, []);

  const fetchGroupInfo = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM grupos_itens WHERE id = ?;',
        [groupId],
        (_, { rows }) => {
          if (rows.length > 0) {
            const groupData = rows.item(0);
            setGroupInfo(groupData);
          }
        },
        (_, error) => console.error(error)
      );
    });
    console.log('listId:', listId);
  };

  const fetchItems = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM itens_lista WHERE grupo_id = ?;',
        [groupId],
        (_, { rows }) => setItems(rows._array),
        (_, error) => console.error(error)
      );
    });
  };

  const addItem = () => {
    if (!itemName || !itemValue || !itemQuantity) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }

    const value = parseFloat(itemValue);
    const quantity = parseInt(itemQuantity, 10);

    if (isNaN(value) || isNaN(quantity)) {
      Alert.alert('Erro', 'Valor e quantidade devem ser números.');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO itens_lista (grupo_id, nome, valor_unitario, quantidade) VALUES (?, ?, ?, ?);',
        [groupId, itemName, value, quantity],
        () => {
          fetchItems();
          updateListTotal();
        },
        (_, error) => console.error(error)
      );
    });
  };

  const updateListTotal = () => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE listas_compras 
         SET valor_total_gasto = (
           SELECT SUM(itens_lista.valor_unitario * itens_lista.quantidade)
           FROM itens_lista 
           INNER JOIN grupos_itens ON itens_lista.grupo_id = grupos_itens.id
           WHERE grupos_itens.lista_id = ?
         )
         WHERE id = (
           SELECT lista_id FROM grupos_itens WHERE id = ?
         );`,
        [groupInfo.lista_id, groupId],
        () => console.log('Lista total updated'),
        (_, error) => console.error(error)
      );
    });
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza de que deseja excluir este grupo?',
      [
        {
          text: 'Cancelar',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () => {
            db.transaction(tx => {
              tx.executeSql(
                'DELETE FROM grupos_itens WHERE id = ?;',
                [groupId],
                (_, { rowsAffected }) => {
                  if (rowsAffected > 0) {
                    navigation.goBack(); // Volta para a tela anterior
                  } else {
                    console.error('Nenhum grupo foi excluído.');
                  }
                },
                (_, error) => console.error(error)
              );
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (!groupInfo) {
    return (
      <View style={styles.container}>
        <Text>Carregando informações do grupo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Nome do Grupo: {groupInfo.nome}</Text>
      <Button
        title="Editar Grupo"
        onPress={() => navigation.navigate('EditGroup', { groupId: groupId })}
      />
      <Button title="Excluir Grupo" onPress={handleDeleteGroup} />

      <TextInput
        style={styles.input}
        placeholder="Nome do Item"
        value={itemName}
        onChangeText={setItemName}
      />
      <TextInput
        style={styles.input}
        placeholder="Valor Unitário"
        value={itemValue}
        onChangeText={setItemValue}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Quantidade"
        value={itemQuantity}
        onChangeText={setItemQuantity}
        keyboardType="numeric"
      />
      <Button title="Adicionar Item" onPress={addItem} />

      <FlatList
        data={items}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.nome} - R${(item.valor_unitario * item.quantidade).toFixed(2)}</Text>
            <Button
              title="Ver Detalhes"
              onPress={() => navigation.navigate('ItemDetails', { itemId: item.id, listId: listId})}
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
