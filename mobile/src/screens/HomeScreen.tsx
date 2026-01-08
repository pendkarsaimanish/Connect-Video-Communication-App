import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';

export default function HomeScreen() {
  const [roomId, setRoomId] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const startCall = () => {
    // Generate a random room ID or use a predefined one
    const newRoomId = Math.random().toString(36).substring(7);
    navigation.navigate('Call', { roomId: newRoomId, isCaller: true });
  };

  const joinCall = () => {
    if (roomId) {
      navigation.navigate('Call', { roomId, isCaller: false });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-900 p-4">
      <Text className="text-3xl text-white font-bold mb-12">Video Call App</Text>

      <TouchableOpacity 
        onPress={startCall}
        className="w-full max-w-xs bg-green-600 rounded-lg py-4 items-center mb-6"
      >
        <Text className="text-white font-bold text-lg">Start New Call</Text>
      </TouchableOpacity>

      <View className="w-full max-w-xs flex-row space-x-2 mb-12">
        <TextInput
          onChangeText={setRoomId}
          value={roomId}
          placeholder="Enter Room ID"
          placeholderTextColor="#9ca3af"
          className="flex-1 bg-gray-800 text-white rounded-lg px-4 border border-gray-700"
          autoCapitalize="none"
        />
        <TouchableOpacity 
          onPress={joinCall}
          className="bg-blue-600 rounded-lg px-6 justify-center"
        >
          <Text className="text-white font-semibold">Join</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        onPress={handleLogout}
        className="bg-red-500/20 px-6 py-2 rounded-full border border-red-500/50"
      >
        <Text className="text-red-400 font-semibold">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
