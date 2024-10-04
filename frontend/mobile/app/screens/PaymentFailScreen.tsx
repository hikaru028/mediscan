import React, { FC } from 'react';
import { StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { View, Text } from '@/components/Themed';
import { Colors } from '../../constants/colors';
import PaymentFailedImage from '@/assets/images/pay-failed.png';

type Props = {
    setIsPaymentFailScreen: (value: boolean) => void;
}

const PaymentFailScreen: FC<Props> = ({ setIsPaymentFailScreen }) => {
    const handleButton = () => {
        setIsPaymentFailScreen(false)
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Success image and message */}
            <View style={styles.mainSection}>
                <Image source={PaymentFailedImage} alt='image' style={styles.mainImage} contentFit='contain' />
                <Text style={styles.mainText}>Oops!</Text>
                <Text style={styles.mainSubText}>It seems something went wrong, please try it again</Text>
            </View>

            <View style={styles.separator} />

            {/* Prompt message */}
            <View style={styles.promptCover}>
                <Text style={styles.promptText}>Please Go back to the checkout page</Text>
                <Text style={styles.promptText}>by clicking the following button</Text>
            </View>

            {/* Button */}
            <TouchableOpacity style={styles.ButtonCover} onPress={handleButton}>
                <Text style={styles.buttonText}>Try it again</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default PaymentFailScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.background,
    },
    mainSection: {
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        width: '75%',
    },
    mainImage: {
        width: 200,
        height: 200,
    },
    mainText: {
        fontSize: 40,
        fontFamily: '700',
        color: Colors.light.error,
        textAlign: 'center',
        marginBottom: 10,
    },
    mainSubText: {
        fontSize: 20,
        fontFamily: '400',
        color: Colors.light.error,
        textAlign: 'center',
    },
    separator: {
        marginVertical: 20,
        height: 1,
        width: '80%',
        paddingHorizontal: 15,
        backgroundColor: Colors.light.error,
    },
    promptCover: {
        width: '80%',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    promptText: {
        fontSize: 16,
        fontFamily: '400',
        textAlign: 'center',
        color: Colors.light.text,
    },
    ButtonCover: {
        width: '80%',
        height: 70,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginTop: 50,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.error,
    },
    buttonText: {
        fontSize: 20,
        fontFamily: '400',
        textAlign: 'center',
        color: Colors.light.background,
    },
});