import React from 'react';

import {
  View,
  StyleSheet,
} from 'react-native';

import {
  createMaterialTopTabNavigator,
  MaterialTopTabBar,
} from '@react-navigation/material-top-tabs';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';

import {
  FontAwesome6,
} from '@expo/vector-icons';

import Animated, {
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated';

import {
  useTheme,
} from '../hooks/useTheme';


/*
 * ============================================================
 * TELAS DO FEED
 * ============================================================
 */

import HomeScreen from '../screens/Home/HomeScreen';

import DetailsScreen from '../screens/Home/DetailsScreen';


/*
 * ============================================================
 * TELA DE PUBLICAÇÃO
 * ============================================================
 */

import PublishScreen from '../screens/Publish/PublishScreen';


/*
 * ============================================================
 * TELAS DE CONTATOS
 * ============================================================
 */

import ContactsScreen from '../screens/Contacts/ContactsScreen';

import ChatScreen from '../screens/Chat/ChatScreen';


/*
 * ============================================================
 * TELAS DO PERFIL
 * ============================================================
 */

import ProfileScreen from '../screens/Profile/ProfileScreen';

import PublishedScreen from '../screens/Profile/PublishedScreen';


/*
 * ============================================================
 * TELAS DE CONFIGURAÇÕES
 * ============================================================
 */

import SettingsScreen from '../screens/Settings/SettingsScreen';

import EmailChangeScreen from '../screens/Settings/EmailChangeScreen';

import TwoFactorSettingsScreen from '../screens/Settings/TwoFactorSettingsScreen';


/*
 * ============================================================
 * CORES
 * ============================================================
 */

const COLORS = {
  darkBackground:
    '#141414',

  darkInactiveIcon:
    '#F5F5F5',

  darkBorder:
    '#F5F5F5',

  darkPress:
    'rgba(245, 245, 245, 0.06)',

  lightBackground:
    '#F5F5F5',

  lightInactiveIcon:
    '#141414',

  lightBorder:
    'rgba(20, 20, 20, 0.45)',

  lightPress:
    'rgba(20, 20, 20, 0.06)',

  primary:
    '#3AC2F8',
};


/*
 * ============================================================
 * NAVEGADORES
 * ============================================================
 */

const Tab =
  createMaterialTopTabNavigator();

const Stack =
  createNativeStackNavigator();


/*
 * ============================================================
 * CONFIGURAÇÃO DAS PILHAS
 * ============================================================
 */

const stackScreenOptions = {
  headerShown:
    false,

  animation:
    'slide_from_right',

  gestureEnabled:
    true,
};


/*
 * ============================================================
 * PILHA DO FEED
 * ============================================================
 */

function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
      />

      <Stack.Screen
        name="DetailsScreen"
        component={DetailsScreen}
      />
    </Stack.Navigator>
  );
}


/*
 * ============================================================
 * PILHA DOS CONTATOS
 * ============================================================
 */

function ContactsStack() {
  return (
    <Stack.Navigator
      initialRouteName="ContactsScreen"
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen
        name="ContactsScreen"
        component={ContactsScreen}
      />

      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
      />
    </Stack.Navigator>
  );
}


/*
 * ============================================================
 * PILHA DO PERFIL
 * ============================================================
 */

function ProfileStack() {
  return (
    <Stack.Navigator
      initialRouteName="ProfileScreen"
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
      />

      <Stack.Screen
        name="PublishedScreen"
        component={PublishedScreen}
      />

      <Stack.Screen
        name="DetailsScreen"
        component={DetailsScreen}
      />

      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
      />

      <Stack.Screen
        name="EmailChangeScreen"
        component={EmailChangeScreen}
      />

      <Stack.Screen
        name="TwoFactorSettingsScreen"
        component={TwoFactorSettingsScreen}
      />
    </Stack.Navigator>
  );
}


/*
 * ============================================================
 * VERIFICAR SE A PILHA ESTÁ NA TELA PRINCIPAL
 * ============================================================
 */

function isStackOnMainScreen(
  route,
  mainScreenName
) {
  const focusedRouteName =
    getFocusedRouteNameFromRoute(route);

  if (!focusedRouteName) {
    return true;
  }

  return (
    focusedRouteName ===
    mainScreenName
  );
}


/*
 * ============================================================
 * FUNDO ANIMADO DO RODAPÉ
 * ============================================================
 *
 * A barra padrão continua sendo MaterialTopTabBar.
 *
 * A camada animada fica atrás dela, sem interceptar toques.
 * Não acrescenta altura, padding ou borda ao layout.
 */

function ThemeTabBar(props) {
  const {
    themeProgress,
  } = useTheme();

  const animatedBackgroundStyle =
    useAnimatedStyle(() => ({
      backgroundColor: interpolateColor(
        themeProgress.value,
        [0, 1],
        [
          COLORS.lightBackground,
          COLORS.darkBackground,
        ]
      ),

      borderTopColor: interpolateColor(
        themeProgress.value,
        [0, 1],
        [
          COLORS.lightBorder,
          COLORS.darkBorder,
        ]
      ),
    }));

  return (
    <View style={localStyles.tabBarContainer}>
      <Animated.View
        pointerEvents="none"
        style={[
          localStyles.tabBarBackground,
          animatedBackgroundStyle,
        ]}
      />

      <MaterialTopTabBar {...props} />
    </View>
  );
}


/*
 * ============================================================
 * COMPONENTE DO ÍCONE DA BARRA
 * ============================================================
 *
 * Mantém a propriedade color no FontAwesome6.
 *
 * Para os ícones não selecionados:
 * - versão escura para o modo claro;
 * - versão branca para o modo escuro.
 *
 * Apenas a opacidade das duas versões é animada.
 * Não há animação de cor diretamente no FontAwesome6.
 */

function TabIcon({
  name,
  color,
  size,
  solid,
  focused,
}) {
  const {
    themeProgress,
  } = useTheme();

  const animatedLightStyle =
    useAnimatedStyle(() => ({
      opacity:
        1 - themeProgress.value,
    }));

  const animatedDarkStyle =
    useAnimatedStyle(() => ({
      opacity:
        themeProgress.value,
    }));

  return (
    <View style={localStyles.iconContainer}>
      {focused ? (
        <FontAwesome6
          name={name}
          size={size}
          color={color}
          solid={solid}
        />
      ) : (
        <>
          <Animated.View
            pointerEvents="none"
            style={[
              localStyles.iconLayer,
              animatedLightStyle,
            ]}
          >
            <FontAwesome6
              name={name}
              size={size}
              color={COLORS.lightInactiveIcon}
              solid={solid}
            />
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[
              localStyles.iconLayer,
              animatedDarkStyle,
            ]}
          >
            <FontAwesome6
              name={name}
              size={size}
              color={COLORS.darkInactiveIcon}
              solid={solid}
            />
          </Animated.View>
        </>
      )}
    </View>
  );
}


/*
 * ============================================================
 * ROTAS DO APLICATIVO
 * ============================================================
 */

export default function AppRoutes() {
  /*
   * ==========================================================
   * TEMA
   * ==========================================================
   */

  const {
    darkMode,
  } = useTheme();


  /*
   * ==========================================================
   * CORES DO RODAPÉ
   * ==========================================================
   */

  const tabBarInactiveColor =
    darkMode
      ? COLORS.darkInactiveIcon
      : COLORS.lightInactiveIcon;

  const tabBarPressColor =
    darkMode
      ? COLORS.darkPress
      : COLORS.lightPress;


  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBarPosition="bottom"

      tabBar={(props) => (
        <ThemeTabBar {...props} />
      )}

      screenOptions={{
        /*
         * Navegação por gesto.
         */

        swipeEnabled:
          true,

        /*
         * Carregamento preguiçoso.
         */

        lazy:
          true,

        /*
         * Mostrar ícones.
         */

        tabBarShowIcon:
          true,

        /*
         * Não usar rolagem horizontal.
         */

        tabBarScrollEnabled:
          false,

        /*
         * Não mostrar os textos.
         */

        tabBarShowLabel:
          false,

        /*
         * ÍCONE SELECIONADO
         */

        tabBarActiveTintColor:
          COLORS.primary,

        /*
         * ÍCONE NÃO SELECIONADO
         */

        tabBarInactiveTintColor:
          tabBarInactiveColor,

        /*
         * BARRA INFERIOR
         *
         * Todas as medidas originais são mantidas.
         *
         * O fundo e a borda ficam transparentes aqui,
         * pois são desenhados pela camada animada atrás.
         */

        tabBarStyle: {
          height:
            64,

          minHeight:
            64,

          maxHeight:
            64,

          paddingTop:
            3,

          paddingBottom:
            3,

          paddingHorizontal:
            0,

          margin:
            0,

          backgroundColor:
            'transparent',

          borderTopWidth:
            1,

          borderTopColor:
            'transparent',

          borderBottomWidth:
            0,

          elevation:
            0,

          shadowColor:
            'transparent',

          shadowOffset: {
            width:
              0,

            height:
              0,
          },

          shadowOpacity:
            0,

          shadowRadius:
            0,

          overflow:
            'visible',
        },

        /*
         * INDICADOR DESATIVADO
         */

        tabBarIndicatorStyle: {
          height:
            0,

          backgroundColor:
            'transparent',

          opacity:
            0,
        },

        /*
         * ITENS DA BARRA
         */

        tabBarItemStyle: {
          flex:
            1,

          flexGrow:
            1,

          flexShrink:
            1,

          flexBasis:
            0,

          minWidth:
            0,

          height:
            58,

          minHeight:
            58,

          paddingHorizontal:
            0,

          paddingTop:
            1,

          paddingBottom:
            1,

          margin:
            0,

          justifyContent:
            'center',

          alignItems:
            'center',

          overflow:
            'visible',
        },

        /*
         * TEXTO OCULTO
         */

        tabBarLabelStyle: {
          margin:
            0,

          padding:
            0,

          fontSize:
            0,

          fontWeight:
            '400',

          textTransform:
            'none',
        },

        /*
         * EFEITO DE TOQUE
         */

        tabBarPressColor:
          tabBarPressColor,

        tabBarPressOpacity:
          0.75,
      }}
    >
      {/* ======================================================
          INÍCIO
          ====================================================== */}

      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={({ route }) => ({
          title:
            'Início',

          swipeEnabled:
            isStackOnMainScreen(
              route,
              'HomeScreen'
            ),

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              name="house"
              color={color}
              focused={focused}
              size={focused ? 25 : 24}
              solid={focused}
            />
          ),
        })}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate(
              'Home',
              {
                screen:
                  'HomeScreen',
              }
            );
          },
        })}
      />

      {/* ======================================================
          PUBLICAR
          ====================================================== */}

      <Tab.Screen
        name="Publicar"
        component={PublishScreen}
        options={{
          title:
            'Publicar',

          swipeEnabled:
            true,

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              name="feather"
              color={color}
              focused={focused}
              size={24}
              solid
            />
          ),
        }}
      />

      {/* ======================================================
          CONTATOS
          ====================================================== */}

      <Tab.Screen
        name="Contatos"
        component={ContactsStack}
        options={({ route }) => ({
          title:
            'Contatos',

          swipeEnabled:
            isStackOnMainScreen(
              route,
              'ContactsScreen'
            ),

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              name="comment"
              color={color}
              focused={focused}
              size={focused ? 25 : 24}
              solid={focused}
            />
          ),
        })}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate(
              'Contatos',
              {
                screen:
                  'ContactsScreen',
              }
            );
          },
        })}
      />

      {/* ======================================================
          CONTA
          ====================================================== */}

      <Tab.Screen
        name="Conta"
        component={ProfileStack}
        options={({ route }) => ({
          title:
            'Conta',

          /*
           * O gesto entre abas fica disponível somente
           * na tela principal do perfil.
           */

          swipeEnabled:
            isStackOnMainScreen(
              route,
              'ProfileScreen'
            ),

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              name="circle-user"
              color={color}
              focused={focused}
              size={focused ? 26 : 25}
              solid={focused}
            />
          ),
        })}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate(
              'Conta',
              {
                screen:
                  'ProfileScreen',
              }
            );
          },
        })}
      />
    </Tab.Navigator>
  );
}


/*
 * ============================================================
 * ESTILOS VISUAIS DA ANIMAÇÃO
 * ============================================================
 */

const localStyles = StyleSheet.create({
  tabBarContainer: {
    position:
      'relative',
  },

  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,

    borderTopWidth:
      1,
  },

  iconContainer: {
    width:
      32,

    height:
      32,

    alignItems:
      'center',

    justifyContent:
      'center',

    overflow:
      'visible',
  },

  iconLayer: {
    ...StyleSheet.absoluteFillObject,

    alignItems:
      'center',

    justifyContent:
      'center',
  },
});