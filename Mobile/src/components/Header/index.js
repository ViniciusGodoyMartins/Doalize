import React from 'react';

import {
  View,
  TouchableOpacity,
  Image,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useNavigation,
} from '@react-navigation/native';

import Animated, {
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated';

import {
  useTheme,
} from '../../hooks/useTheme';

import styles from './styles';

import logoModoEscuro from '../../../assets/logo.png';
import logoModoClaro from '../../../assets/logomodoclaro.png';


const AnimatedIonicons =
  Animated.createAnimatedComponent(Ionicons);


export default function Header({
  title,
  showBackButton = false,
  onBackPress = null,
  rightIcon = null,
  onRightPress = null,
}) {
  const navigation = useNavigation();

  const {
    themeProgress,
  } = useTheme();


  /*
   * As cores usam o mesmo progresso do ProfileScreen.
   * Nenhuma animação independente é iniciada aqui.
   */

  const animatedContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      ['#F5F5F5', '#141414']
    ),

    borderBottomColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      ['rgba(20, 20, 20, 0.45)', '#F5F5F5']
    ),
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      ['#141414', '#F5F5F5']
    ),
  }));


  /*
   * As duas logos ocupam a mesma área.
   * Apenas a opacidade muda durante a troca.
   */

  const animatedDarkLogoStyle = useAnimatedStyle(() => ({
    opacity: themeProgress.value,
  }));

  const animatedLightLogoStyle = useAnimatedStyle(() => ({
    opacity: 1 - themeProgress.value,
  }));


  function handleBackPress() {
    if (typeof onBackPress === 'function') {
      onBackPress();
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }


  function handleRightPress() {
    if (typeof onRightPress === 'function') {
      onRightPress();
    }
  }


  return (
    <Animated.View
      style={[
        styles.container,
        animatedContainerStyle,
      ]}
    >
      <View style={styles.leftContainer}>
        {showBackButton ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBackPress}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <AnimatedIonicons
              name="arrow-back"
              size={24}
              style={animatedIconStyle}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.centerContainer}>
        <View
          accessible
          accessibilityLabel={
            title ? `Doalize - ${title}` : 'Doalize'
          }
          style={styles.logoImage}
        >
          <Animated.Image
            source={logoModoClaro}
            resizeMode="contain"
            accessible={false}
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              },
              animatedLightLogoStyle,
            ]}
          />

          <Animated.Image
            source={logoModoEscuro}
            resizeMode="contain"
            accessible={false}
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              },
              animatedDarkLogoStyle,
            ]}
          />
        </View>
      </View>

      <View style={styles.rightContainer}>
        {rightIcon ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleRightPress}
            disabled={typeof onRightPress !== 'function'}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Ação do cabeçalho"
          >
            <AnimatedIonicons
              name={rightIcon}
              size={24}
              style={animatedIconStyle}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </Animated.View>
  );
}