import React, { FC, useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { Order } from '@/utils/index';
import moment from 'moment';
import { Image } from 'expo-image';
import Order1Image from '@/assets/images/order-placed.png';
import Order2Image from '@/assets/images/order-processed.png';
import Order3Image from '@/assets/images/order-shipped.png';
import Order4Image from '@/assets/images/order-out.png';
import Order5Image from '@/assets/images/order-delivered.png';
import Order1DImage from '@/assets/images/order-placed2.png';
import Order2DImage from '@/assets/images/order-processed2.png';
import Order3DImage from '@/assets/images/order-shipped2.png';
import Order4DImage from '@/assets/images/order-out2.png';
import Order5DImage from '@/assets/images/order-delivered2.png';

type Props = {
    order: Order;
};

const TrackOrder: FC<Props> = ({ order }) => {
    const [currentStage, setCurrentStage] = useState<string>('Order Placed');
    const [trackingCode, setTrackingCode] = useState<number>()
    const [orderDate, setOrderDate] = useState<string>(
        moment(order.createdAt).local().format('D MMM YYYY, h:mm a')
    );

    const blinkAnim = useSharedValue(1);

    useEffect(() => {
        blinkAnim.value = withRepeat(
            withTiming(0, { duration: 1000 }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: blinkAnim.value,
        };
    });

    useEffect(() => {
        const generateTrackingCode = () => {
            const code = Math.floor(1000000000 + Math.random() * 9000000000);
            setTrackingCode(code);
        };

        generateTrackingCode();
    }, []);

    const stages = [
        {
            name: 'Order Placed',
            time: 0,
            duration: 30,
            comment: 'Your order has been placed successfully.',
            doneTime: moment(order.createdAt).add(30, 'minutes').format('hh:mm a, DD/MM/YYYY')
        },
        {
            name: 'Order Processed',
            time: 30,
            duration: 330,
            comment: 'Your order has been processed.',
            doneTime: moment(order.createdAt).add(360, 'minutes').format('hh:mm a, DD/MM/YYYY')
        },
        {
            name: 'Shipped',
            time: 360,
            duration: 1080,
            comment: 'Your order has been shipped.',
            doneTime: moment(order.createdAt).add(1440, 'minutes').format('hh:mm a, DD/MM/YYYY')
        },
        {
            name: 'Out for Delivery',
            time: 1440,
            duration: 1440,
            comment: 'Your order is out for delivery and will reach you soon.',
            doneTime: moment(order.createdAt).add(2880, 'minutes').format('hh:mm a, DD/MM/YYYY')
        },
        {
            name: 'Delivered',
            time: 2880,
            duration: 0,
            comment: 'Your order has been delivered. Thank you for shopping with us!',
            doneTime: moment(order.createdAt).add(2880, 'minutes').format('hh:mm a, DD/MM/YYYY')
        },
    ];

    useEffect(() => {
        const orderPlacedTime = moment(order.createdAt);
        const currentTime = moment();

        const diffInMinutes = currentTime.diff(orderPlacedTime, 'minutes');

        if (diffInMinutes >= stages[stages.length - 1].time) {
            setCurrentStage('Delivered');
        } else {
            for (let i = stages.length - 2; i >= 0; i--) {
                if (diffInMinutes >= stages[i].time) {
                    setCurrentStage(stages[i].name);
                    break;
                }
            }
        }
    }, [order]);



    const renderStage = (
        stage: string,
        doneImage: any,
        upcomingImage: any,
        stageName: string,
        nextStage: string,
        comment: string,
        message: string,
        doneTime: string,
    ) => {
        const isCurrent = currentStage === stageName;
        const isDone = stages.findIndex(s => s.name === currentStage) > stages.findIndex(s => s.name === stageName);

        const stageIndex = stages.findIndex(s => s.name === stageName);
        const nextStageTime = stages[stageIndex + 1]?.time || stages[stageIndex].time + stages[stageIndex].duration;
        const timeElapsed = moment().diff(moment(order.createdAt).add(stages[stageIndex].time, 'minutes'), 'minutes');

        const totalStageTime = nextStageTime - stages[stageIndex].time;
        const progress = Math.min(timeElapsed / totalStageTime, 1);

        const progressAnim = useSharedValue(progress * 100);

        useEffect(() => {
            if (isCurrent || isDone) {
                progressAnim.value = withTiming(100, {
                    duration: totalStageTime * 60000,
                });
            }
        }, [progress, isCurrent, isDone]);

        const animatedProgressStyle = useAnimatedStyle(() => {
            return {
                height: `${progressAnim.value}%`,
            };
        });

        return (
            <React.Fragment key={stage}>
                <View style={styles.statusPointContainer}>
                    <View style={styles.pointCover}>
                        <View style={styles.pointOff}></View>
                        <Animated.View style={isCurrent ? [styles.pointOn, animatedStyle] : (isDone || currentStage === 'Delivered') ? styles.pointDone : styles.pointOff} />
                    </View>
                    <View style={styles.statusDetail}>
                        <View style={isCurrent || isDone ? styles.imageCover : [styles.imageCover, { backgroundColor: '#ddd' }]}>
                            <Image source={isCurrent || isDone ? doneImage : upcomingImage} alt='image' contentFit='contain' style={styles.image} />
                        </View>
                        <View style={styles.labelCover}>
                            <Text style={isCurrent ? [styles.statusLabel, { color: Colors.light.primary }] : (isDone || currentStage === 'Delivered') ? styles.statusLabel : [styles.statusLabel, { color: '#aaa' }]}>{stageName}</Text>
                            <Text style={isCurrent ? [styles.statusText, { color: Colors.light.primary }] : (isDone || currentStage === 'Delivered') ? styles.statusText : [styles.statusText, { color: '#ccc' }]}>{(isDone || currentStage === 'Delivered') ? comment : message}</Text>
                            <Text style={isCurrent ? [styles.statusText, { color: Colors.light.primary }] : (isDone || currentStage === 'Delivered') ? styles.statusText : [styles.statusText, { color: '#ccc' }]}>{(isDone || currentStage === 'Delivered') ? doneTime : '--:--, --/--/--'}</Text>
                            {stageName === 'Shipped' && (currentStage === 'Shipped' || stages.findIndex(s => s.name === currentStage) > stages.findIndex(s => s.name === 'Shipped')) && (
                                <Text style={styles.trackingText}>Tracking code: <Text style={styles.trackingNumber}>#{trackingCode}</Text></Text>
                            )}
                        </View>
                    </View>
                </View>
                {stage !== nextStage && stage !== "Delivered" && (
                    <View style={styles.progressPathCover}>
                        <View style={styles.progressPath0} />
                        <Animated.View style={[styles.progressPath, animatedProgressStyle]} />
                    </View>
                )}
            </React.Fragment>
        );
    };

    return (
        <View style={styles.container}>
            {/* Additional Order Information */}
            <View style={styles.additionalInfo}>
                <Text style={styles.infoTitle}>Placed on: <Text style={styles.infoText}>{orderDate}</Text></Text>
                <Text style={styles.infoTitle}>Estimated Delivery: <Text style={styles.infoText}>{moment(order.createdAt).add(2, 'days').format('D MMMM YYYY, h:mm a')}</Text></Text>
            </View>
            {/* Order Status Bar */}
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.statusContainer}>
                    {renderStage('Order Placed', Order1Image, Order1DImage, 'Order Placed', 'Order Processed', stages[0].comment, 'We receive your order', stages[0].doneTime)}
                    {renderStage('Order Processed', Order2Image, Order2DImage, 'Order Processed', 'Shipped', stages[1].comment, 'We check your order', stages[1].doneTime)}
                    {renderStage('Shipped', Order3Image, Order3DImage, 'Shipped', 'Out for Delivery', stages[2].comment, 'The items picked, packed, and labelled for delivery', stages[2].doneTime)}
                    {renderStage('Out for Delivery', Order4Image, Order4DImage, 'Out for Delivery', 'Delivered', stages[3].comment, 'The package arrives at the local distribution centre', stages[3].doneTime)}
                    {renderStage('Delivered', Order5Image, Order5DImage, 'Delivered', '', stages[4].comment, 'The package is delivered to you', stages[4].doneTime)}
                </View>
            </ScrollView>

            {/* Support Section */}
            <View style={styles.supportSection}>
                <Text style={styles.supportText}>Need help with your order? <Text style={styles.contactLink}> Contact us</Text></Text>
            </View>
        </View>
    );
};

export default TrackOrder;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        minHeight: '100%',
        backgroundColor: '#fff'
    },
    additionalInfo: {
        width: '100%',
        padding: 20,
    },
    infoTitle: {
        fontSize: 16,
        fontFamily: '600',
        color: Colors.light.text,
        marginBottom: 10,
    },
    infoText: {
        fontSize: 16,
        fontFamily: '300',
        color: Colors.light.text,
        marginBottom: 5,
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
        maxHeight: 500,
        backgroundColor: '#fff'
    },
    statusContainer: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-evenly',
        overflow: 'scroll',
        paddingHorizontal: 40,
        paddingVertical: 50,
        marginLeft: 20,
        marginBottom: 30,
    },
    statusDetail: {
        height: 65,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginHorizontal: 30,
    },
    imageCover: {
        width: 65,
        height: 65,
        borderRadius: 50,
        padding: 3,
        overflow: 'hidden',
        marginRight: 20,
        backgroundColor: Colors.light.tint,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    statusPointContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 100,
        marginTop: -25,
    },
    pointCover: {
        position: 'relative',
        width: 15,
        height: 15,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
    },
    labelCover: {
        flexDirection: 'column',
    },
    statusLabel: {
        fontSize: 18,
        fontFamily: '700',
        marginLeft: 10,
    },
    statusText: {
        width: 200,
        fontSize: 14,
        fontFamily: '400',
        color: '#757575',
        marginLeft: 10,
    },
    pointOn: {
        position: 'absolute',
        width: 15,
        height: 15,
        borderRadius: 50,
        borderWidth: 2,
        shadowColor: "#42F2C0",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.9,
        borderColor: "#42F2C0",
        backgroundColor: "#42F2C0",
        zIndex: 222,
    },
    pointDone: {
        position: 'absolute',
        width: 15,
        height: 15,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: Colors.light.primary,
        backgroundColor: Colors.light.primary,
        zIndex: 200,
    },
    pointOff: {
        position: 'absolute',
        width: 15,
        height: 15,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: Colors.light.tint,
        backgroundColor: Colors.light.tint,
        zIndex: 200,
    },
    progressPathCover: {
        position: 'relative',
        width: 15,
        height: 100,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: -25,
        zIndex: 10,
        overflow: 'hidden',
    },
    progressPath: {
        position: 'absolute',
        width: 2,
        height: '100%',
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
        backgroundColor: Colors.light.primary,
        zIndex: 20,
    },
    progressPath0: {
        position: 'absolute',
        width: 2,
        height: '100%',
        backgroundColor: Colors.light.tint,
        zIndex: 10,
    },
    supportSection: {
        width: '100%',
        minHeight: 100,
        marginTop: 30,
        alignItems: 'center',
    },
    supportText: {
        fontSize: 16,
        fontFamily: '400',
        color: Colors.light.text,
        textAlign: 'center',
    },
    contactLink: {
        fontSize: 16,
        fontFamily: '500',
        color: Colors.light.primary,
        textDecorationLine: 'underline',
    },
    trackingText: {
        fontSize: 14,
        fontFamily: '400',
        color: Colors.light.text,
        marginTop: 5,
        marginLeft: 15,
    },
    trackingNumber: {
        fontSize: 15,
        fontFamily: '600',
        color: Colors.light.impact,
        textDecorationLine: 'underline',
        marginTop: 5,
    }
});