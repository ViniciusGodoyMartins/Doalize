import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';

import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

import api from '../../services/api';

import {
  resolveImageUrl,
} from '../../utils/imageHelper';

import imageUserLight from '../../../assets/imageuserlight.png';
import imageUserDark from '../../../assets/imageuserdark.png';

import styles from './styles';

function createPhotoFile(asset) {
  const uri = asset?.uri;

  const fileName =
    asset?.fileName ||
    uri?.split('/').pop() ||
    `profile-${Date.now()}.jpg`;

  const extension = fileName
    .split('.')
    .pop()
    ?.toLowerCase();

  let mimeType = asset?.mimeType;

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

export default function SettingsScreen() {
  const {
    theme,
    darkMode,
  } = useTheme();

  const {
    user,
    updateUser,
    signOut,
  } = useAuth();

  const [name, setName] = useState(
    user?.name || ''
  );

  const [email, setEmail] = useState(
    user?.email || ''
  );

  const [
    description,
    setDescription,
  ] = useState(
    user?.description || ''
  );

  const [
    location,
    setLocation,
  ] = useState(
    user?.location || ''
  );

  const [
    selectedPhoto,
    setSelectedPhoto,
  ] = useState(null);

  const [
    remotePhotoFailed,
    setRemotePhotoFailed,
  ] = useState(false);

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(false);

  const [
    passwordSectionVisible,
    setPasswordSectionVisible,
  ] = useState(false);

  const [
    verificationCode,
    setVerificationCode,
  ] = useState('');

  const [
    newPassword,
    setNewPassword,
  ] = useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [
    requestingCode,
    setRequestingCode,
  ] = useState(false);

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  const [
    deletingAccount,
    setDeletingAccount,
  ] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setDescription(
      user?.description || ''
    );
    setLocation(
      user?.location || ''
    );
    setRemotePhotoFailed(false);
  }, [user]);

  const defaultAvatar = useMemo(() => {
    return darkMode
      ? imageUserLight
      : imageUserDark;
  }, [darkMode]);

  const remotePhotoUrl = useMemo(() => {
    if (
      !user?.photo ||
      typeof user.photo !== 'string' ||
      !user.photo.trim()
    ) {
      return null;
    }

    return resolveImageUrl(
      user.photo
    );
  }, [user?.photo]);

  const avatarSource = useMemo(() => {
    if (selectedPhoto?.uri) {
      return {
        uri: selectedPhoto.uri,
      };
    }

    if (
      remotePhotoUrl &&
      !remotePhotoFailed
    ) {
      return {
        uri: remotePhotoUrl,
      };
    }

    return defaultAvatar;
  }, [
    selectedPhoto,
    remotePhotoUrl,
    remotePhotoFailed,
    defaultAvatar,
  ]);

  const isUsingDefaultAvatar =
    !selectedPhoto?.uri &&
    (!remotePhotoUrl ||
      remotePhotoFailed);

  async function handlePickPhoto() {
    try {
      const permission =
        await ImagePicker
          .requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Permita que o Doalize acesse suas imagens.'
        );

        return;
      }

      const result =
        await ImagePicker
          .launchImageLibraryAsync({
            mediaTypes:
              ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

      if (result.canceled) {
        return;
      }

      const asset =
        result.assets?.[0];

      if (!asset?.uri) {
        Alert.alert(
          'Erro',
          'A imagem selecionada é inválida.'
        );

        return;
      }

      setSelectedPhoto(asset);
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

  async function uploadProfilePhoto(
    asset
  ) {
    const formData = new FormData();

    formData.append(
      'file',
      createPhotoFile(asset)
    );

    const response = await api.post(
      '/upload/user',
      formData,
      {
        timeout: 30000,
        headers: {
          Accept: 'application/json',
        },
      }
    );

    return (
      response.data?.file?.path ||
      response.data?.file?.url ||
      null
    );
  }

  async function handleSaveProfile() {
    if (!name.trim()) {
      Alert.alert(
        'Atenção',
        'Digite seu nome.'
      );

      return;
    }

    if (!email.trim()) {
      Alert.alert(
        'Atenção',
        'Digite seu e-mail.'
      );

      return;
    }

    try {
      setProfileLoading(true);

      let photo =
        user?.photo || null;

      if (selectedPhoto) {
        photo =
          await uploadProfilePhoto(
            selectedPhoto
          );

        if (!photo) {
          throw new Error(
            'O servidor não retornou o caminho da foto.'
          );
        }
      }

      const response = await api.put(
        '/users/update',
        {
          name: name.trim(),
          email:
            email.trim().toLowerCase(),
          photo,
          description:
            description.trim(),
          location:
            location.trim(),
        }
      );

      const updatedUser =
        response.data?.user;

      if (!updatedUser) {
        throw new Error(
          'O servidor não retornou o usuário atualizado.'
        );
      }

      await updateUser(updatedUser);

      setSelectedPhoto(null);
      setRemotePhotoFailed(false);

      Alert.alert(
        'Sucesso',
        'Perfil atualizado com sucesso.'
      );
    } catch (error) {
      console.log(
        'ERRO AO ATUALIZAR PERFIL:',
        error.response?.data ||
          error.message
      );

      Alert.alert(
        'Erro',
        error.response?.data?.message ||
          error.message ||
          'Não foi possível atualizar o perfil.'
      );
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleRequestCode() {
    try {
      setRequestingCode(true);

      const response = await api.post(
        '/users/password/request-code'
      );

      setPasswordSectionVisible(true);

      Alert.alert(
        'Código enviado',
        response.data?.message ||
          'Verifique seu e-mail.'
      );
    } catch (error) {
      console.log(
        'ERRO AO SOLICITAR CÓDIGO:',
        error.response?.data ||
          error.message
      );

      Alert.alert(
        'Erro',
        error.response?.data?.message ||
          'Não foi possível enviar o código.'
      );
    } finally {
      setRequestingCode(false);
    }
  }

  async function handleChangePassword() {
    if (
      !verificationCode.trim()
    ) {
      Alert.alert(
        'Atenção',
        'Digite o código enviado ao seu e-mail.'
      );

      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        'Atenção',
        'A nova senha deve possuir pelo menos 6 caracteres.'
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      Alert.alert(
        'Atenção',
        'As senhas não coincidem.'
      );

      return;
    }

    try {
      setChangingPassword(true);

      const response = await api.post(
        '/users/password/confirm',
        {
          code:
            verificationCode.trim(),
          newPassword,
          confirmPassword,
        }
      );

      setVerificationCode('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSectionVisible(false);

      Alert.alert(
        'Sucesso',
        response.data?.message ||
          'Senha alterada com sucesso.'
      );
    } catch (error) {
      console.log(
        'ERRO AO ALTERAR SENHA:',
        error.response?.data ||
          error.message
      );

      Alert.alert(
        'Erro',
        error.response?.data?.message ||
          'Não foi possível alterar a senha.'
      );
    } finally {
      setChangingPassword(false);
    }
  }

  function handleLogout() {
    Alert.alert(
      'Sair da conta',
      'Deseja realmente sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          onPress: signOut,
        },
      ]
    );
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Excluir conta',
      'Todos os dados da conta serão removidos. Essa ação não poderá ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress:
            confirmDeleteAccount,
        },
      ]
    );
  }

  async function confirmDeleteAccount() {
    try {
      setDeletingAccount(true);

      await api.delete(
        '/users/delete'
      );

      await signOut();
    } catch (error) {
      console.log(
        'ERRO AO EXCLUIR CONTA:',
        error.response?.data ||
          error.message
      );

      Alert.alert(
        'Erro',
        error.response?.data?.message ||
          'Não foi possível excluir a conta.'
      );
    } finally {
      setDeletingAccount(false);
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
        title="Configurações"
        showBackButton
      />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text,
            },
          ]}
        >
          Perfil
        </Text>

        <View
          style={
            styles.photoContainer
          }
        >
          <View
            style={
              styles.avatarContainer
            }
          >
            <Image
              source={avatarSource}
              style={
                isUsingDefaultAvatar
                  ? styles.defaultAvatar
                  : styles.avatar
              }
              resizeMode={
                isUsingDefaultAvatar
                  ? 'contain'
                  : 'cover'
              }
              onError={() =>
                setRemotePhotoFailed(
                  true
                )
              }
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePickPhoto}
            disabled={profileLoading}
            style={[
              styles.changePhotoButton,
              {
                backgroundColor:
                  theme.primary,
              },
            ]}
          >
            <Text
              style={
                styles.changePhotoText
              }
            >
              Alterar foto
            </Text>
          </TouchableOpacity>

          {selectedPhoto ? (
            <TouchableOpacity
              onPress={() =>
                setSelectedPhoto(null)
              }
              style={
                styles.cancelPhotoButton
              }
            >
              <Text
                style={{
                  color:
                    theme.textSecondary,
                }}
              >
                Cancelar nova foto
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Text
          style={[
            styles.label,
            {
              color: theme.text,
            },
          ]}
        >
          Nome
        </Text>

        <Input
          placeholder="Seu nome"
          value={name}
          onChangeText={setName}
          editable={!profileLoading}
          maxLength={120}
        />

        <Text
          style={[
            styles.label,
            {
              color: theme.text,
            },
          ]}
        >
          E-mail
        </Text>

        <Input
          placeholder="Seu e-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!profileLoading}
          maxLength={255}
        />

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
          placeholder="Conte um pouco sobre você..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          editable={!profileLoading}
          maxLength={500}
          textAlignVertical="top"
        />

        <Text
          style={[
            styles.characterCount,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          {description.length}/500
        </Text>

        <Text
          style={[
            styles.label,
            {
              color: theme.text,
            },
          ]}
        >
          Localização
        </Text>

        <Input
          placeholder="Cidade, estado ou região"
          value={location}
          onChangeText={setLocation}
          editable={!profileLoading}
          maxLength={255}
        />

        <Button
          title="Salvar alterações"
          onPress={
            handleSaveProfile
          }
          loading={profileLoading}
        />

        <View
          style={[
            styles.divider,
            {
              backgroundColor:
                theme.border,
            },
          ]}
        />

        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text,
            },
          ]}
        >
          Segurança
        </Text>

        <Text
          style={[
            styles.helperText,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Para alterar sua senha, enviaremos um código de verificação ao e-mail cadastrado.
        </Text>

        <Button
          title="Enviar código por e-mail"
          onPress={handleRequestCode}
          loading={requestingCode}
          disabled={
            changingPassword
          }
          type="secondary"
        />

        {passwordSectionVisible ? (
          <View
            style={
              styles.passwordSection
            }
          >
            <Text
              style={[
                styles.label,
                {
                  color: theme.text,
                },
              ]}
            >
              Código de verificação
            </Text>

            <Input
              placeholder="Digite o código de 6 dígitos"
              value={verificationCode}
              onChangeText={(value) =>
                setVerificationCode(
                  value.replace(
                    /\D/g,
                    ''
                  )
                )
              }
              keyboardType="number-pad"
              maxLength={6}
              editable={
                !changingPassword
              }
            />

            <Text
              style={[
                styles.label,
                {
                  color: theme.text,
                },
              ]}
            >
              Nova senha
            </Text>

            <Input
              placeholder="Mínimo de 6 caracteres"
              value={newPassword}
              onChangeText={
                setNewPassword
              }
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={
                !changingPassword
              }
            />

            <Text
              style={[
                styles.label,
                {
                  color: theme.text,
                },
              ]}
            >
              Confirmar nova senha
            </Text>

            <Input
              placeholder="Digite novamente"
              value={
                confirmPassword
              }
              onChangeText={
                setConfirmPassword
              }
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={
                !changingPassword
              }
            />

            <Button
              title="Confirmar nova senha"
              onPress={
                handleChangePassword
              }
              loading={
                changingPassword
              }
            />
          </View>
        ) : null}

        <View
          style={[
            styles.divider,
            {
              backgroundColor:
                theme.border,
            },
          ]}
        />

        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text,
            },
          ]}
        >
          Conta
        </Text>

        <Button
          title="Sair da conta"
          onPress={handleLogout}
          type="secondary"
        />

        <Button
          title="Excluir conta"
          onPress={
            handleDeleteAccount
          }
          loading={
            deletingAccount
          }
          type="danger"
        />
      </ScrollView>
    </View>
  );
}