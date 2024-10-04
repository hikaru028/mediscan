import React, { FC } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { View } from '@/components/Themed';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '@/utils/navi-props';
import MenuIcon from '@/assets/images/menu.png';
import { Colors } from '@/constants/colors';

type Props = {
    setIsMenuVisible: (visible: boolean) => void;
};

const FilterComponent: FC<Props> = ({ setIsMenuVisible }) => {
    const navigation = useNavigation<NavigationProps>();

    const openFilterMenuBar = () => {
        setIsMenuVisible(true)
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={openFilterMenuBar}>
                <View style={styles.iconCover}>
                    <Image source={MenuIcon} style={styles.icon} alt="image" contentFit='contain' />
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default FilterComponent;

const styles = StyleSheet.create({
    container: {
        margin: 5,
    },
    iconCover: {
        width: 40,
        height: 40,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EBF1F6',
    },
    icon: {
        width: 13,
        height: 13,
        transform: [{ scaleX: -1 }],
    },
});
