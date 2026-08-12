import React, {
  useState,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';

import * as ImagePicker
  from 'expo-image-picker';

import AsyncStorage
  from '@react-native-async-storage/async-storage';

import {
  Ionicons,
} from '@expo/vector-icons';

import Header
  from '../../components/Header';

import Input
  from '../../components/Input';

import Button
  from '../../components/Button';

import {
  useTheme,
} from '../../hooks/useTheme';

import api
  from '../../services/api';

import styles
  from './styles';


export default function PublishScreen() {

  const { theme } =
    useTheme();

  const [images, setImages] =
    useState([]);

  const [
    description,
    setDescription,
  ] = useState('');

  const [loading, setLoading] =
    useState(false);


  // =========================
  // SELECIONAR IMAGENS
  // =========================

  async function handlePickImages() {

    try {

      const result =
        await ImagePicker.launchImageLibraryAsync({

          mediaTypes:
            ImagePicker.MediaTypeOptions.Images,

          allowsMultipleSelection:
            true,

          quality:
            0.7,
        });


      if (
        result.canceled
      ) {
        return;
      }


      const selectedImages =
        result.assets.map(
          (asset) =>
            asset.uri
        );


      setImages(
        selectedImages
      );


    } catch (error) {

      console.log(
        'ERRO IMAGE PICKER:',
        error
      );


      Alert.alert(
        'Erro',
        'Não foi possível selecionar a imagem.'
      );
    }
  }


  // =========================
  // MIME TYPE
  // =========================

  function getMimeType(uri) {

    const cleanUri =
      uri.split('?')[0];


    const extension =
      cleanUri
        .split('.')
        .pop()
        ?.toLowerCase();


    if (
      extension === 'png'
    ) {
      return 'image/png';
    }


    if (
      extension === 'webp'
    ) {
      return 'image/webp';
    }


    return 'image/jpeg';
  }


  // =========================
  // UPLOAD
  // =========================

  async function uploadImages() {

    const uploadedUrls =
      [];


    const token =
      await AsyncStorage.getItem(
        '@doalize_token'
      );


    if (!token) {

      throw new Error(
        'Usuário não autenticado.'
      );
    }


    for (
      let index = 0;
      index < images.length;
      index++
    ) {

      const uri =
        images[index];


      const extension =
        uri
          .split('?')[0]
          .split('.')
          .pop()
          ?.toLowerCase() ||
        'jpg';


      let mimeType =
        getMimeType(uri);


      if (
        extension === 'jpg' ||
        extension === 'jpeg'
      ) {
        mimeType =
          'image/jpeg';
      }


      const fileName =
        `post-${Date.now()}-${index}.${extension}`;


      const formData =
        new FormData();


      formData.append(
        'file',
        {
          uri:
            uri,

          name:
            fileName,

          type:
            mimeType,
        }
      );


      const uploadUrl =
        `${api.defaults.baseURL}/upload`;


      console.log(
        '===================================='
      );

      console.log(
        'INICIANDO UPLOAD'
      );

      console.log(
        'UPLOAD URL:',
        uploadUrl
      );

      console.log(
        'URI:',
        uri
      );

      console.log(
        'FILE NAME:',
        fileName
      );

      console.log(
        'MIME:',
        mimeType
      );


      let response;


      try {

        response =
          await fetch(
            uploadUrl,
            {
              method:
                'POST',

              headers: {
                Accept:
                  'application/json',

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                formData,
            }
          );


      } catch (networkError) {

        console.log(
          '===================================='
        );

        console.log(
          'NETWORK ERROR NO FETCH'
        );

        console.log(
          networkError
        );

        console.log(
          'MESSAGE:',
          networkError.message
        );

        console.log(
          'UPLOAD URL:',
          uploadUrl
        );

        console.log(
          '===================================='
        );


        throw new Error(
          `Erro de rede no upload: ${networkError.message}`
        );
      }


      const responseText =
        await response.text();


      console.log(
        'UPLOAD STATUS:',
        response.status
      );


      console.log(
        'UPLOAD RESPONSE:',
        responseText
      );


      let responseData =
        null;


      try {

        responseData =
          responseText
            ? JSON.parse(
                responseText
              )
            : null;

      } catch {

        responseData =
          null;
      }


      if (
        !response.ok
      ) {

        throw new Error(
          responseData?.message ||
          `Erro no upload (${response.status})`
        );
      }


      if (
        !responseData?.file?.url
      ) {

        throw new Error(
          'O servidor não retornou a URL da imagem.'
        );
      }


      uploadedUrls.push(
        responseData.file.url
      );


      console.log(
        'UPLOAD CONCLUÍDO:',
        responseData.file.url
      );
    }


    return uploadedUrls;
  }


  // =========================
  // PUBLICAR
  // =========================

  async function handlePublish() {

    if (
      !description.trim()
    ) {

      Alert.alert(
        'Atenção',
        'Digite uma descrição.'
      );

      return;
    }


    try {

      setLoading(true);


      let uploadedImages =
        [];


      // UPLOAD DAS IMAGENS

      if (
        images.length > 0
      ) {

        uploadedImages =
          await uploadImages();
      }


      console.log(
        'IMAGENS UPLOADADAS:',
        uploadedImages
      );


      // CRIAÇÃO DO POST

      const response =
        await api.post(
          '/posts',
          {
            description:
              description.trim(),

            images:
              uploadedImages,
          }
        );


      console.log(
        'POST CRIADO:',
        response.data
      );


      Alert.alert(
        'Sucesso',
        'Publicação criada.'
      );


      setImages([]);

      setDescription('');


    } catch (error) {

      console.log(
        '===================================='
      );

      console.log(
        'ERRO AO PUBLICAR'
      );

      console.log(
        'MESSAGE:',
        error.message
      );

      console.log(
        'RESPONSE:',
        error.response?.data
      );

      console.log(
        'STATUS:',
        error.response?.status
      );

      console.log(
        '===================================='
      );


      Alert.alert(
        'Erro',
        error.message ||
        'Não foi possível publicar.'
      );


    } finally {

      setLoading(false);
    }
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

      <Header
        title="Publicar"
      />


      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* IMAGENS */}

        <View
          style={
            styles.section
          }
        >

          <Text
            style={[
              styles.label,
              {
                color:
                  theme.text,
              },
            ]}
          >
            Imagens (Opcional)
          </Text>


          <TouchableOpacity
            activeOpacity={
              0.8
            }

            onPress={
              handlePickImages
            }

            style={[
              styles.imagePicker,
              {
                backgroundColor:
                  theme.card,

                borderColor:
                  theme.border,
              },
            ]}
          >

            <Ionicons
              name="image-outline"
              size={40}
              color={
                theme.primary
              }
            />


            <Text
              style={[
                styles.imagePickerText,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              Selecionar imagens
            </Text>

          </TouchableOpacity>


          {/* PREVIEW */}

          <ScrollView
            horizontal

            showsHorizontalScrollIndicator={
              false
            }

            style={
              styles.previewContainer
            }
          >

            {images.map(
              (
                image,
                index
              ) => (

                <Image
                  key={
                    index
                  }

                  source={{
                    uri:
                      image,
                  }}

                  style={
                    styles.previewImage
                  }
                />

              )
            )}

          </ScrollView>

        </View>


        {/* DESCRIÇÃO */}

        <View
          style={
            styles.section
          }
        >

          <Text
            style={[
              styles.label,
              {
                color:
                  theme.text,
              },
            ]}
          >
            Descrição
          </Text>


          <Input
            placeholder="Descreva sua publicação..."

            value={
              description
            }

            onChangeText={
              setDescription
            }

            multiline

            numberOfLines={
              6
            }
          />

        </View>


        {/* BOTÃO */}

        <View
          style={
            styles.buttonContainer
          }
        >

          <Button
            title="Publicar"

            onPress={
              handlePublish
            }

            loading={
              loading
            }
          />

        </View>

      </ScrollView>

    </View>
  );
}