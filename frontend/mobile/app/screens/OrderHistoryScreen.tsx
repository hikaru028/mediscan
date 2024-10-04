import React, { FC, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { useFilter } from '@/context/FilterContext';
import { FlatList } from 'react-native-gesture-handler';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Colors } from '../../constants/colors';
import { fetchOrders } from '@/hooks/useOrderDataFetch';
import { NavigationProps } from '@/utils/navi-props'
import CloseIcon from '@/assets/images/close.png';
import ArrowRightIcon from '@/assets/images/arrow-right.png';
import Loading from '@/components/loading/Loading';
import { Order } from '@/utils/index';
import OrderDetailScreen from './OrderDetailScreen';
import SearchBar from '@/components/filters/SearchBar';

const OrderHistoryScreen: FC = () => {
    const navigation = useNavigation<NavigationProps>();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

    const { data: OrderData, isLoading } = useQuery({
        queryKey: ['OrderData'],
        queryFn: fetchOrders,
        retry: false,
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        if (OrderData) {
            const sortedOrders = OrderData.sort((a: Order, b: Order) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            const filtered = filterAndSortOrders(sortedOrders);
            setFilteredOrders(filtered);
        }
    }, [searchQuery, OrderData]);

    const filterAndSortOrders = (orders: Order[]): Order[] => {
        if (!orders) return [];

        let updatedOrders = orders;

        if (searchQuery) {
            updatedOrders = updatedOrders.filter((order) => {
                const orderDate = new Date(order.createdAt);
                const day = orderDate.getUTCDate().toString();
                const month = (orderDate.getUTCMonth() + 1).toString(); // Months are 0-indexed
                const year = orderDate.getUTCFullYear().toString();
                const monthName = orderDate.toLocaleString('default', { month: 'long' }).toLowerCase(); // Month name in full (e.g., "September")
                const shortMonthName = orderDate.toLocaleString('default', { month: 'short' }).toLowerCase(); // Short month name (e.g., "Sep")
                const dateString = `${day}/${month}/${year}`;

                return (
                    order.orderNumber.includes(searchQuery) ||
                    dateString.includes(searchQuery) ||
                    month.includes(searchQuery) ||
                    year.includes(searchQuery) ||
                    monthName.includes(searchQuery.toLowerCase()) ||
                    shortMonthName.includes(searchQuery.toLowerCase())
                );
            });
        }

        return updatedOrders;
    };

    const groupOrdersByMonthYear = (orders: Order[]): Record<string, Order[]> => {
        const groupedOrders: Record<string, Order[]> = {};

        orders.forEach((order: Order) => {
            const orderDate = new Date(order.createdAt);
            const monthYear = `${orderDate.toLocaleString('default', { month: 'long' })}, ${orderDate.getFullYear()}`;

            if (!groupedOrders[monthYear]) {
                groupedOrders[monthYear] = [];
            }

            groupedOrders[monthYear].push(order);
        });

        return groupedOrders;
    };

    const showOrderDetail = (order: Order) => {
        setSelectedOrder(order);
    };

    const detailScreenClose = () => {
        setSelectedOrder(null);
    };

    const handleClose = () => {
        navigation.goBack();
    };

    if (selectedOrder) {
        return <OrderDetailScreen order={selectedOrder} onClose={detailScreenClose} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Image source={CloseIcon} style={styles.closeIcon} alt='image' contentFit='contain' />
            </TouchableOpacity>
            <Text style={styles.headerText}>Order History</Text>
            {/* search box */}
            <View style={{ width: '100%', height: 60, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', }}>
                <SearchBar onSearch={setSearchQuery} />
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <Loading />
                </View>
            ) : (
                <FlatList
                    data={Object.keys(groupOrdersByMonthYear(filteredOrders))}
                    keyExtractor={(item) => item}
                    contentContainerStyle={styles.listWrapper}
                    showsVerticalScrollIndicator={false}
                    horizontal={false}
                    renderItem={({ item: monthYear }) => (
                        <>
                            <Text style={styles.dateText}>{monthYear}</Text>
                            {groupOrdersByMonthYear(filteredOrders)[monthYear].map((order) => {
                                const orderDate = new Date(order.createdAt);
                                const day = orderDate.getUTCDate();

                                return (
                                    <TouchableOpacity key={order.orderNumber} onPress={() => showOrderDetail(order)} style={styles.listContainer}>
                                        <View style={styles.listLeftContainer}>
                                            <View>
                                                <Text style={styles.listDayText}>{day}</Text>
                                            </View>
                                            <View style={styles.separator} />
                                            <View style={styles.orderNumberItemCover}>
                                                <Text style={styles.listOrderNumber}>#{order.orderNumber}</Text>
                                                <View style={styles.listImageContainer}>
                                                    {order.items.map((item, index) => (
                                                        <View key={index} style={styles.orderImageCover}>
                                                            <Image source={`https://datawithimages.s3.ap-southeast-2.amazonaws.com/images/${item.productId}.jpg`} alt={item.productName} contentFit='contain' style={styles.orderImage} />
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        </View>
                                        <View style={styles.arrowIconCover}>
                                            <Image source={ArrowRightIcon} alt='arrow' contentFit='contain' style={styles.arrowIcon} />
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

export default OrderHistoryScreen;

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 10,
        backgroundColor: Colors.light.background,
        zIndex: 1,
    },
    headerText: {
        fontSize: 22,
        fontFamily: '500',
        textAlign: 'center',
        marginTop: 40,
        marginBottom: 20,
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 30,
        height: 30,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
        backgroundColor: '#E6E6E6',
    },
    closeIcon: {
        width: 12,
        height: 12,
    },
    historyGroup: {
        width: '100%',
        marginBottom: 15,
    },
    dateText: {
        fontSize: 24,
        fontWeight: '500',
        color: Colors.light.primary,
        marginBottom: 10,
    },
    listWrapper: {
        width: 380,
        alignItems: 'flex-start',
        padding: 10,
        paddingTop: 20,
    },
    listHeader: {
        fontSize: 23,
    },
    listContainer: {
        width: '100%',
        height: 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.light.primary,
        borderRadius: 15,
        backgroundColor: Colors.light.background,
    },
    listLeftContainer: {
        width: '80%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    listDayText: {
        width: 40,
        fontSize: 32,
        fontFamily: '700',
        marginLeft: 10,
        color: Colors.light.text,
        textAlign: 'center',
    },
    separator: {
        width: 0.5,
        height: 50,
        borderRadius: 5,
        backgroundColor: '#757575',
        marginHorizontal: 20,
    },
    orderNumberItemCover: {
        minWidth: 230,
        height: 90,
        paddingHorizontal: 5,
        flexDirection: 'column',
        alignItems: 'flex-start',
        overflow: 'hidden',
    },
    listOrderNumber: {
        fontSize: 16,
        fontFamily: '400',
        color: '#757575',
        marginBottom: 2,
    },
    listImageContainer: {
        width: 218,
        height: 80,
        padding: 5,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    orderImageCover: {
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: -13,
        borderRadius: 15,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 8,
        zIndex: 10,
    },
    orderImage: {
        width: 50,
        height: 50,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
    },
    productDetails: {
        fontSize: 12,
        color: Colors.GRAY,
    },
    arrowIconCover: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowIcon: {
        width: 15,
        height: 15,
    },
});
