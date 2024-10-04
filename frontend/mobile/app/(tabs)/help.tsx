import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { Text, View } from '@/components/Themed';
import EmergencyCard from '@/components/cards/EmergencyCard';
import Loading from '@/components/loading/Loading';
import { useQuery } from '@tanstack/react-query';
import { Profile } from '@/utils/index';
import { Colors } from '@/constants/colors';
import { fetchUserProfile, fetchContacts } from '@/hooks/useUserDataFetch';
import { Emergency } from '@/utils/index';

export default function EmergencyScreen() {
    const { data: contacts, isLoading, isError } = useQuery({
        queryKey: ['contacts'],
        queryFn: fetchContacts,
    });

    if (isLoading) {
        return (
            <SafeAreaView style={styles.LoadingContainer}>
                <Loading />
            </SafeAreaView>
        );
    }

    if (isError) {
        return (
            <SafeAreaView style={styles.LoadingContainer}>
                <Text style={styles.errorText}>Cannot display contacts</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.textCover}>
                <Text style={styles.warnText}>Only allows you to call when requiring an urgent assistance</Text>
            </View>
            <View style={styles.gridContainer}>
                {(contacts && contacts.length > 0) ? (
                    contacts.map((contact: Emergency, index: number) => (
                        <EmergencyCard key={contact.id} index={index + 1} data={contact} />
                    ))
                ) : (
                    <Text>No contacts available</Text>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    LoadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.background,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        color: Colors.light.text,
    },
    textCover: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    text: {
        fontSize: 22,
        fontFamily: '500',
        textAlign: 'center',
    },
    warnText: {
        fontSize: 18,
        fontFamily: '400',
        color: Colors.light.warning,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 80,
    },
    errorText: {
        fontSize: 18,
        fontFamily: '400',
        color: Colors.light.text,
        textAlign: 'center',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    gridItem: {
        width: '48%',
        marginBottom: 5,
    },
});