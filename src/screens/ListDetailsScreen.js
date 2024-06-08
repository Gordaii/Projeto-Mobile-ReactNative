import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TextInput, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('1234.db');

export default function ListDetailsScreen({ route, navigation }) {
  const { listId } = route.params;
  const [listInfo, setListInfo] = useState(null);
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    fetchListInfo();
    fetchGroups();
  }, []);

  const fetchListInfo = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM listas_compras WHERE id = ?;',
        [listId],
        (_, { rows }) => {
          if (rows.length > 0) {
            let listData = rows.item(0);
            if (!listData.nome) listData.nome = 'Lista sem nome';
            if (!listData.data) listData.data = new Date().toISOString();
            if (!listData.valor_total_lista) listData.valor_total_lista = 0;
            if (!listData.valor_total_gasto) listData.valor_total_gasto = 0;
            setListInfo(listData);

            // Consulta para obter o valor total gasto atualizado no banco
            db.transaction(tx => {
              tx.executeSql(
                'SELECT valor_total_gasto FROM listas_compras WHERE id = ?;',
                [listId],
                (_, { rows }) => {
                  if (rows.length > 0) {
                    const valorTotalGastoNoBanco = rows.item(0).valor_total_gasto;
                    console.log('Valor total gasto no banco:', valorTotalGastoNoBanco);
                  } else {
                    console.log('Nenhuma linha retornada ao recuperar o valor total gasto do banco.');
                  }
                },
                (_, error) => console.error(error)
              );
            });

          } else {
            createNewList();
          }
        },
        (_, error) => console.error(error)
      );
    });
  };

  const createNewList = () => {
    const currentDate = new Date().toISOString();
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO listas_compras (nome, data, valor_total_lista, valor_total_gasto) VALUES (?, ?, ?, ?);',
        ['Nova Lista', currentDate, 0, 0],
        (_, { insertId }) => {
          fetchListInfo();
        },
        (_, error) => console.error(error)
      );
    });
  };

  const fetchGroups = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM grupos_itens WHERE lista_id = ?;',
        [listId],
        (_, { rows }) => setGroups(rows._array),
        (_, error) => console.error(error)
      );
    });
  };

  const addGroup = () => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO grupos_itens (nome, lista_id) VALUES (?, ?);',
        [groupName, listId],
        () => fetchGroups(),
        (_, error) => console.error(error)
      );
    });
  };

  const handleEditList = () => {
    navigation.navigate('EditListDetails', { listId: listId });
  };

  const handleDeleteList = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza de que deseja excluir esta lista?',
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
                'DELETE FROM listas_compras WHERE id = ?;',
                [listId],
                (_, { rowsAffected }) => {
                  if (rowsAffected > 0) {
                    navigation.goBack(); // Volta para a tela anterior
                  } else {
                    console.error('Nenhuma lista foi excluída.');
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!listInfo) {
    return (
      <View style={styles.container}>
        <Text>Carregando informações da lista...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Nome da Lista: {listInfo.nome}</Text>
      <Text>Data: {formatDate(listInfo.data)}</Text>
      <Text>Valor Total Planejado: R${listInfo.valor_total_lista.toFixed(2)}</Text>
      <Text>Valor Total Gasto: R${listInfo.valor_total_gasto}</Text>
      <Button title="Editar Lista" onPress={handleEditList} />
      <Button title="Excluir Lista" onPress={handleDeleteList} />
      <TextInput
        style={styles.input}
        placeholder="Nome do Grupo"
        value={groupName}
        onChangeText={setGroupName}
      />
      <Button title="Adicionar Grupo" onPress={addGroup} />
      <FlatList
        data={groups}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.nome}</Text>
            <Button
              title="Ver Detalhes"
              onPress={() => navigation.navigate('GroupDetails', { listId: listId, groupId: item.id })}
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
