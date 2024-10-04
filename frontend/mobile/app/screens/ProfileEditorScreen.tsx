import React, { FC, useState } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Text, View } from '@/components/Themed';
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Profile } from '../../utils/index';
import { Colors } from '../../constants/colors';
import ConfirmModal from '../../components/modals/ConfirmModal';
import ArrowLeftIcon from '@/assets/images/arrow-left.png';
import LoadingLight from '@/components/loading/LoadingLight';
import axiosClient from '@/app/api/axiosClient';

type Props = {
    authUser: Profile;
    onSave: (updatedProfile: Profile) => void;
    onClose: () => void;
};

const ProfileEditorScreen: FC<Props> = ({ authUser, onSave, onClose }) => {
    const queryClient = useQueryClient();
    const [fullName, setFullName] = useState(authUser.fullName ? authUser.fullName : '');
    const [ethnicity, setEthnicity] = useState(authUser.ethnicity ? authUser.ethnicity : '');
    const [gender, setGender] = useState(authUser.gender ? authUser.gender : '');
    const dob = authUser.dob ? new Date(authUser.dob) : '';
    const [dobDay, setDobDay] = useState(dob ? dob.getDate().toString().padStart(2, '0') : '');
    const [dobMonth, setDobMonth] = useState(dob ? (dob.getMonth() + 1).toString().padStart(2, '0') : '');
    const [dobYear, setDobYear] = useState(dob ? dob.getFullYear().toString() : '');
    const [phone, setPhone] = useState(authUser.phone ? authUser.phone.toString() : '');
    const [email, setEmail] = useState(authUser.email ? authUser.email : '');
    const [address, setAddress] = useState(authUser.address ? authUser.address : '');
    const [ethnicityOpen, setEthnicityOpen] = useState(false);
    const [genderOpen, setGenderOpen] = useState(false);
    const [dayOpen, setDayOpen] = useState(false);
    const [monthOpen, setMonthOpen] = useState(false);
    const [yearOpen, setYearOpen] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const [updatedProfile, setUpdatedProfile] = useState<Profile | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const ethnicityItems = [
        { label: 'Maori', value: 'Maori' },
        { label: 'Pacific Islander', value: 'Pacific Islander' },
        { label: 'Asian', value: 'Asian' },
        { label: 'European', value: 'European' },
        { label: 'American', value: 'American' },
        { label: 'African', value: 'African' },
        { label: 'Other', value: 'Other' },
    ];

    const genderItems = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Prefer not to say', value: 'Prefer not to say' },
    ];

    const days = Array.from({ length: 31 }, (_, i) => ({ label: (i + 1).toString().padStart(2, '0'), value: (i + 1).toString().padStart(2, '0') }));
    const months = [
        { label: 'January', value: '01' },
        { label: 'February', value: '02' },
        { label: 'March', value: '03' },
        { label: 'April', value: '04' },
        { label: 'May', value: '05' },
        { label: 'June', value: '06' },
        { label: 'July', value: '07' },
        { label: 'August', value: '08' },
        { label: 'September', value: '09' },
        { label: 'October', value: '10' },
        { label: 'November', value: '11' },
        { label: 'December', value: '12' },
    ];
    const years = Array.from({ length: 100 }, (_, i) => ({
        label: (new Date().getFullYear() - i).toString(),
        value: (new Date().getFullYear() - i).toString(),
    }));

    const handleFocus = (input: string) => {
        if (input === 'ethnicity') {
            setGenderOpen(false);
            setDayOpen(false);
            setMonthOpen(false);
            setYearOpen(false);
            setFocusedInput(null);
        } else if (input === 'gender') {
            setEthnicityOpen(false);
            setDayOpen(false);
            setMonthOpen(false);
            setYearOpen(false);
            setFocusedInput(null);
        } else if (input === 'day') {
            setEthnicityOpen(false);
            setGenderOpen(false);
            setMonthOpen(false);
            setYearOpen(false);
            setFocusedInput('day');
        } else if (input === 'month') {
            setEthnicityOpen(false);
            setGenderOpen(false);
            setDayOpen(false);
            setYearOpen(false);
            setFocusedInput('month');
        } else if (input === 'year') {
            setEthnicityOpen(false);
            setGenderOpen(false);
            setDayOpen(false);
            setMonthOpen(false);
            setFocusedInput('year');
        } else {
            setFocusedInput(input);
            setGenderOpen(false);
            setEthnicityOpen(false);
            setDayOpen(false);
            setMonthOpen(false);
            setYearOpen(false);
        }
    };

    const handleBlur = () => {
        setFocusedInput(null);
    };

    const handlePressOutside = () => {
        setEthnicityOpen(false);
        setGenderOpen(false);
        setDayOpen(false);
        setMonthOpen(false);
        setYearOpen(false);
        Keyboard.dismiss();
    };

    const { mutate: updateMutation } = useMutation({
        mutationFn: async (updatedProfile: Profile) => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const res = await axiosClient.put('/customers/update', updatedProfile, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    withCredentials: true,
                });
                return res.data;
            } catch (error: any) {
                throw new Error('Failed to update profile');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
            onSave(updatedProfile!);
        },
        onError: (error: any) => {
            console.error('Failed to update profile:', error);
        },
    });

    const handleSave = () => {
        setIsLoading(true);
        const customerId = authUser.id;

        let formattedDob = '';

        if (dobDay && dobMonth && dobYear) {
            const day = parseInt(dobDay, 10);
            const month = parseInt(dobMonth, 10) - 1;
            const year = parseInt(dobYear, 10);

            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                const dateObject = new Date(year, month, day);
                formattedDob = dateObject.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
            } else {
                console.error('Invalid date components', { day, month, year });
                return;
            }
        } else {
            formattedDob = '';
        }

        const updatedProfileData: Profile = {
            id: customerId,
            fullName: fullName,
            ethnicity,
            gender,
            dob: formattedDob,
            phone: parseInt(phone, 10),
            email,
            address,
        };

        setUpdatedProfile(updatedProfileData);
        updateMutation(updatedProfileData);
        setIsLoading(false);
    };

    const handleDelete = () => {
        setModalVisible(true);
    }

    return (
        <TouchableWithoutFeedback onPress={handlePressOutside}>
            <Animated.View
                entering={SlideInRight}
                exiting={SlideOutRight}
                style={styles.container}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 125 : 0}
                >
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.header}>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Image source={ArrowLeftIcon} style={styles.closeIcon} alt='image' contentFit='contain' />
                            </TouchableOpacity>
                            <View style={styles.titleCover}>
                                <Text style={styles.text}>Edit Profile</Text>
                            </View>
                        </View>
                        <View style={{ flexGrow: 1, justifyContent: 'center' }}>
                            <TextInput
                                style={[
                                    styles.input,
                                    focusedInput === 'fullName' && styles.focusedInput
                                ]}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder='Full Name'
                                onFocus={() => handleFocus('fullName')}
                                onBlur={handleBlur}
                            />

                            <View style={{ zIndex: ethnicityOpen ? 5000 : 1, width: '100%' }}>
                                <DropDownPicker
                                    open={ethnicityOpen}
                                    value={ethnicity}
                                    items={ethnicityItems}
                                    setOpen={setEthnicityOpen}
                                    setValue={setEthnicity}
                                    setItems={() => { }}
                                    placeholder='Select Ethnicity'
                                    style={[
                                        styles.input,
                                        focusedInput === 'ethnicity' && styles.focusedInput
                                    ]}
                                    dropDownContainerStyle={styles.dropdown}
                                    onOpen={() => handleFocus('ethnicity')}
                                    onClose={() => setFocusedInput(null)}
                                />
                            </View>

                            <View style={{ zIndex: genderOpen ? 5000 : 1, width: '100%' }}>
                                <DropDownPicker
                                    open={genderOpen}
                                    value={gender}
                                    items={genderItems}
                                    setOpen={setGenderOpen}
                                    setValue={setGender}
                                    setItems={() => { }}
                                    placeholder='Select Gender'
                                    style={[
                                        styles.input,
                                        focusedInput === 'gender' && styles.focusedInput
                                    ]}
                                    dropDownContainerStyle={styles.dropdown}
                                    onOpen={() => handleFocus('gender')}
                                    onClose={() => setFocusedInput(null)}
                                />
                            </View>

                            <View style={[styles.datePickerContainer, { zIndex: dayOpen || monthOpen || yearOpen ? 5000 : 1 }]}>
                                <View style={[{ zIndex: dayOpen ? 6000 : 1, width: '30%' }]}>
                                    <DropDownPicker
                                        open={dayOpen}
                                        value={dobDay}
                                        items={days}
                                        setOpen={setDayOpen}
                                        setValue={setDobDay}
                                        placeholder='DD'
                                        style={[
                                            styles.dayDropdown,
                                            { borderTopLeftRadius: 10, borderBottomLeftRadius: 10, borderWidth: 0 },
                                        ]}
                                        dropDownContainerStyle={{
                                            borderBottomLeftRadius: 10,
                                            borderBottomRightRadius: 10,
                                            borderWidth: 1 / 3,
                                            borderColor: '#ccc',
                                            zIndex: dayOpen ? 6001 : 1
                                        }}
                                        onOpen={() => handleFocus('day')}
                                        onClose={handleBlur}
                                    />
                                </View>
                                <View style={[{ zIndex: monthOpen ? 6000 : 1, width: '40%' }]}>
                                    <DropDownPicker
                                        open={monthOpen}
                                        value={dobMonth}
                                        items={months}
                                        setOpen={setMonthOpen}
                                        setValue={setDobMonth}
                                        placeholder='MM'
                                        style={styles.monthDropdown}
                                        dropDownContainerStyle={{
                                            borderBottomLeftRadius: 10,
                                            borderBottomRightRadius: 10,
                                            borderWidth: 1 / 3,
                                            borderColor: '#ccc',
                                            zIndex: monthOpen ? 6001 : 1
                                        }}
                                        onOpen={() => handleFocus('month')}
                                        onClose={handleBlur}
                                    />
                                </View>
                                <View style={[{ zIndex: yearOpen ? 6000 : 1, width: '30%' }]}>
                                    <DropDownPicker
                                        open={yearOpen}
                                        value={dobYear}
                                        items={years}
                                        setOpen={setYearOpen}
                                        setValue={setDobYear}
                                        placeholder='YYYY'
                                        style={styles.yearDropdown}
                                        dropDownContainerStyle={{
                                            borderBottomLeftRadius: 10,
                                            borderBottomRightRadius: 10,
                                            borderWidth: 1 / 3,
                                            borderColor: '#ccc',
                                            zIndex: yearOpen ? 6001 : 1
                                        }}
                                        onOpen={() => handleFocus('year')}
                                        onClose={handleBlur}
                                    />
                                </View>

                            </View>

                            <TextInput
                                style={[
                                    styles.input,
                                    focusedInput === 'phone' && styles.focusedInput
                                ]}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder='Phone'
                                keyboardType='phone-pad'
                                onFocus={() => handleFocus('phone')}
                                onBlur={handleBlur}
                            />

                            <TextInput
                                style={[
                                    styles.input,
                                    focusedInput === 'email' && styles.focusedInput
                                ]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder='Email'
                                keyboardType='email-address'
                                onFocus={() => handleFocus('email')}
                                onBlur={handleBlur}
                            />

                            <TextInput
                                style={[
                                    styles.input,
                                    focusedInput === 'address' && styles.focusedInput
                                ]}
                                value={address}
                                onChangeText={setAddress}
                                placeholder='Address'
                                onFocus={() => handleFocus('address')}
                                onBlur={handleBlur}
                            />

                            <View style={styles.buttonWrap}>
                                <TouchableOpacity onPress={handleDelete} style={styles.buttonDelete}>
                                    <Text style={styles.deleteText}>Delete account</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSave} style={styles.buttonSave}>
                                    {isLoading ? (
                                        <LoadingLight />
                                    ) : (
                                        <Text style={styles.saveText}>Save profile</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                            {/* Modal for confirmation */}
                            {modalVisible && (
                                <ConfirmModal question="This action will delete all data." authUserId={authUser.id} modalVisible={modalVisible} setModalVisible={setModalVisible} />
                            )}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

export default ProfileEditorScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 5,
    },
    header: {
        width: '100%',
        height: 90,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    closeButton: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    closeIcon: {
        width: 14,
        height: 14,
    },
    titleCover: {
        flex: 1,
        alignItems: 'center',
    },
    text: {
        fontSize: 22,
        fontFamily: '500',
        textAlign: 'center',
        marginRight: 34,
    },
    input: {
        width: '100%',
        height: 60,
        fontSize: 18,
        fontFamily: '300',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 20,
        backgroundColor: '#E2EAF0',
        borderWidth: 1 / 3,
        borderColor: '#CFCFCF',
    },
    focusedInput: {
        fontSize: 18,
        fontFamily: '300',
        shadowColor: '#757575',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        borderColor: Colors.light.primary,
        borderWidth: 1,
        backgroundColor: '#F5F8FB',
    },
    dropdown: {
        borderWidth: 1 / 3,
        borderColor: '#ccc',
    },
    datePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#E2EAF0',
        width: '100%',
        marginBottom: 20,
        borderRadius: 10,
    },
    dayDropdown: {
        width: '100%',
        height: 60,
        fontSize: 18,
        fontFamily: '300',
        borderTopWidth: 1 / 3,
        borderBottomWidth: 1 / 3,
        borderLeftWidth: 1 / 3,
        borderRightWidth: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 0,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 0,
        backgroundColor: '#E2EAF0',
        borderColor: '#CFCFCF',
        zIndex: 10,
    },
    monthDropdown: {
        width: '100%',
        height: 60,
        fontSize: 18,
        fontFamily: '300',
        borderTopWidth: 1 / 3,
        borderBottomWidth: 1 / 3,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        backgroundColor: '#E2EAF0',
        borderColor: '#CFCFCF',
        zIndex: 10,
    },
    yearDropdown: {
        width: '100%',
        height: 60,
        fontSize: 18,
        fontFamily: '300',
        borderTopWidth: 1 / 3,
        borderBottomWidth: 1 / 3,
        borderLeftWidth: 0,
        borderRightWidth: 1 / 3,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 10,
        backgroundColor: '#E2EAF0',
        borderColor: '#CFCFCF',
        zIndex: 10,
    },
    buttonWrap: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        flexDirection: 'row',
        marginTop: 20,
        marginHorizontal: 'auto',
    },
    buttonSave: {
        width: 150,
        height: 70,
        backgroundColor: '#85ccb8',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 'auto',
    },
    buttonDelete: {
        width: 150,
        height: 70,
        backgroundColor: '#FFC1C1',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 'auto',
    },
    saveText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '400',
    },
    deleteText: {
        color: '#ff4949',
        fontSize: 18,
        fontWeight: '400',
    },
    listView: {
        zIndex: 3,
    },
});