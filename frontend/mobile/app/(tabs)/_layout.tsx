import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, PressableStateCallbackType } from 'react-native';
import { Image } from 'expo-image';
import { Text, View } from '@/components/Themed';
import { Tabs } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '@/utils/navi-props';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { Colors } from '../../constants/colors';
import { Profile } from '@/utils/index';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Loading from '../../components/loading/Loading';
import { fetchCartItems } from '../../hooks/useUserDataFetch';
import CameraIcon from '@/assets/images/camera.png';
import Camera2Icon from '@/assets/images/camera2.png';
import ShopIcon from '@/assets/images/shop.png';
import Shop2Icon from '@/assets/images/shop2.png';
import CrossIcon from '@/assets/images/cross.png';
import Cross2Icon from '@/assets/images/cross2.png';
import CartIcon from '@/assets/images/cart2.png';
import Cart2Icon from '@/assets/images/cart3.png';
import CartWIcon from '@/assets/images/cart4.png'
import UserIcon from '@/assets/images/user.png';
import User2Icon from '@/assets/images/user2.png';

type Props = {
  focused: boolean;
  image: any;
  focusedImage: any;
};

function CustomTabBarIcon({ focused, image, focusedImage }: Props) {
  return (
    <Image
      source={focused ? focusedImage : image}
      style={{ width: 26, height: 26, marginVertical: -3 }}
      alt='image'
      contentFit='contain'
    />
  );
}

export default function TabLayout() {
  const navigation = useNavigation<NavigationProps>();
  const colorScheme = useColorScheme();
  const [totalQuantity, setTotalQuantity] = useState(0);
  const { data: authUser, isLoading } = useQuery<Profile>({ queryKey: ['authUser'] });

  const { data: cartItems, isLoading: isLoadingCart } = useQuery({
    queryKey: ['cartItems'],
    queryFn: fetchCartItems,
    retry: false,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (cartItems?.items) {
      const totalQty = cartItems.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setTotalQuantity(totalQty);
    }
  }, [cartItems]);

  if (isLoadingCart || isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading />
      </SafeAreaView>
    );
  }

  return (
    <Tabs
      initialRouteName="camera"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].primary,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].secondary,
        tabBarLabelStyle: { fontSize: 12 },
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="help"
        options={{
          title: 'Help',
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon
              focused={focused}
              image={CrossIcon}
              focusedImage={Cross2Icon}
            />
          ),
          headerRight: () => (
            <Pressable onPress={() => navigation.navigate('modal')}>
              {({ pressed }: PressableStateCallbackType) => (
                <View style={styles.iconCover}>
                  <Image
                    alt='image'
                    contentFit='contain'
                    source={colorScheme === 'light' ? UserIcon : User2Icon}
                    style={{
                      width: 23,
                      height: 23,
                      opacity: pressed ? 0.5 : 1,
                    }}
                  />
                </View>
              )}
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon
              focused={focused}
              image={CameraIcon}
              focusedImage={Camera2Icon}
            />
          ),
          headerRight: () => (
            <Pressable onPress={() => navigation.navigate('modal')}>
              {({ pressed }: PressableStateCallbackType) => (
                <View style={styles.iconCover}>
                  <Image
                    alt='image'
                    contentFit='contain'
                    source={colorScheme === 'light' ? UserIcon : User2Icon}
                    style={{
                      width: 23,
                      height: 23,
                      opacity: pressed ? 0.5 : 1,
                    }}
                  />
                </View>
              )}
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="product"
        options={{
          title: 'Products',
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon
              focused={focused}
              image={ShopIcon}
              focusedImage={Shop2Icon}
            />
          ),
          headerLeft: authUser ? () => (
            <Pressable onPress={() => navigation.navigate('screens/OrderHistoryScreen')}>
              {({ pressed }: PressableStateCallbackType) => (
                <View style={[styles.buttonCover, { opacity: pressed ? 0.5 : 1 }]}>
                  <Image
                    alt='image'
                    contentFit='contain'
                    source={CartWIcon}
                    style={{
                      width: 15,
                      height: 15,
                    }}
                  />
                  <Text style={{ color: "#fff", fontSize: 18, fontFamily: "300", marginLeft: 5 }}>
                    History
                  </Text>
                </View>
              )}
            </Pressable>
          ) : undefined,
          headerRight: () => (
            <Pressable onPress={() => navigation.navigate('modal')}>
              {({ pressed }: PressableStateCallbackType) => (
                <View style={styles.iconCover}>
                  <Image
                    alt='image'
                    contentFit='contain'
                    source={colorScheme === 'light' ? UserIcon : User2Icon}
                    style={{
                      width: 23,
                      height: 23,
                      opacity: pressed ? 0.5 : 1,
                    }}
                  />
                </View>
              )}
            </Pressable>
          ),
        }}
      />
      < Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ focused }) => (
            <View style={styles.cartContainer}>
              <CustomTabBarIcon
                focused={focused}
                image={CartIcon}
                focusedImage={Cart2Icon}
              />
              {totalQuantity > 0 && (
                <View style={styles.noticeContainer}>
                  <View style={styles.noticeCaover}>
                    <Text style={styles.noticeText}>{totalQuantity}</Text>
                  </View>
                </View>
              )}
            </View>
          ),
          headerRight: () => (
            <Pressable onPress={() => navigation.navigate('modal')}>
              {({ pressed }: PressableStateCallbackType) => (
                <View style={styles.iconCover}>
                  <Image
                    alt='image'
                    contentFit='contain'
                    source={colorScheme === 'light' ? UserIcon : User2Icon}
                    style={{
                      width: 23,
                      height: 23,
                      opacity: pressed ? 0.5 : 1,
                    }}
                  />
                </View>
              )}
            </Pressable>
          ),
        }}
      />
    </Tabs >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    color: Colors.light.text,
  },
  cartContainer: {
    position: 'relative',
  },
  noticeContainer: {
    position: 'absolute',
    top: -2,
    right: -12,
    borderRadius: 15,
    width: 21,
    height: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  noticeCaover: {
    width: 18,
    height: 18,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  noticeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  iconCover: {
    width: 40,
    height: 40,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    marginRight: 15,
  },
  buttonCover: {
    width: 100,
    height: 40,
    flexDirection: 'row',
    backgroundColor: Colors.light.impact,
    padding: 5,
    marginLeft: 15,
    marginBottom: 2,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});