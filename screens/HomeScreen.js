import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { getAuth, signOut } from 'firebase/auth'
import { auth, db } from '../firebase'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import { doc, collection, getDocs, onSnapshot } from "firebase/firestore";
import { Divider, ListItem } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';

const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem('userData');
  } catch (error) {
    console.log(error);
  }
};
const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    if (userData !== null) {
      return JSON.parse(userData);
    }
  } catch (error) {
    console.log(error);
  }
};


const HomeScreen = ({ navigation }) => {
  const [chats, setChats] = useState([])
  const [user,setUser]=useState(null);

  const auth = getAuth();
  // console.log(auth.currentUser);
  useEffect(() => {
    const unSubscribe = onSnapshot(collection(db, 'chats'),
      (snapshot) => {
        setChats(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),

          }))
        )
      });
    return unSubscribe;

  }, [])

  useEffect(() => {
    getUserData().then((userData) => {
      if (userData) {
        setUser(userData);
        // navigation.replace("Home")
      }
    });
  }, []);
  // console.log(user);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Chat Adda',

      headerRight: () => (
        <View style={styles.headerRight}>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => navigation.navigate("AddChat")}
          >
            <SimpleLineIcons name="pencil" size={26} color="navy" marginRight={15} />
          </TouchableOpacity>
          <FontAwesome name="sign-out" size={26} onPress={onSignOut} color="navy" />
        </View>
      ),
    })
  }, [])

  const onSignOut = () => {
    signOut(auth).then(
      clearUserData(),
      navigation.replace('Login')
    )
  }
  return (
    <ScrollView marginTop={12}>
      {chats.map((item) => {
        // console.log(item.id);
        return (
          <>
            <TouchableOpacity onPress={()=> navigation.navigate('ChatScreen',{
              data: {
                id: item.id,
                chatName: item.data.chatName,
                user: user
              }
            })}>
              <ListItem key={item.id}>
                  <MaterialCommunityIcons name="face-man-profile" size={24} color="navy" />
                <ListItem.Content style={styles.items}>
                  <ListItem.Title>{item.data.chatName}</ListItem.Title>
                </ListItem.Content>
              </ListItem>
            </TouchableOpacity>
            <Divider/>
          </>
        )
      }
      )}
    </ScrollView>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginRight: 10,
  },
  items:{
    // flexDirection: "row",
  }
})

