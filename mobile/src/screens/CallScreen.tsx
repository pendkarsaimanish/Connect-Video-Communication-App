import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions, Platform, PermissionsAndroid } from 'react-native';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  mediaDevices
} from 'react-native-webrtc';
import { io, Socket } from 'socket.io-client';
import { useRoute, useNavigation } from '@react-navigation/native';

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};

// TODO: Replace with your actual local IP address (e.g., 192.168.1.x) or hosted backend URL
// Android Emulator uses 10.0.2.2 to access host localhost
import { SOCKET_URL } from '@env';

export default function CallScreen() {
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const socket = useRef<Socket | null>(null);

  const route = useRoute<any>();
  const navigation = useNavigation();
  const { roomId, isCaller } = route.params;



  useEffect(() => {
    startCall();

    return () => {
      cleanup();
    };
  }, []);

  const startCall = async () => {
    // 0. Request Permissions (Android)
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
      if (
        granted[PermissionsAndroid.PERMISSIONS.CAMERA] !== PermissionsAndroid.RESULTS.GRANTED ||
        granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] !== PermissionsAndroid.RESULTS.GRANTED
      ) {

        return;
      }
    }

    // 1. Setup Socket

    socket.current = io(SOCKET_URL);

    socket.current.on('connect_error', (err) => {

    });

    // Socket Events
    socket.current.on('connect', () => {

      socket.current?.emit('join-room', { roomId, userId: socket.current.id });
    });

    // Check if already connected (in case event fired before listener attached)
    if (socket.current.connected) {

      socket.current.emit('join-room', { roomId, userId: socket.current.id });
    }

    socket.current.on('user-connected', async (userId) => {

      if (isCaller) {
        createOffer();
      }
    });

    socket.current.on('offer', async (offer) => {

      if (!peerConnection.current) return;
      try {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        socket.current?.emit('answer', { roomId, answer });
      } catch (err) {

      }
    });

    socket.current.on('answer', async (answer) => {

      if (!peerConnection.current) return;
      try {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        setConnectionStatus('Connected');
      } catch (err) {

      }
    });

    socket.current.on('ice-candidate', async (candidate) => {

      if (!peerConnection.current) return;
      try {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {

      }
    });

    // 2. Get Local Stream
    try {

      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: 640,
          height: 480,
          frameRate: 30,
          facingMode: 'user',
        },
      });

      setLocalStream(stream);

      // 3. Create Peer Connection

      peerConnection.current = new RTCPeerConnection(configuration);

      // Add local stream tracks to PeerConnection
      stream.getTracks().forEach(track => {
        peerConnection.current?.addTrack(track, stream);
      });

      // Debug state changes
      // @ts-ignore
      peerConnection.current.onconnectionstatechange = () => {
        // @ts-ignore

        // @ts-ignore
        setConnectionStatus(peerConnection.current?.connectionState || 'Unknown');
      };
      // @ts-ignore
      peerConnection.current.onsignalingstatechange = () => {
        // @ts-ignore

      };
      // @ts-ignore
      peerConnection.current.oniceconnectionstatechange = () => {
        // @ts-ignore

      };

      // Handle remote stream
      // @ts-ignore
      peerConnection.current.ontrack = (event: any) => {

        if (event.streams && event.streams.length > 0) {
          setRemoteStream(event.streams[0]);
        }
      };

      // Handle ICE Candidates
      // @ts-ignore
      peerConnection.current.onicecandidate = (event: any) => {
        if (event.candidate) {

          socket.current?.emit('ice-candidate', {
            roomId,
            candidate: event.candidate,
          });
        }
      };

    } catch (err) {

    }
  };

  const createOffer = async () => {
    if (!peerConnection.current) return;
    try {

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.current?.emit('offer', { roomId, offer });
    } catch (err) {

    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach((track: any) => track.stop());
      localStream.release();
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    if (socket.current) {
      socket.current.disconnect();
    }
  };

  const endCall = () => {
    cleanup();
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 relative">
        {/* Remote Stream (Full Screen) */}
        {remoteStream ? (
          <RTCView
            streamURL={remoteStream.toURL()}
            objectFit="cover"
            style={{ flex: 1, backgroundColor: 'black' }}
          />
        ) : (
          <View className="flex-1 justify-center items-center bg-gray-800">
            <Text className="text-white text-lg">{connectionStatus}</Text>
            <Text className="text-gray-400 mt-2">Room ID: {roomId}</Text>
          </View>
        )}

        {/* Local Stream (Floating) */}
        {localStream && (
          <View className="absolute top-8 right-4 w-32 h-48 bg-black rounded-lg overflow-hidden border-2 border-gray-700">
            <RTCView
              streamURL={localStream.toURL()}
              objectFit="cover"
              zOrder={1}
              style={{ flex: 1 }}
            />
          </View>
        )}

        {/* Controls */}
        <View className="absolute bottom-8 w-full items-center">
          <TouchableOpacity
            onPress={endCall}
            className="bg-red-600 rounded-full px-8 py-4"
          >
            <Text className="text-white font-bold text-lg">End Call</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
