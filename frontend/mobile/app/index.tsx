import React, { FC, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '@/utils/navi-props';
import Loading from '@/components/loading/Loading';
import { fetchUserProfile } from '@/hooks/useUserDataFetch'
import { Profile } from '@/utils/index';

const Index: FC = () => {
    const navigation = useNavigation<NavigationProps>();

    const { data: authUser, isLoading, isError } = useQuery<Profile>({
        queryKey: ['authUser'],
        queryFn: fetchUserProfile,
        retry: false,
    });

    useEffect(() => {
        if (!isLoading) {
            if (authUser) {
                navigation.navigate('(tabs)');
            } else if (isError) {
                navigation.navigate('screens/LoginScreen');
            }
        }
    }, [authUser, isLoading, isError, navigation]);

    if (isLoading) {
        return (
            <View>
                <Loading />
            </View>
        );
    }

    return null;
};

export default Index;