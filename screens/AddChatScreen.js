import { View, Text, TextInput, StyleSheet, Button } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const AddChatScreen = () => {
    const navigation = useNavigation();
    const [value, onChangeText] = React.useState('');
    const AddChat = async () =>{
        try {
            const docRef = await addDoc(collection(db,"chats"),{
                chatName: value,
                timestamp: serverTimestamp(),
            })    
        } catch (error) {
            console.log(error);
        }
        
        navigation.navigate('Home')
    }
  return (
    <View style={styles.container}>
        <TextInput
        style={{backgroundColor:'lightgrey', padding: 10, marginBottom:10, borderWidth:1}}
        maxLength={40}
        onChangeText={text => onChangeText(text)}
        value={value}
        placeholder="Enter Chat Name"
        onSubmitEditing={AddChatScreen}
      />
      <TouchableOpacity style={styles.button} onPress={AddChat} disabled={!value}>
        <Text style={styles.buttonText}>ADD</Text>
      </TouchableOpacity>

    </View>
  )
}
const styles = StyleSheet.create({
    container:{
        padding:40,
        borderWidth:2,
    },
    button: {
      backgroundColor: 'navy',
      padding:8
    },
    buttonText:{
        color:'white',
        textAlign:'center',
        fontSize:16,
    }
})
