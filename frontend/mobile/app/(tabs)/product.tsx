import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { View } from '@/components/Themed';
import SortComponent from '@/components/filters/SortComponent';
import SearchBar from '@/components/filters/SearchBar';
import { useFilter } from '@/context/FilterContext';
import ProductListCard from '@/components/cards/ProductListCard';
import FilterComponent from '@/components/filters/FilterComponent';
import { Product } from '@/utils/index';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '@/utils/navi-props';
import FilterSideMenuScreen from '@/app/screens/FilterSideMenuScreen';
import { BlurView } from 'expo-blur';
import axiosClient from '@/app/api/axiosClient';
import Loading from '@/components/loading/Loading';

const PAGE_SIZE = 20;

export default function ProductScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const { searchQuery, selectedSort, selectedFilters } = useFilter();
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const navigation = useNavigation<NavigationProps>();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Fetch products on component mount
    useEffect(() => {
        fetchProducts(1); // Load the first page
    }, []);

    useEffect(() => {
        filterAndSortProducts();
    }, [searchQuery, selectedSort, selectedFilters, products]); // Include products in dependency array

    const fetchProducts = async (page: number) => {
        if (page === 1) {
            setIsLoading(true);
        } else {
            setIsLoadingMore(true);
        }

        try {
            const response = await axiosClient.get(`/products/mobile?page=${page}&pageSize=${PAGE_SIZE}`);
            const { products, has_more } = response.data;

            if (products.length < PAGE_SIZE || !has_more) {
                setHasMore(false);
            }

            setProducts(prevProducts => page === 1 ? products : [...prevProducts, ...products]);
        } catch (error) {
            console.error("Error fetching products:", error);
        }

        setIsLoading(false);
        setIsLoadingMore(false);
    };


    const loadMoreProducts = () => {
        if (!isLoadingMore && hasMore) {
            setPage(prevPage => {
                const nextPage = prevPage + 1;
                fetchProducts(nextPage);
                return nextPage;
            });
        }
    };

    const filterAndSortProducts = () => {
        let updatedProducts = [...products];

        // Search filter
        if (searchQuery) {
            updatedProducts = updatedProducts.filter((product) =>
                product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.genericName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category filters
        updatedProducts = updatedProducts.filter(product => {
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

        // Sorting
        updatedProducts.sort((a, b) => {
            switch (selectedSort) {
                case 'priceLowToHigh':
                    return a.price - b.price;
                case 'priceHighToLow':
                    return b.price - a.price;
                case 'nameAZ':
                    return a.productName.localeCompare(b.productName);
                case 'nameZA':
                    return b.productName.localeCompare(a.productName);
                default:
                    return 0;
            }
        });

        setFilteredProducts(updatedProducts);
    };

    const showProductDetail = (product: Product) => {
        if (product) {
            navigation.navigate('screens/ProductDetailScreen', {
                image: `https://datawithimages.s3.ap-southeast-2.amazonaws.com/images/${product.productId}.jpg`,
                product: product,
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <View>
                    <FilterComponent setIsMenuVisible={setIsMenuVisible} />
                </View>
                <View>
                    <SearchBar />
                </View>
                <View>
                    <SortComponent />
                </View>
            </View>

            {/* Product List */}
            {isLoading ?
                <View style={styles.loadingContainer}>
                    <Loading />
                </View>
                :
                <FlatList
                    data={filteredProducts}
                    numColumns={2}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity onPress={() => showProductDetail(item)} key={index}>
                            <ProductListCard productData={item} />
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.list}
                    onEndReached={loadMoreProducts}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={isLoadingMore ?
                        <View style={styles.loadingMoreContainer}>
                            <Loading />
                        </View>
                        :
                        null
                    }
                />
            }

            {isMenuVisible && (
                <>
                    <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                    <FilterSideMenuScreen setIsMenuVisible={setIsMenuVisible} setProducts={setProducts} products={products} />
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
        zIndex: 1,
    },
    headerContainer: {
        width: '100%',
        flexDirection: 'row',
        margin: 0,
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    list: {
        minWidth: 400,
        margin: 0,
        flexGrow: 1,
        paddingHorizontal: 2,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    loadingMoreContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }
});