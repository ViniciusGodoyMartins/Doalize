import React, {
  useContext,
} from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  AuthContext,
} from '../context/AuthContext';

/*
 * TELAS DE AUTENTICAÇÃO
 */
import LoginScreen from '../screens/Auth/LoginScreen';

import RegisterScreen from '../screens/Auth/RegisterScreen';

import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';

import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';

/*
 * NAVEGADOR
 */
const Stack =
  createNativeStackNavigator();

export default function AuthRoutes() {
  const {
    user,
  } = useContext(
    AuthContext
  );

  console.log(
    'USUÁRIO NAS ROTAS DE AUTENTICAÇÃO:',
    user
  );

  return (
    <Stack.Navigator
      initialRouteName="LoginScreen"
      screenOptions={{
        headerShown: false,

        animation:
          'slide_from_right',

        gestureEnabled: true,
      }}
    >
      {/* LOGIN */}
      <Stack.Screen
        name="LoginScreen"
        component={
          LoginScreen
        }
      />

      {/* CADASTRO */}
      <Stack.Screen
        name="RegisterScreen"
        component={
          RegisterScreen
        }
      />

      {/* SOLICITAR CÓDIGO */}
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={
          ForgotPasswordScreen
        }
      />

      {/* REDEFINIR SENHA */}
      <Stack.Screen
        name="ResetPasswordScreen"
        component={
          ResetPasswordScreen
        }
      />
    </Stack.Navigator>
  );
}
`import React, {
  useContext,
} from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  AuthContext,
} from '../context/AuthContext';

/*
 * TELAS DE AUTENTICAÇÃO
 */
import LoginScreen from '../screens/Auth/LoginScreen';

import RegisterScreen from '../screens/Auth/RegisterScreen';

import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';

import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';

/*
 * NAVEGADOR
 */
const Stack =
  createNativeStackNavigator();

export default function AuthRoutes() {
  const {
    user,
  } = useContext(
    AuthContext
  );

  console.log(
    'USUÁRIO NAS ROTAS DE AUTENTICAÇÃO:',
    user
  );

  return (
    <Stack.Navigator
      initialRouteName="LoginScreen"
      screenOptions={{
        headerShown: false,

        animation:
          'slide_from_right',

        gestureEnabled: true,
      }}
    >
      {/* LOGIN */}
      <Stack.Screen
        name="LoginScreen"
        component={
          LoginScreen
        }
      />

      {/* CADASTRO */}
      <Stack.Screen
        name="RegisterScreen"
        component={
          RegisterScreen
        }
      />

      {/* SOLICITAR CÓDIGO */}
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={
          ForgotPasswordScreen
        }
      />

      {/* REDEFINIR SENHA */}
      <Stack.Screen
        name="ResetPasswordScreen"
        component={
          ResetPasswordScreen
        }
      />
    </Stack.Navigator>
  );
}
`import React, {
  useContext,
} from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  AuthContext,
} from '../context/AuthContext';

/*
 * TELAS DE AUTENTICAÇÃO
 */
import LoginScreen from '../screens/Auth/LoginScreen';

import RegisterScreen from '../screens/Auth/RegisterScreen';

import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';

import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';

/*
 * NAVEGADOR
 */
const Stack =
  createNativeStackNavigator();

export default function AuthRoutes() {
  const {
    user,
  } = useContext(
    AuthContext
  );

  console.log(
    'USUÁRIO NAS ROTAS DE AUTENTICAÇÃO:',
    user
  );

  return (
    <Stack.Navigator
      initialRouteName="LoginScreen"
      screenOptions={{
        headerShown: false,

        animation:
          'slide_from_right',

        gestureEnabled: true,
      }}
    >
      {/* LOGIN */}
      <Stack.Screen
        name="LoginScreen"
        component={
          LoginScreen
        }
      />

      {/* CADASTRO */}
      <Stack.Screen
        name="RegisterScreen"
        component={
          RegisterScreen
        }
      />

      {/* SOLICITAR CÓDIGO */}
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={
          ForgotPasswordScreen
        }
      />

      {/* REDEFINIR SENHA */}
      <Stack.Screen
        name="ResetPasswordScreen"
        component={
          ResetPasswordScreen
        }
      />
    </Stack.Navigator>
  );
}
