import React, { useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from '@/utils/navi-props'
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'react-native';
import { useColorScheme } from '../components/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FilterProvider } from '@/context/FilterContext';
import { NGROK_API } from '@/app/api/ngrok';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    '100': require('../assets/fonts/Manrope-ExtraLight.ttf'),
    '200': require('../assets/fonts/Manrope-Light.ttf'),
    '300': require('../assets/fonts/Manrope-Regular.ttf'),
    '400': require('../assets/fonts/Manrope-Medium.ttf'),
    '500': require('../assets/fonts/Manrope-SemiBold.ttf'),
    '600': require('../assets/fonts/Manrope-Bold.ttf'),
    '700': require('../assets/fonts/Manrope-ExtraBold.ttf'),
    ...FontAwesome.font,
  });

  const queryClient = React.useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  }), []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <FilterProvider>
          <RootLayoutNav />
        </FilterProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}


function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: ['http://localhost', NGROK_API],
    config: {
      screens: {
        '(tabs)': {
          screens: {
            camera: 'camera',
            cart: 'cart',
            product: 'product',
            help: 'help',
          },
        },
        modal: 'modal',
        'screens/DeliveryAndPaymentInfoScreen': 'delivery',
        'screens/LoginScreen': 'login',
      },
    },
  };

  return (
    <NavigationContainer
      independent={true}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
      linking={linking}
    >
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colorScheme === 'dark' ? '#151718' : '#FFFFFF'}
      />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="screens/PhotoPreviewScreen" options={{ headerShown: false, presentation: 'modal', gestureEnabled: false }} />
        <Stack.Screen name="screens/DeliveryAndPaymentInfoScreen" options={{ headerShown: false, presentation: 'modal', gestureEnabled: false }} />
        <Stack.Screen name="screens/OrderHistoryScreen" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="screens/LoginScreen" options={{ headerShown: false }} />
        <Stack.Screen name="screens/ProductDetailScreen" options={{ headerShown: false }} />
        <Stack.Screen name="screens/FilterSideMenuScreen" options={{ headerShown: false }} />
        <Stack.Screen name="screens/PaymentSuccessScreen" options={{ headerShown: false }} />
        <Stack.Screen name="screens/PaymentFailScreen" options={{ headerShown: false }} />
        <Stack.Screen name="screens/OrderDetailScreen" options={{ headerShown: false, presentation: 'formSheet' }} />
      </Stack>
    </NavigationContainer>
  );
}