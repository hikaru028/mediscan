import React, { FC, useState, useRef, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Image } from 'expo-image';
import { View, Text } from '@/components/Themed';
import { categories as categoryData } from '@/constants/categories';
import { Colors } from '@/constants/colors';
import closeIcon from '../../assets/images/close.png';
import { Product } from '@/utils/index';
import { fetchProducts } from '@/hooks/useProductDataFetch';

type Props = {
    setIsMenuVisible: (visible: boolean) => void,
    setProducts: (products: Product[]) => void,
    products: Product[],
};

const FilterSideMenuScreen: FC<Props> = ({ setIsMenuVisible, setProducts, products }) => {
    const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({});
    const [openedCategory, setOpenedCategory] = useState<string | null>(null);
    const slideAnim = useRef(new Animated.Value(-Dimensions.get('window').width / 2)).current;
    const [forceUpdate, setForceUpdate] = useState(0);

    useEffect(() => {
        openMenuBar();
    }, []);

    const openMenuBar = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeMenuBarInternal = () => {
        Animated.timing(slideAnim, {
            toValue: -Dimensions.get('window').width / 2,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsMenuVisible(false);
        });
    };

    const toggleCategory = (category: string) => {
        setOpenedCategory(openedCategory === category ? null : category);
    };

    const handleFilterSelect = (category: string, value: string) => {
        setSelectedFilters((prevFilters) => {
            const normalizedCategory = category.toLowerCase();
            const normalizedValue = value.toLowerCase();

            const currentSelections = prevFilters[normalizedCategory] || [];
            if (currentSelections.includes(normalizedValue)) {
                return {
                    ...prevFilters,
                    [normalizedCategory]: currentSelections.filter((item) => item !== normalizedValue),
                };
            } else {
                return {
                    ...prevFilters,
                    [normalizedCategory]: [...currentSelections, normalizedValue],
                };
            }
        });
        setForceUpdate((prev) => prev + 1);
    };


    const isSelected = (category: string, value: string) => {
        const normalizedCategory = category.toLowerCase();
        const normalizedValue = value.toLowerCase();
        return selectedFilters[normalizedCategory]?.includes(normalizedValue);
    };

    const resetAllSelection = () => {
        setSelectedFilters({});

        const filteredProducts = products.filter(product => {
            return Object.keys(selectedFilters).every((category) => {
                const selectedValues = selectedFilters[category];
                if (selectedValues.length === 0) return true;

                const productValue = product[category as keyof Product];

                if (Array.isArray(productValue)) {
                    return selectedValues.some(value => productValue.includes(value));
                } else {
                    return selectedValues.includes(productValue as string);
                }
            });
        });

        setProducts(filteredProducts);
    };

    const applySelectedCategory = () => {
        const filteredProducts = products.filter(product => {
            return Object.keys(selectedFilters).every((category) => {
                const normalizedCategory = category.toLowerCase();
                const selectedValues = selectedFilters[normalizedCategory] || [];

                if (selectedValues.length === 0) return true;

                const productValue = product[normalizedCategory as keyof Product];

                if (productValue === undefined || productValue === null) {
                    return false;
                }

                if (Array.isArray(productValue)) {
                    return selectedValues.some(value =>
                        productValue.map(val => val.toLowerCase()).includes(value.toLowerCase())
                    );
                } else {
                    return selectedValues.includes((productValue as string).toLowerCase());
                }
            });
        });

        setProducts(filteredProducts);
        closeMenuBarInternal();
    };

    return (
        <TouchableWithoutFeedback onPress={closeMenuBarInternal}>
            <View style={styles.overlay}>
                <TouchableWithoutFeedback onPress={() => { }}>
                    <Animated.View style={[styles.sideMenu, { transform: [{ translateX: slideAnim }] }]}>
                        <SafeAreaView style={styles.container}>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={resetAllSelection} style={styles.resetButton}>
                                    <Text>Reset</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={applySelectedCategory} style={styles.applyButton}>
                                    <Text>Apply</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={closeMenuBarInternal} style={styles.iconCover}>
                                    <Image source={closeIcon} style={styles.icon} alt='image' contentFit='contain' />
                                </TouchableOpacity>
                            </View>
                            <ScrollView>
                                {Object.keys(categoryData).map((category) => (
                                    <View key={category} style={styles.categoryContainer}>
                                        <TouchableOpacity onPress={() => toggleCategory(category)}>
                                            <Text style={styles.categoryTitle}>{category}</Text>
                                        </TouchableOpacity>
                                        {openedCategory === category && (
                                            <View>
                                                {categoryData[category].map((item: string) => (
                                                    <TouchableOpacity
                                                        key={item}
                                                        style={isSelected(category, item) ? styles.selectedFilterOption : styles.filterOption}
                                                        onPress={() => handleFilterSelect(category, item)}
                                                    >
                                                        <Text style={styles.filterText}>{item}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </ScrollView>
                        </SafeAreaView>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default FilterSideMenuScreen;

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        zIndex: 9998,
    },
    sideMenu: {
        width: Dimensions.get('window').width / 2,
        height: '100%',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomRightRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 5, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 9999,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        marginTop: 20,
    },
    categoryContainer: {
        marginBottom: 20,
    },
    categoryTitle: {
        fontSize: 18,
        fontFamily: '600',
        marginVertical: 10,
    },
    filterOption: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginHorizontal: 10,
        marginBottom: 5,
    },
    selectedFilterOption: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginHorizontal: 10,
        marginBottom: 5,
        backgroundColor: Colors.light.primary,
    },
    filterText: {
        fontSize: 18,
    },
    resetButton: {
        width: 80,
        height: 40,
        marginRight: 4,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.tint,
    },
    applyButton: {
        width: 80,
        height: 40,
        marginRight: 3,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.primary,
    },
    iconCover: {
        position: 'absolute',
        top: -25,
        right: 5,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 13,
        height: 13,
    },
});