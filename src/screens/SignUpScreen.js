// src/screens/SignUpScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import createUsuariosTable from '../../db/Database';

const db = SQLite.openDatabase('1234.db');

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    console.log('Sign Up attempt with name:', name, 'email:', email, 'password:', password);
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?);',
        [name, email, password],
        (_, result) => {
          console.log('User inserted with result:', result);

          // Display the table content after insertion
          tx.executeSql(
            'SELECT * FROM usuarios;',
            [],
            (_, { rows }) => {
              console.log('Conteúdo da tabela de usuários:');
              for (let i = 0; i < rows.length; i++) {
                console.log(rows.item(i));
              }
              Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
              navigation.goBack();
            },
            (_, error) => {
              console.log('Error fetching users:', error);
              Alert.alert('Erro', 'Erro ao buscar usuários.');
            }
          );
        },
        (_, error) => {
          console.log('Error inserting user:', error);
          Alert.alert('Erro', 'Erro ao cadastrar usuário.');
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Cadastrar" onPress={handleSignUp} />
      <Button title="Voltar para Login" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
  },
});
