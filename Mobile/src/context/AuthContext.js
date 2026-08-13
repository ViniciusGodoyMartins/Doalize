import React, {
  createContext,
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../services/api';

export const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  async function saveUser(userData) {
    if (!userData) {
      return;
    }

    setUser(userData);

    await AsyncStorage.setItem(
      '@doalize_user',
      JSON.stringify(userData)
    );
  }

  async function loadUser() {
    try {
      const token =
        await AsyncStorage.getItem(
          '@doalize_token'
        );

      if (!token) {
        setUser(null);
        return;
      }

      api.defaults.headers.Authorization =
        `Bearer ${token}`;

      try {
        const response =
          await api.get(
            '/users/profile'
          );

        await saveUser(
          response.data
        );
      } catch (profileError) {
        console.log(
          'ERRO AO BUSCAR PERFIL:',
          profileError.response?.data ||
            profileError.message
        );

        if (
          profileError.response?.status ===
          401
        ) {
          await signOut();
          return;
        }

        const savedUser =
          await AsyncStorage.getItem(
            '@doalize_user'
          );

        if (savedUser) {
          setUser(
            JSON.parse(savedUser)
          );
        }
      }
    } catch (error) {
      console.log(
        'ERRO AO CARREGAR USUÁRIO:',
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function signIn(
    email,
    password
  ) {
    try {
      const response =
        await api.post(
          '/auth/login',
          {
            email:
              email.trim().toLowerCase(),
            password,
          }
        );

      const {
        token,
        user: loggedUser,
      } = response.data;

      await AsyncStorage.setItem(
        '@doalize_token',
        token
      );

      api.defaults.headers.Authorization =
        `Bearer ${token}`;

      await saveUser(loggedUser);

      return {
        success: true,
        user: loggedUser,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Erro ao fazer login.',
      };
    }
  }

  async function signUp(data) {
    try {
      const response =
        await api.post(
          '/auth/register',
          data
        );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Erro ao cadastrar usuário.',
      };
    }
  }

  async function signOut() {
    await AsyncStorage.multiRemove([
      '@doalize_token',
      '@doalize_user',
    ]);

    delete api.defaults
      .headers.Authorization;

    setUser(null);
  }

  async function updateUser(
    userData
  ) {
    await saveUser(userData);
  }

  async function refreshUser() {
    const response =
      await api.get(
        '/users/profile'
      );

    await saveUser(
      response.data
    );

    return response.data;
  }

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signed: Boolean(user),
        signIn,
        signUp,
        signOut,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}