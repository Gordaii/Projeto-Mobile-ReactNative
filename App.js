import React, { useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import AppNavigator from './src/navigation/AppNavigator';

const db = SQLite.openDatabase('1234.db');

export default function App() {
  useEffect(() => {
    const createTables = () => {
      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL
          );`,
          [],
          (_, result) => {
            console.log('Tabela de usuários verificada/criada');
          },
          (_, error) => {
            console.log('Erro ao criar tabela de usuários:', error);
          }
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS listas_compras (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            nome TEXT NOT NULL,
            data DATE NOT NULL,
            valor_total_gasto REAL NOT NULL,
            valor_total_lista REAL NOT NULL,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
          );`,
          [],
          (_, result) => {
            console.log('Tabela de listas de compras verificada/criada');
          },
          (_, error) => {
            console.log('Erro ao criar tabela de listas de compras:', error);
          }
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS grupos_itens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            lista_id INTEGER NOT NULL,
            FOREIGN KEY (lista_id) REFERENCES listas_compras(id) ON DELETE CASCADE
          );`,
          [],
          (_, result) => {
            console.log('Tabela de grupos de itens verificada/criada');
          },
          (_, error) => {
            console.log('Erro ao criar tabela de grupos de itens:', error);
          }
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS itens_lista (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            grupo_id INTEGER NOT NULL,
            nome TEXT NOT NULL,
            valor_unitario REAL NOT NULL,
            quantidade INTEGER NOT NULL,
            FOREIGN KEY (grupo_id) REFERENCES grupos_itens(id) ON DELETE CASCADE
          );`,
          [],
          (_, result) => {
            console.log('Tabela de itens do grupo da lista de compras verificada/criada');
          },
          (_, error) => {
            console.log('Erro ao criar tabela de itens do grupo da lista de compras:', error);
          }
        );
      });
    };

    createTables();
  }, []);

  return <AppNavigator />;
}
