// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ShoppingListsScreen from '../screens/ShoppingListsScreen';
import ListDetailsScreen from '../screens/ListDetailsScreen';
import EditListDetailsScreen from '../screens/EditListDetailsScreen';
import GroupDetailsScreen from '../screens/GroupDetailsScreen';
import EditGroupScreen from '../screens/EditGroupScreen';
import ItemDetailsScreen from '../screens/ItemDetailsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Main" component={ShoppingListsScreen} />
        <Tab.Screen name="ListDetails" component={ListDetailsScreen} />
        <Tab.Screen name="EditListDetails" component={EditListDetailsScreen} />
        <Tab.Screen name="GroupDetails" component={GroupDetailsScreen} />
        <Tab.Screen name="EditGroup" component={EditGroupScreen} />
        <Tab.Screen name="ItemDetails" component={ItemDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
