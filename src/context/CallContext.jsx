import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import chatWebSocketService from '../services/websocket/chatWebSocket';
import webRTCService from '../services/webrtc/webRTCService';
import { useToast } from '../components/common/Toast';

const CallContext = createContext(null);

export const CallProvider = ({ children, currentUserId }) => {
    const { showToast } = useToast();
    const [callState, setCallState] = useState({
        isActive: false,
        isIncoming: false,
        isOutgoing: false,
        remoteUser: null,
        isVideo: true,
        isMuted: false,
        isCameraOff: false,
        stream: null,
        remoteStream: null,
    });

    const callTimeoutRef = useRef(null);

    // Initial listener for call signals
    useEffect(() => {
        if (!currentUserId) return;

        const unsubscribe = chatWebSocketService.onCallSignal(async (event) => {
            console.log('[Call] Signal received:', event.type, event);

            switch (event.type) {
                case 'CALL_OFFER':
                    if (callState.isActive) {
                        // Busy
                        chatWebSocketService.sendCallSignal({
                            type: 'CALL_REJECTED',
                            recipientId: event.senderId,
                            payload: { reason: 'BUSY' }
                        });
                        return;
                    }
                    setCallState({
                        isActive: true,
                        isIncoming: true,
                        remoteUser: event.senderId,
                        isVideo: event.isVideo,
                        isMuted: false,
                        isCameraOff: false,
                        payload: event.payload // The offer
                    });
                    // Audio for ringing
                    // playRingingTone(); 
                    break;

                case 'CALL_ANSWER':
                    await webRTCService.handleAnswer(event.senderId, event.payload);
                    setCallState(prev => ({ ...prev, isOutgoing: false, isIncoming: false }));
                    break;

                case 'ICE_CANDIDATE':
                    await webRTCService.addIceCandidate(event.senderId, event.payload);
                    break;

                case 'CALL_REJECTED':
                    showToast('Call rejected', 'info');
                    endCallLocal();
                    break;

                case 'CALL_ENDED':
                    endCallLocal();
                    break;

                case 'CALL_MISSED':
                    showToast('Recipient is offline', 'warning');
                    endCallLocal();
                    break;
            }
        });

        // WebRTC callbacks
        webRTCService.onLocalStream = (stream) => {
            setCallState(prev => ({ ...prev, stream }));
        };

        webRTCService.onRemoteStream = (userId, stream) => {
            setCallState(prev => ({ ...prev, remoteStream: stream }));
        };

        webRTCService.onIceCandidate = (userId, candidate) => {
            chatWebSocketService.sendCallSignal({
                type: 'ICE_CANDIDATE',
                recipientId: userId,
                payload: candidate
            });
        };

        return () => {
            unsubscribe();
            webRTCService.disconnect();
        };
    }, [currentUserId, callState.isActive, showToast]);

    const startCall = async (recipientId, isVideo = true) => {
        try {
            setCallState({
                isActive: true,
                isOutgoing: true,
                remoteUser: recipientId,
                isVideo,
                isMuted: false,
                isCameraOff: false
            });

            await webRTCService.initLocalStream(isVideo);
            const offer = await webRTCService.createOffer(recipientId);

            chatWebSocketService.sendCallSignal({
                type: 'CALL_OFFER',
                recipientId,
                isVideo,
                payload: offer
            });

            // Set timeout for missed call
            callTimeoutRef.current = setTimeout(() => {
                if (callState.isOutgoing) {
                    endCall();
                    showToast('No answer', 'info');
                }
            }, 30000);

        } catch (err) {
            console.error('Failed to start call:', err);
            showToast('Could not access camera/microphone', 'error');
            endCallLocal();
        }
    };

    const acceptCall = async () => {
        try {
            await webRTCService.initLocalStream(callState.isVideo);
            const answer = await webRTCService.handleOffer(callState.remoteUser, callState.payload);

            chatWebSocketService.sendCallSignal({
                type: 'CALL_ANSWER',
                recipientId: callState.remoteUser,
                payload: answer
            });

            setCallState(prev => ({ ...prev, isIncoming: false }));
        } catch (err) {
            console.error('Failed to accept call:', err);
            endCall();
        }
    };

    const rejectCall = () => {
        chatWebSocketService.sendCallSignal({
            type: 'CALL_REJECTED',
            recipientId: callState.remoteUser
        });
        endCallLocal();
    };

    const endCall = () => {
        if (callState.remoteUser) {
            chatWebSocketService.sendCallSignal({
                type: 'CALL_ENDED',
                recipientId: callState.remoteUser
            });
        }
        endCallLocal();
    };

    const endCallLocal = () => {
        webRTCService.disconnect();
        if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
        setCallState({
            isActive: false,
            isIncoming: false,
            isOutgoing: false,
            remoteUser: null,
            stream: null,
            remoteStream: null
        });
    };

    const toggleMute = () => {
        const muted = webRTCService.toggleMute();
        setCallState(prev => ({ ...prev, isMuted: muted }));
    };

    const toggleCamera = () => {
        const off = webRTCService.toggleVideo();
        setCallState(prev => ({ ...prev, isCameraOff: off }));
    };

    return (
        <CallContext.Provider value={{
            callState,
            startCall,
            acceptCall,
            rejectCall,
            endCall,
            toggleMute,
            toggleCamera
        }}>
            {children}
        </CallContext.Provider>
    );
};

export const useCall = () => useContext(CallContext);
