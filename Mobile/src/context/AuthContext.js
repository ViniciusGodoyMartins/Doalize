import React, {
  createContext,
  useState,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../services/api';


export const AuthContext =
  createContext({});


export function AuthProvider({
  children,
}) {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  // =========================
  // CARREGAR USUÁRIO
  // =========================

  async function loadUser() {

    try {

      const token =
        await AsyncStorage.getItem(
          '@doalize_token'
        );


      if (!token) {
        return;
      }


      api.defaults.headers.Authorization =
        `Bearer ${token}`;


      // BUSCA O USUÁRIO ATUAL NO BACKEND
      // Isso evita usar dados antigos do AsyncStorage
      try {

        const response =
          await api.get(
            '/users/profile'
          );


        const currentUser =
          response.data;


        await AsyncStorage.setItem(
          '@doalize_user',
          JSON.stringify(
            currentUser
          )
        );


        setUser(
          currentUser
        );


      } catch (
        profileError
      ) {

        console.log(
          'Erro ao buscar perfil:',
          profileError.response?.data ||
          profileError.message
        );


        // FALLBACK:
        // se a API falhar, usa o usuário salvo localmente
        const userData =
          await AsyncStorage.getItem(
            '@doalize_user'
          );


        if (userData) {

          setUser(
            JSON.parse(
              userData
            )
          );
        }
      }


    } catch (error) {

      console.log(
        'Erro ao carregar usuário:',
        error
      );

    } finally {

      setLoading(false);
    }
  }


  // =========================
  // LOGIN
  // =========================

  async function signIn(
    email,
    password
  ) {

    try {

      const response =
        await api.post(
          '/auth/login',
          {
            email,
            password,
          }
        );


      const {
        token,
        user,
      } =
        response.data;


      await AsyncStorage.setItem(
        '@doalize_token',
        token
      );


      api.defaults.headers.Authorization =
        `Bearer ${token}`;


      // SALVA O USUÁRIO NOVO
      await AsyncStorage.setItem(
        '@doalize_user',
        JSON.stringify(user)
      );


      setUser({
        ...user,
      });


      return {
        success: true,
        user,
      };


    } catch (error) {

      return {
        success: false,

        message:
          error.response?.data?.message ||
          'Erro ao fazer login',
      };
    }
  }


  // =========================
  // CADASTRO
  // =========================

  async function signUp(
    data
  ) {

    try {

      const response =
        await api.post(
          '/auth/register',
          data
        );


      return {
        success: true,
        data:
          response.data,
      };


    } catch (error) {

      return {
        success: false,

        message:
          error.response?.data?.message ||
          'Erro ao cadastrar usuário',
      };
    }
  }


  // =========================
  // LOGOUT
  // =========================

  async function signOut() {

    await AsyncStorage.removeItem(
      '@doalize_token'
    );

    await AsyncStorage.removeItem(
      '@doalize_user'
    );


    delete api.defaults.headers.Authorization;


    setUser(null);
  }


  // =========================
  // ATUALIZAR USUÁRIO
  // =========================

  async function updateUser(
    userData
  ) {

    setUser(
      userData
    );


    await AsyncStorage.setItem(
      '@doalize_user',
      JSON.stringify(
        userData
      )
    );
  }


  // =========================
  // INIT
  // =========================

  useEffect(() => {

    loadUser();

  }, []);


  return (

    <AuthContext.Provider
      value={{
        user,
        loading,
        signed:
          !!user,

        signIn,
        signUp,
        signOut,

        updateUser,
      }}
    >

      {children}

    </AuthContext.Provider>
  );
}