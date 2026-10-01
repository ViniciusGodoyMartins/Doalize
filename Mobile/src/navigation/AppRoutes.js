import React from 'react';

import {
  View,
} from 'react-native';

import {
  createMaterialTopTabNavigator,
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
  /*
   * MODO ESCURO
   */

  darkBackground:
    '#141414',

  darkInactiveIcon:
    '#F5F5F5',

  darkBorder:
    '#F5F5F5',

  darkPress:
    'rgba(245, 245, 245, 0.06)',


  /*
   * MODO CLARO
   */

  lightBackground:
    '#F5F5F5',

  lightInactiveIcon:
    '#141414',

  lightBorder:
    'rgba(20, 20, 20, 0.45)',

  lightPress:
    'rgba(20, 20, 20, 0.06)',


  /*
   * COR PRINCIPAL
   */

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
      screenOptions={
        stackScreenOptions
      }
    >

      <Stack.Screen
        name="HomeScreen"
        component={
          HomeScreen
        }
      />


      <Stack.Screen
        name="DetailsScreen"
        component={
          DetailsScreen
        }
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
      screenOptions={
        stackScreenOptions
      }
    >

      <Stack.Screen
        name="ContactsScreen"
        component={
          ContactsScreen
        }
      />


      <Stack.Screen
        name="ChatScreen"
        component={
          ChatScreen
        }
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
      screenOptions={
        stackScreenOptions
      }
    >

      <Stack.Screen
        name="ProfileScreen"
        component={
          ProfileScreen
        }
      />


      <Stack.Screen
        name="PublishedScreen"
        component={
          PublishedScreen
        }
      />


      <Stack.Screen
        name="DetailsScreen"
        component={
          DetailsScreen
        }
      />


      <Stack.Screen
        name="SettingsScreen"
        component={
          SettingsScreen
        }
      />


      <Stack.Screen
        name="EmailChangeScreen"
        component={
          EmailChangeScreen
        }
      />


      <Stack.Screen
        name="TwoFactorSettingsScreen"
        component={
          TwoFactorSettingsScreen
        }
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
    getFocusedRouteNameFromRoute(
      route
    );


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
 * COMPONENTE DO ÍCONE DA BARRA
 * ============================================================
 */

function TabIcon({
  name,
  color,
  size,
  solid,
}) {

  return (

    <View
      style={{
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
      }}
    >

      <FontAwesome6
        name={
          name
        }
        size={
          size
        }
        color={
          color
        }
        solid={
          solid
        }
      />

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

  const tabBarBackgroundColor =
    darkMode
      ? COLORS.darkBackground
      : COLORS.lightBackground;


  const tabBarInactiveColor =
    darkMode
      ? COLORS.darkInactiveIcon
      : COLORS.lightInactiveIcon;


  const tabBarBorderColor =
    darkMode
      ? COLORS.darkBorder
      : COLORS.lightBorder;


  const tabBarPressColor =
    darkMode
      ? COLORS.darkPress
      : COLORS.lightPress;


  return (

    <Tab.Navigator
      initialRouteName="Home"
      tabBarPosition="bottom"
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
            tabBarBackgroundColor,

          borderTopWidth:
            1,

          borderTopColor:
            tabBarBorderColor,

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

      {/*
       * ======================================================
       * INÍCIO
       * ======================================================
       */}

      <Tab.Screen
        name="Home"
        component={
          HomeStack
        }
        options={({
          route,
        }) => ({
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
              color={
                color
              }
              size={
                focused
                  ? 25
                  : 24
              }
              solid={
                focused
              }
            />

          ),
        })}
        listeners={({
          navigation,
        }) => ({
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


      {/*
       * ======================================================
       * PUBLICAR
       * ======================================================
       */}

      <Tab.Screen
        name="Publicar"
        component={
          PublishScreen
        }
        options={{
          title:
            'Publicar',

          swipeEnabled:
            true,

          tabBarIcon: ({
            color,
          }) => (

            <TabIcon
              name="feather"
              color={
                color
              }
              size={24}
              solid
            />

          ),
        }}
      />


      {/*
       * ======================================================
       * CONTATOS
       * ======================================================
       */}

      <Tab.Screen
        name="Contatos"
        component={
          ContactsStack
        }
        options={({
          route,
        }) => ({
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
              color={
                color
              }
              size={
                focused
                  ? 25
                  : 24
              }
              solid={
                focused
              }
            />

          ),
        })}
        listeners={({
          navigation,
        }) => ({
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


      {/*
       * ======================================================
       * CONTA
       * ======================================================
       */}

      <Tab.Screen
        name="Conta"
        component={
          ProfileStack
        }
        options={({
          route,
        }) => ({
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
              color={
                color
              }
              size={
                focused
                  ? 26
                  : 25
              }
              solid={
                focused
              }
            />

          ),
        })}
        listeners={({
          navigation,
        }) => ({
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