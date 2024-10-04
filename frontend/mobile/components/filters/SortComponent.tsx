import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Platform, ActionSheetIOS } from 'react-native';
import { Image } from 'expo-image';
import { View } from '@/components/Themed';
import { Colors } from '@/constants/colors';
import RNPickerSelect from 'react-native-picker-select';
import { useFilter } from '@/context/FilterContext';
import FilterIcon from '@/assets/images/filter.png';
import HighToLow from '@/assets/images/sort-htol.png';
import LowToHigh from '@/assets/images/sort-ltoh.png';
import AToZ from '@/assets/images/sort-atoz.png';
import ZToA from '@/assets/images/sort-ztoa.png';

const SortComponent = () => {
    const { selectedSort, setSelectedSort } = useFilter();
    const [isPressed, setIsPressed] = useState(false);

    const getSortIcon = () => {
        switch (selectedSort) {
            case 'nameAZ':
                return AToZ;
            case 'nameZA':
                return ZToA;
            case 'priceLowToHigh':
                return LowToHigh;
            case 'priceHighToLow':
                return HighToLow;
            default:
                return FilterIcon;
        }
    };

    const showSortOptions = () => {
        const options = [
            'Name: A-Z',
            'Name: Z-A',
            'Price: Low to High',
            'Price: High to Low',
            'Cancel'
        ];
        const icons = [
            AToZ,
            ZToA,
            LowToHigh,
            HighToLow,
        ];
        const cancelButtonIndex = options.length - 1;

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options,
                    cancelButtonIndex,
                    title: 'Sort By',
                },
                (buttonIndex) => {
                    if (buttonIndex !== cancelButtonIndex) {
                        handleSelection(options[buttonIndex]);
                    }
                }
            );
        } else {
            setIsPressed(!isPressed);
        }
    };

    const handleSelection = (itemValue: string) => {
        switch (itemValue) {
            case 'Name: A-Z':
                setSelectedSort('nameAZ');
                break;
            case 'Name: Z-A':
                setSelectedSort('nameZA');
                break;
            case 'Price: Low to High':
                setSelectedSort('priceLowToHigh');
                break;
            case 'Price: High to Low':
                setSelectedSort('priceHighToLow');
                break;
        }
        setIsPressed(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={showSortOptions}>
                <View style={styles.iconCover}>
                    <Image source={getSortIcon()} style={styles.icon} alt="sort-icon" contentFit='contain' />
                </View>
            </TouchableOpacity>

            {isPressed && Platform.OS === 'android' && (
                <View style={styles.pickerContainer}>
                    <RNPickerSelect
                        onValueChange={(itemValue: string) => {
                            handleSelection(itemValue);
                        }}
                        items={[
                            { label: 'Name: A-Z', value: 'nameAZ', key: 'nameAZ' },
                            { label: 'Name: Z-A', value: 'nameZA', key: 'nameZA' },
                            { label: 'Price: Low to High', value: 'priceLowToHigh', key: 'priceLowToHigh' },
                            { label: 'Price: High to Low', value: 'priceHighToLow', key: 'priceHighToLow' },
                        ]}
                        style={{
                            inputIOS: {
                                width: 200,
                                height: 40,
                                borderRadius: 10,
                                backgroundColor: Colors.light.tint,
                                padding: 10,
                            },
                            inputAndroid: {
                                width: 200,
                                height: 40,
                                borderRadius: 10,
                                backgroundColor: Colors.light.tint,
                                padding: 10,
                            },
                        }}
                        useNativeAndroidPickerStyle={false}
                        Icon={() => null}
                    />
                </View>
            )}
        </View>
    );
};

export default SortComponent;

const styles = StyleSheet.create({
    container: {
        padding: 5,
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
        width: 15,
        height: 15,
    },
    pickerContainer: {
        backgroundColor: Colors.light.tint,
        borderRadius: 10,
        marginTop: 5,
        width: 200,
    },
    pickerItem: {
        color: '#333',
        fontSize: 16,
    },
});