import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const LoadingDark = () => (
    <View style={[styles.container, styles.horizontal]}>
        <ActivityIndicator size="small" color="#EBF1F6" />
    </View>
);

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
});

export default LoadingDark;