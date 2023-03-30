import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, FlatList, Platform, LayoutAnimation } from 'react-native'
import React, { useLayoutEffect, useCallback, useState, useEffect, useRef, useMemo } from 'react'
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from '../firebase';


export const ChatScreen = ({ route }) => {
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState([]);
    const flatListRef = useRef(null);

    // console.log(auth.currentUser);
    const { data } = route.params;
    console.log(data);
    const navigation = useNavigation();
    useLayoutEffect(() => {
        navigation.setOptions({
            title: data.chatName
        })
    }, [])

    const sendMessage = useCallback(() => {
        const messagesRef = collection(db, "chats", data.id, "messages");
        addDoc(messagesRef, {
            timestamp: serverTimestamp(),
            message: input,
            uid: data.user.user.uid,
            name: data.user._tokenResponse.displayName,
        });
        setInput("");
        console.log('Message Send');

    }, [data.id, data.user._tokenResponse.displayName, data.user.user.uid, input]);

    useEffect(() => {
        const q = query(
            collection(db, 'chats', data.id, 'messages'),
            orderBy('timestamp')
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMessages(data);
            // console.log(data);
            if (data.length > 0) {
                flatListRef.current.scrollToEnd();
            }
        });
        return () => {
            unsubscribe();
        };
    }, [data.id, flatListRef]);
    // console.log(messages[1].message);

    const formatTimestamp = useMemo(() => {
        return (timestamp) => {
            if (!timestamp) {
                return '';
            }
            const date = new Date(timestamp.seconds * 1000);
            const hours = date.getHours();
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }
    }, []);
    function isUserMessage(message) {
        // console.log(message);
        return message.uid === data.user.user.uid;
    }

    return (
        <KeyboardAvoidingView backgroundColor="white" behavior={Platform.OS === 'ios' ? 'padding' : 0} flex={1}>
            <View marginBottom={50}>
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    ref={flatListRef}
                    renderItem={({ item }) => {
                        // console.log(item)

                        return (
                            <View style={isUserMessage(item) ? styles.userChat : styles.otherChat} padding={12} margin={10}>
                                <Text style={isUserMessage(item) ? styles.userMessages : styles.otherMessages}>{item.name}</Text>
                                <View style={styles.messageContainer}>
                                    <Text style={styles.message}>{item.message}</Text>
                                    <Text style={styles.time}>{formatTimestamp(item.timestamp)}</Text>
                                </View>
                            </View>

                        )
                    }
                    }
                />
            </View>

            <View style={styles.keyboard}>

                <TextInput
                    style={styles.input}
                    onChangeText={(t) => setInput(t)}
                    value={input}
                    onSubmitEditing={sendMessage}
                    placeholder="Enter message"
                    placeholderTextColor="#fff"
                />
                <FontAwesome style={styles.icon} disabled={!input} onPress={sendMessage} name="send" size={26} color="#fff" />
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    main: {
        flex: 0.8
    },
    keyboard: {
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 20,
        backgroundColor: "navy",
        marginTop: 'auto',
    },
    input: {
        padding: 8,
        borderWidth: 1,
        borderRadius: 20,
        borderColor: '#fff',
        width: "90%",
        color: 'white'
    },
    icon: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 5,
        margin: 5,
    },
    userChat: {
        alignSelf: 'flex-end',
        fontWeight: 'bold',
        backgroundColor: 'navy',
        margin: 8,
    },
    otherChat: {
        alignSelf: 'flex-start',
        fontWeight: 'bold',
        backgroundColor: 'navy',
        margin: 8,
    },
    userMessages: {
        paddingVertical: 2,
        fontWeight: 'bold',
        color: 'white',
    },
    otherMessages: {
        paddingVertical: 2,
        fontWeight: 'bold',
        color: 'white',
    },
    messageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        maxWidth: 200, // Set to the maximum width of the message container
    },
    message: {
        color: 'white',
        fontSize: 18,
    },
    time: {
        fontSize: 13,
        color: 'white',
        marginLeft: 'auto',
        marginTop: 'auto',
        padding:6
    },
});
