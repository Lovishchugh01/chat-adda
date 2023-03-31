import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, FlatList, ActivityIndicator, Platform, LayoutAnimation, Image } from 'react-native'
import React, { useLayoutEffect, useCallback, useState, useEffect, useRef, useMemo } from 'react'
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, Foundation } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from '../firebase';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

export const ChatScreen = ({ route }) => {
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    
    const flatListRef = useRef(null);

    const { data } = route.params;
    // console.log(data);
    const navigation = useNavigation();
    useLayoutEffect(() => {
        navigation.setOptions({
            title: data.chatName
        })
    }, [])
    
    const pickImage = useCallback(async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
            if (!result.canceled) {
                setSelectedImage(result.uri);
                uploadImage(result.uri);
            }
        } catch (error) {
            console.log(error);
        }
    }, [uploadImage]);
      
    const uploadImage = async (uri) => {
        const storage = getStorage();
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `lovish/${Date.now()}`);
        await uploadBytes(storageRef, blob);
        url = await getDownloadURL(storageRef);
        sendImage();
        // return url;
    };

    const sendImage = useCallback(async () => {
        const messagesRef = collection(db, 'chats', data.id, 'messages');
        await addDoc(messagesRef, {
          timestamp: serverTimestamp(),
        //   message: input.trim(),
          uid: data.user.user.uid,
          name: data.user._tokenResponse.displayName,
          imageUrl: url,
        });

        setInput('');
        setSelectedImage(null);
      }, [data.id, input, selectedImage]);

    const sendMessage = useCallback(async () => {
        if (input.trim() === '') {
          return;
        }
        const messagesRef = collection(db, 'chats', data.id, 'messages');
        await addDoc(messagesRef, {
          timestamp: serverTimestamp(),
          message: input.trim(),
          uid: data.user.user.uid,
          name: data.user._tokenResponse.displayName,
        });
        setInput('');
        setSelectedImage(null);
      }, [data.id, input, selectedImage]);
      

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
    
    const isUserMessage = useCallback((message) => message.uid === data.user.user.uid, [data.user.user.uid]);

    useEffect(() => {
        if (messages.length > 0) {
          flatListRef.current.scrollToEnd();
        }
      }, [messages]);

      const renderItem = ({ item, index }) => {
        const isLastItem = index === messages.length - 1;
    
        return (
          <View style={isUserMessage(item) ? styles.userChat : styles.otherChat} padding={12} margin={10}>
            <Text style={isUserMessage(item) ? styles.userMessages : styles.otherMessages}>{item.name}</Text>
            {item.imageUrl ? (
              <View style={styles.imageContainer}>
                    <Image source={{ uri: item.imageUrl }} style={styles.image}/>
                    <Text style={styles.time}>{formatTimestamp(item.timestamp)}</Text>
              </View>
            ) : (
              <View style={styles.messageContainer}>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>{formatTimestamp(item.timestamp)}</Text>
              </View>
            )}
          </View>
        );
      };

    return (
        <KeyboardAvoidingView backgroundColor="white" behavior={Platform.OS === 'ios' ? 'padding' : 0} flex={1}>
            <View marginBottom={50}>
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    ref={flatListRef}
                    renderItem={renderItem}
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
                <Foundation style={styles.icon} name="photo" size={24} color="#fff" onPress={pickImage} />
                <FontAwesome style={styles.icon} onPress={sendMessage} name="send" size={26} color="#fff" />
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    main: {
        flex: 0.8
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: 200,
        height: 200,
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
        width: "80%",
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
        padding: 6
    },
});
