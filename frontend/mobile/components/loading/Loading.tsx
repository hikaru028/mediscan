import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const Loading = () => (
    <View style={[styles.container, styles.horizontal]}>
        <ActivityIndicator size="small" color="#85ccb8" />
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

export default Loading;