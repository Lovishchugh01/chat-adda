import React, { useLayoutEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Image, Platform } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, updateProfile } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebase';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';

const RegisterScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('')
    const navigation = useNavigation();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const [isLoading, setIsLoading] = useState(false);
    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        })

    }, [navigation])



    const auth = getAuth();

    const handleRegistration = (email, password) => {
        // Email validation
        if (!email || !emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }
        // Password validation
        if (!password || password.length < 6) {
            alert("Password should be at least 6 characters long.");
            return;
        }
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                updateProfile(user, {
                    displayName: name
                })
                const myUserUid = auth.currentUser.uid;
                // Add user data to Firestore
                setDoc(doc(db, "users", `${myUserUid}`), {
                    uid: myUserUid,
                    email: email,
                    name,
                });
                navigation.navigate("Home");
            })
            .catch((err) => console.log(err));
    };


    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <Image source={require('../assets/logo.png')} style={{ height: 200, width: 200 }} />

            <Text style={styles.title}>Registration Page</Text>
            {error.length > 0 && <Text style={styles.error}>{error}</Text>}

            <TextInput
                style={styles.input}
                placeholder="Name"
                onChangeText={setName}
                value={name}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                onChangeText={setEmail}
                value={email}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry={true}
                onChangeText={setPassword}
                value={password}
            />
            <TouchableOpacity style={styles.button} onPress={() => handleRegistration(email, password)}>
                <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 0
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'navy'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 10,
        marginVertical: 10,
        width: '80%',
    },
    button: {
        width: '80%',
        padding: 10,
        backgroundColor: 'navy',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
        fontSize: 20,
        marginBottom: 12,
    }
});

export default RegisterScreen