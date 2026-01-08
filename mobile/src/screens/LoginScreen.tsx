import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center items-center bg-gray-900 p-4">
      <Text className="text-3xl text-white font-bold mb-8">Welcome Back</Text>
      
      <View className="w-full max-w-sm">
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          placeholderTextColor="#9ca3af"
          className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-4 border border-gray-700 focus:border-blue-500"
          autoCapitalize="none"
        />
        
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          className="bg-gray-800 text-white rounded-lg px-4 py-3 mb-6 border border-gray-700 focus:border-blue-500"
          autoCapitalize="none"
        />

        <TouchableOpacity 
          onPress={signInWithEmail}
          disabled={loading}
          className={`bg-blue-600 rounded-lg py-3 items-center ${loading ? 'opacity-50' : ''}`}
        >
          <Text className="text-white font-semibold text-lg">Sign In</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-400">Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text className="text-blue-400 font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
