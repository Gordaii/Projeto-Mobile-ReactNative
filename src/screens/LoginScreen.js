import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import * as LocalAuthentication from 'expo-local-authentication';

const db = SQLite.openDatabase('1234.db');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBiometricLogin, setIsBiometricLogin] = useState(false);

  useEffect(() => {
    checkBiometricAuth();
  }, []);

  useEffect(() => {
    if (isBiometricLogin && email && password) {
      handleLogin();
    }
  }, [email, password, isBiometricLogin]);

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

              // Salvar email e senha no AsyncStorage
              try {
                AsyncStorage.setItem('email', email);
                AsyncStorage.setItem('password', password);
                console.log('Email and password saved to AsyncStorage');
              } catch (error) {
                console.error('Error saving to AsyncStorage:', error);
              }

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
    console.log('Checking for biometric hardware and saved biometric data...');
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const supported = await LocalAuthentication.supportedAuthenticationTypesAsync();
  
    if (hasHardware && supported.length > 0) {
      const savedBiometricData = await getSavedBiometricData();
  
      if (savedBiometricData) {
        console.log('Saved biometric data found:', savedBiometricData);
        setIsBiometricLogin(true);
      } else {
        console.log('No saved biometric data found');
      }
    } else {
      console.log('No biometric hardware or unsupported authentication types');
    }
  };
  
  const promptBiometricAuth = async () => {
    console.log('Prompting for biometric authentication...');
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Login com biometria',
    });
  
    if (result.success) {
      console.log('Biometric authentication successful');
      const savedBiometricData = await getSavedBiometricData();
      if (savedBiometricData) {
        console.log('Setting email and password from saved biometric data');
        setEmail(savedBiometricData.email);
        setPassword(savedBiometricData.password);
        setIsBiometricLogin(true);
        handleLogin(); // Chama a função de login depois que a autenticação biométrica for bem-sucedida
      }
    } else {
      console.log('Biometric authentication failed:', result);
      Alert.alert('Erro', 'Autenticação biométrica falhou.');
    }
  };

  const getSavedBiometricData = async () => {
    try {
      const email = await AsyncStorage.getItem('email');
      const password = await AsyncStorage.getItem('password');
      if (email !== null && password !== null) {
        return { email, password };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving biometric data:', error);
      return null;
    }
  };

  const checkStoredData = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('email');
      const storedPassword = await AsyncStorage.getItem('password');
      console.log('Stored email:', storedEmail);
      console.log('Stored password:', storedPassword);
      Alert.alert('Stored Data', `Email: ${storedEmail}\nPassword: ${storedPassword}`);
    } catch (error) {
      console.error('Error retrieving stored data:', error);
      Alert.alert('Error', 'Erro ao recuperar dados armazenados.');
    }
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
      <Button title="Verificar Dados Armazenados" onPress={checkStoredData} />
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
