import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('1234.db');

export default function ItemDetailsScreen({ route, navigation }) {
  const { listId } = route.params;
  const { itemId } = route.params;
  const [itemInfo, setItemInfo] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemValue, setItemValue] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');

  useEffect(() => {
    fetchItemInfo();
  }, []);

  const fetchItemInfo = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM itens_lista WHERE id = ?;',
        [itemId],
        (_, { rows }) => {
          if (rows.length > 0) {
            const itemData = rows.item(0);
            setItemInfo(itemData);
            setItemName(itemData.nome);
            setItemValue(itemData.valor_unitario.toString());
            setItemQuantity(itemData.quantidade.toString());
          }
        },
        (_, error) => console.error(error)
      );
    });
    console.log('ITEM listId:', listId);
  };

  const updateItem = () => {
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
        'UPDATE itens_lista SET nome = ?, valor_unitario = ?, quantidade = ? WHERE id = ?;',
        [itemName, value, quantity, itemId],
        () => {
          updateListTotal();
          navigation.goBack(); // Volta para a tela anterior
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
           WHERE grupos_itens.lista_id = (
             SELECT lista_id FROM grupos_itens WHERE id = (SELECT grupo_id FROM itens_lista WHERE id = ?)
           )
         )
         WHERE id = (
           SELECT lista_id FROM grupos_itens WHERE id = (SELECT grupo_id FROM itens_lista WHERE id = ?)
         );`,
        [itemId, itemId],
        () => console.log('Lista total updated'),
        (_, error) => console.error(error)
      );
    });
  };

  const deleteItem = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza de que deseja excluir este item?',
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
              // Primeiro, recuperamos o valor total do item
              tx.executeSql(
                'SELECT valor_unitario, quantidade FROM itens_lista WHERE id = ?;',
                [itemId],
                (_, { rows }) => {
                  if (rows.length > 0) {
                    const itemData = rows.item(0);
                    const valorTotalItem = itemData.valor_unitario * itemData.quantidade;
                    // Atualizamos o valor total gasto na lista subtraindo o valor total do item
                    console.log(`id da lista: ${listId}`);
                    tx.executeSql(
                      'UPDATE listas_compras SET valor_total_gasto = valor_total_gasto - ? WHERE id = ?;',
                      [valorTotalItem, listId],
                      () => {
                        // Após atualizar o valor total gasto, excluímos o item
                        tx.executeSql(
                          'DELETE FROM itens_lista WHERE id = ?;',
                          [itemId],
                          (_, { rowsAffected }) => {
                            if (rowsAffected > 0) {
                              updateListTotal(); // Atualiza as informações da lista após a exclusão
                              navigation.goBack(); // Volta para a tela anterior
                            } else {
                              console.error('Nenhum item foi excluído.');
                            }
                          },
                          (_, error) => console.error(error)
                        );
                      },
                      (_, error) => console.error(error)
                    );
                  } else {
                    console.error('Nenhum item encontrado com o ID especificado.');
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

  if (!itemInfo) {
    return (
      <View style={styles.container}>
        <Text>Carregando informações do item...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Nome do Item: {itemInfo.nome}</Text>
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
      <Button title="Atualizar Item" onPress={updateItem} />
      <Button title="Excluir Item" onPress={deleteItem} />
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
