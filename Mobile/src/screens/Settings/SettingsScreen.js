import React, {
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';

import * as ImagePicker
  from 'expo-image-picker';

import Header from '../../components/Header';

import Input from '../../components/Input';

import Button from '../../components/Button';

import {
  useTheme,
} from '../../hooks/useTheme';

import {
  useAuth,
} from '../../hooks/useAuth';

import api from '../../services/api';

import {
  DEFAULT_AVATAR,
  resolveImageUrl,
} from '../../utils/imageHelper';

import styles from './styles';


export default function SettingsScreen() {

  const { theme } =
    useTheme();

  const {
    user,
    updateUser,
    signOut,
  } =
    useAuth();


  const [
    name,
    setName,
  ] = useState(
    user?.name || ''
  );


  const [
    email,
    setEmail,
  ] = useState(
    user?.email || ''
  );


  const [
    password,
    setPassword,
  ] = useState('');


  const [
    location,
    setLocation,
  ] = useState(
    user?.location || ''
  );


  const [
    selectedPhoto,
    setSelectedPhoto,
  ] = useState(
    null
  );


  const [
    loading,
    setLoading,
  ] = useState(false);


  // FOTO ATUAL
  const currentPhoto =
    selectedPhoto ||
    (
      user?.photo
        ? resolveImageUrl(
            user.photo
          )
        : null
    );


  // ESCOLHER NOVA FOTO
  async function handlePickPhoto() {

    try {

      const result =
        await ImagePicker.launchImageLibraryAsync({

          mediaTypes:
            ImagePicker.MediaTypeOptions.Images,

          allowsEditing:
            true,

          aspect:
            [1, 1],

          quality:
            0.8,
        });


      if (
        result.canceled
      ) {
        return;
      }


      const imageUri =
        result.assets?.[0]?.uri;


      if (!imageUri) {
        return;
      }


      setSelectedPhoto(
        imageUri
      );

    } catch (error) {

      console.log(
        'ERRO AO ESCOLHER FOTO:',
        error
      );


      Alert.alert(
        'Erro',
        'Não foi possível selecionar a foto.'
      );
    }
  }


  // UPLOAD DA FOTO
  async function uploadProfilePhoto(
    uri
  ) {

    const fileName =
      uri
        .split('/')
        .pop() ||
      `profile-${Date.now()}.jpg`;


    const extension =
      fileName
        .split('.')
        .pop()
        ?.toLowerCase();


    let mimeType =
      'image/jpeg';


    if (
      extension === 'png'
    ) {
      mimeType =
        'image/png';
    }


    if (
      extension === 'webp'
    ) {
      mimeType =
        'image/webp';
    }


    const formData =
      new FormData();


    formData.append(
      'file',
      {
        uri,

        name:
          fileName,

        type:
          mimeType,
      }
    );


    const response =
      await api.post(
        '/upload',
        formData,
        {
          timeout:
            30000,

          headers: {
            Accept:
              'application/json',
          },
        }
      );


    return response
      .data
      ?.file
      ?.url;
  }


  // SALVAR
  async function handleSave() {

    try {

      setLoading(true);


      let photo =
        user?.photo ||
        null;


      // SE ESCOLHEU NOVA FOTO
      if (
        selectedPhoto
      ) {

        photo =
          await uploadProfilePhoto(
            selectedPhoto
          );


        if (!photo) {

          throw new Error(
            'O servidor não retornou a foto.'
          );
        }
      }


      const response =
        await api.put(
          '/users/update',
          {
            name:
              name.trim(),

            email:
              email.trim(),

            password:
              password.trim()
                ? password.trim()
                : undefined,

            photo,

            location:
              location.trim(),
          }
        );


      const updatedUser =
        response.data?.user;


      if (!updatedUser) {

        throw new Error(
          'Usuário atualizado não foi retornado pela API.'
        );
      }


      await updateUser(
        updatedUser
      );


      setSelectedPhoto(
        null
      );

      setPassword('');


      Alert.alert(
        'Sucesso',
        'Dados atualizados.'
      );


    } catch (error) {

      console.log(
        'ERRO AO ATUALIZAR PERFIL:',
        error.response?.data ||
        error.message
      );


      Alert.alert(
        'Erro',
        error.response?.data
          ?.message ||
          error.message ||
          'Não foi possível salvar.'
      );


    } finally {

      setLoading(false);
    }
  }


  // SAIR
  function handleLogout() {

    Alert.alert(
      'Sair da conta',
      'Deseja realmente sair?',
      [
        {
          text:
            'Cancelar',

          style:
            'cancel',
        },

        {
          text:
            'Sair',

          onPress:
            signOut,
        },
      ]
    );
  }


  // EXCLUIR
  function handleDeleteAccount() {

    Alert.alert(
      'Excluir conta',
      'Essa ação não poderá ser desfeita.',
      [
        {
          text:
            'Cancelar',

          style:
            'cancel',
        },

        {
          text:
            'Excluir',

          style:
            'destructive',

          onPress:
            signOut,
        },
      ]
    );
  }


  return (

    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >

      {/* HEADER */}

      <Header
        title="Configurações"
        showBackButton
      />


      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* FOTO */}

        <Text
          style={[
            styles.label,
            {
              color:
                theme.text,
            },
          ]}
        >
          Foto de perfil
        </Text>


        <View
          style={{
            alignItems:
              'center',

            marginBottom:
              24,
          }}
        >

          <Image
            source={
              currentPhoto
                ? {
                    uri:
                      currentPhoto,
                  }
                : DEFAULT_AVATAR
            }
            style={{
              width:
                120,

              height:
                120,

              borderRadius:
                60,

              marginBottom:
                12,
            }}
          />


          <TouchableOpacity
            activeOpacity={
              0.8
            }
            onPress={
              handlePickPhoto
            }
            style={{
              paddingHorizontal:
                18,

              paddingVertical:
                10,

              borderRadius:
                10,

              backgroundColor:
                theme.primary,
            }}
          >

            <Text
              style={{
                color:
                  '#ffffff',

                fontWeight:
                  '700',
              }}
            >
              Alterar foto
            </Text>

          </TouchableOpacity>

        </View>


        {/* NOME */}

        <Text
          style={[
            styles.label,
            {
              color:
                theme.text,
            },
          ]}
        >
          Nome
        </Text>


        <Input
          placeholder="Nome"

          value={
            name
          }

          onChangeText={
            setName
          }
        />


        {/* EMAIL */}

        <Text
          style={[
            styles.label,
            {
              color:
                theme.text,
            },
          ]}
        >
          E-mail
        </Text>


        <Input
          placeholder="E-mail"

          value={
            email
          }

          onChangeText={
            setEmail
          }

          keyboardType=
            "email-address"
        />


        {/* SENHA */}

        <Text
          style={[
            styles.label,
            {
              color:
                theme.text,
            },
          ]}
        >
          Nova senha
        </Text>


        <Input
          placeholder="Nova senha"

          value={
            password
          }

          onChangeText={
            setPassword
          }

          secureTextEntry
        />


        {/* LOCALIZAÇÃO */}

        <Text
          style={[
            styles.label,
            {
              color:
                theme.text,
            },
          ]}
        >
          Localização
        </Text>


        <Input
          placeholder="Sua localização"

          value={
            location
          }

          onChangeText={
            setLocation
          }
        />


        {/* SALVAR */}

        <Button
          title="Salvar alterações"

          onPress={
            handleSave
          }

          loading={
            loading
          }
        />


        {/* SAIR */}

        <Button
          title="Sair da conta"

          onPress={
            handleLogout
          }

          type="secondary"
        />


        {/* EXCLUIR */}

        <Button
          title="Excluir conta"

          onPress={
            handleDeleteAccount
          }

          type="danger"
        />

      </ScrollView>

    </View>
  );
}