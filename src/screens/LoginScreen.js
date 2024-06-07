  // src/screens/LoginScreen.js
  import React, { useState, useEffect } from 'react';
  import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
  import * as SQLite from 'expo-sqlite';
  import * as LocalAuthentication from 'expo-local-authentication';

  const db = SQLite.openDatabase('1234.db');

  export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
      checkBiometricAuth();
    }, []);

    const handleLogin = () => {
      console.log('Login attempt with email:', email, 'and password:', password);

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM usuarios WHERE email = ?;',
          [email],
          (_, { rows }) => {
            if (rows.length > 0) {
              const user = rows.item(0);
              console.log('User found in database:', user);

              if (password === user.senha) {
                console.log('Navigating to Main with userId:', user.id);
                navigation.navigate('Main', { userId: user.id });
              } else {
                Alert.alert('Erro', 'Senha incorreta.');
              }
            } else {
              Alert.alert('Erro', 'E-mail não encontrado.');
            }
          },
          (_, error) => {
            console.log('Error fetching user:', error);
            Alert.alert('Erro', 'Erro ao buscar usuário.');
          }
        );
      });
    };

    const checkBiometricAuth = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const supported = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (hasHardware && supported.length > 0) {
        const savedBiometricData = await getSavedBiometricData();

        if (savedBiometricData) {
          promptBiometricAuth();
        }
      }
    };

    const promptBiometricAuth = async () => {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login com biometria',
      });

      if (result.success) {
        const savedBiometricData = await getSavedBiometricData();
        setEmail(savedBiometricData.email);
        setPassword(savedBiometricData.password);
        handleLogin();
      } else {
        Alert.alert('Erro', 'Autenticação biométrica falhou.');
      }
    };

    const getSavedBiometricData = async () => {
      // Implementar a lógica para obter os dados de email e senha do AsyncStorage ou de onde foram salvos
      // Aqui, você deve usar AsyncStorage ou qualquer outra forma que você usou para salvar os dados biométricos
      // Exemplo:
      // const email = await AsyncStorage.getItem('email');
      // const password = await AsyncStorage.getItem('password');
      // return { email, password };
      return null;
    };

    return (
      <View style={styles.container}>
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
        <Button title="Entrar" onPress={handleLogin} />
        <Button title="Cadastrar" onPress={() => navigation.navigate('SignUp')} />
        <Button title="Entrar com biometria" onPress={promptBiometricAuth} />
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

