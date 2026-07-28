import React, { useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';

import { useTheme } from '../../hooks/useTheme';

import api from '../../services/api';

import styles from './styles';

function createFileData(asset, index) {
  const uri = asset.uri;

  const uriFileName = uri
    ? uri.split('/').pop()
    : null;

  const fileName =
    asset.fileName ||
    uriFileName ||
    `imagem-${Date.now()}-${index}.jpg`;

  const extension = fileName
    .split('.')
    .pop()
    .toLowerCase();

  let mimeType = asset.mimeType;

  if (!mimeType) {
    if (extension === 'png') {
      mimeType = 'image/png';
    } else if (extension === 'webp') {
      mimeType = 'image/webp';
    } else {
      mimeType = 'image/jpeg';
    }
  }

  return {
    uri:
      Platform.OS === 'ios'
        ? uri.replace('file://', '')
        : uri,
    name: fileName,
    type: mimeType,
  };
}

export default function PublishScreen() {
  const { theme } = useTheme();

  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function handlePickImages() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Permita que o Doalize acesse suas imagens.'
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes:
            ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
          quality: 0.8,
        });

      if (!result.canceled) {
        setImages(result.assets || []);
      }
    } catch (error) {
      console.log(
        'ERRO AO SELECIONAR IMAGEM:',
        error
      );

      Alert.alert(
        'Erro',
        'Não foi possível selecionar as imagens.'
      );
    }
  }

  function handleRemoveImage(indexToRemove) {
    setImages((currentImages) =>
      currentImages.filter(
        (_, index) => index !== indexToRemove
      )
    );
  }

  async function uploadImages() {
    const uploadedImages = [];

    for (let index = 0; index < images.length; index += 1) {
      const asset = images[index];

      const fileData = createFileData(
        asset,
        index
      );

      const formData = new FormData();

      formData.append('file', fileData);

      console.log(
        'ENVIANDO ARQUIVO:',
        fileData
      );

      const response = await api.post(
        '/upload',
        formData,
        {
          timeout: 30000,
          headers: {
            Accept: 'application/json',
          },
        }
      );

      console.log(
        'RESPOSTA DO UPLOAD:',
        response.data
      );

      const imagePath =
        response.data?.file?.path ||
        response.data?.file?.url;

      if (!imagePath) {
        throw new Error(
          'O servidor não retornou o caminho da imagem.'
        );
      }

      uploadedImages.push(imagePath);
    }

    return uploadedImages;
  }

  async function handlePublish() {
    if (!description.trim()) {
      Alert.alert(
        'Atenção',
        'Digite uma descrição.'
      );

      return;
    }

    try {
      setLoading(true);

      let uploadedImages = [];

      if (images.length > 0) {
        uploadedImages =
          await uploadImages();
      }

      const response = await api.post(
        '/posts',
        {
          description: description.trim(),
          images: uploadedImages,
        }
      );

      console.log(
        'POST CRIADO:',
        response.data
      );

      Alert.alert(
        'Sucesso',
        'Publicação criada com sucesso.'
      );

      setImages([]);
      setDescription('');
    } catch (error) {
      console.log(
        'ERRO AO PUBLICAR:',
        error.response?.data ||
          error.message
      );

      Alert.alert(
        'Erro',
        error.response?.data?.message ||
          error.message ||
          'Não foi possível criar a publicação.'
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
          backgroundColor: theme.background,
        },
      ]}
    >
      <Header title="Publicar" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            Imagens (opcional)
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePickImages}
            disabled={loading}
            style={[
              styles.imagePicker,
              {
                backgroundColor: theme.card,
                borderColor:
                  theme.border || '#cccccc',
              },
            ]}
          >
            <Ionicons
              name="image-outline"
              size={40}
              color={theme.primary}
            />

            <Text
              style={[
                styles.imagePickerText,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              Selecionar imagens
            </Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.previewContainer}
          >
            {images.map((image, index) => (
              <View
                key={`${image.uri}-${index}`}
                style={{
                  position: 'relative',
                  marginRight: 10,
                }}
              >
                <Image
                  source={{
                    uri: image.uri,
                  }}
                  style={styles.previewImage}
                />

                <TouchableOpacity
                  onPress={() =>
                    handleRemoveImage(index)
                  }
                  disabled={loading}
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor:
                      'rgba(0, 0, 0, 0.75)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name="close"
                    size={18}
                    color="#ffffff"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            Descrição
          </Text>

          <Input
            placeholder="Descreva sua publicação..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            editable={!loading}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Publicar"
            onPress={handlePublish}
            loading={loading}
          />
        </View>
      </ScrollView>
    </View>
  );
}