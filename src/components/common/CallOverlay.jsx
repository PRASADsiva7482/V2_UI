import React, { useEffect, useRef } from 'react';
import { useCall } from '../../context/CallContext';
import Avatar from './Avatar';
import './CallOverlay.css';

const CallOverlay = () => {
    const { callState, acceptCall, rejectCall, endCall, toggleMute, toggleCamera } = useCall();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // Sync streams with video elements
    useEffect(() => {
        if (localVideoRef.current && callState.stream) {
            localVideoRef.current.srcObject = callState.stream;
        }
    }, [callState.stream, callState.isActive]);

    useEffect(() => {
        if (remoteVideoRef.current && callState.remoteStream) {
            remoteVideoRef.current.srcObject = callState.remoteStream;
        }
    }, [callState.remoteStream, callState.isActive]);

    if (!callState.isActive) return null;

    return (
        <div className="call-overlay-container">
            <div className={`call-main-area ${callState.remoteStream ? 'connected' : 'waiting'}`}>
                {/* Remote Stream (Full Screen when connected) */}
                {callState.remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="remote-video"
                    />
                ) : (
                    <div className="call-waiting-screen">
                        <Avatar username={callState.remoteUser} size="xlarge" />
                        <h2 className="call-user-name">@{callState.remoteUser}</h2>
                        <div className="call-status">
                            {callState.isIncoming ? 'Incoming video call...' : 'Calling...'}
                        </div>
                    </div>
                )}

                {/* Local Stream (Picture-in-Picture) */}
                {callState.stream && (
                    <div className={`local-video-container ${callState.remoteStream ? 'pip' : 'preview'}`}>
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="local-video"
                        />
                        {callState.isCameraOff && (
                            <div className="camera-off-overlay">
                                <Avatar username="Me" size="medium" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="call-controls-bar">
                {callState.isIncoming ? (
                    <div className="incoming-actions">
                        <button className="call-btn accept" onClick={acceptCall}>
                            <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                                <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1A11.36 11.36 0 018.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 12h2a9 9 0 00-9-9v2a7 7 0 017 7z" />
                                <path d="M15 12h2a5 5 0 00-5-5v2a3 3 0 013 3z" />
                            </svg>
                            <span>Accept</span>
                        </button>
                        <button className="call-btn reject" onClick={rejectCall}>
                            <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                                <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.58.9a15.05 15.05 0 00-4.39 2.1c-.28.18-.36.54-.19.82l1.23 2.1c.16.28.52.38.8.21a17.5 17.5 0 015.09-2.21c.15-.02.26-.15.26-.3V9c1.47-.46 3.03-.46 4.5 0v7.64c0 .15.11.28.26.3a17.5 17.5 0 015.09 2.21c.28.17.64.07.8-.21l1.23-2.1c.17-.28.09-.64-.19-.82a15.05 15.05 0 00-4.39-2.1 1.002 1.002 0 00-.58-.9V9.72c-1.45-.47-2.99-.72-4.59-.72z" />
                            </svg>
                            <span>Reject</span>
                        </button>
                    </div>
                ) : (
                    <div className="active-actions">
                        <button className={`call-btn secondary ${callState.isMuted ? 'active' : ''}`} onClick={toggleMute}>
                            {callState.isMuted ? (
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1.02 1.15.49 3.52 3.27 6.27 6.93 6.7V21h2v-3.15c3.66-.43 6.44-3.18 6.93-6.7.07-.61-.41-1.15-1.02-1.15z" />
                                </svg>
                            )}
                        </button>

                        <button className="call-btn hangup" onClick={endCall}>
                            <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                                <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.58.9a15.05 15.05 0 00-4.39 2.1c-.28.18-.36.54-.19.82l1.23 2.1c.16.28.52.38.8.21a17.5 17.5 0 015.09-2.21c.15-.02.26-.15.26-.3V9c1.47-.46 3.03-.46 4.5 0v7.64c0 .15.11.28.26.3a17.5 17.5 0 015.09 2.21c.28.17.64.07.8-.21l1.23-2.1c.17-.28.09-.64-.19-.82a15.05 15.05 0 00-4.39-2.1 1.002 1.002 0 00-.58-.9V9.72c-1.45-.47-2.99-.72-4.59-.72z" />
                            </svg>
                        </button>

                        <button className={`call-btn secondary ${callState.isCameraOff ? 'active' : ''}`} onClick={toggleCamera}>
                            {callState.isCameraOff ? (
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M18 10.41V7c0-1.1-.9-2-2-2H6.83l2 2H16v3.59l2 2V10.41zM2.1 2.1L.69 3.51 3.56 6.38c-.34.18-.56.54-.56.95v10c0 1.1.9 2 2 2h10c.41 0 .77-.23.96-.56l4.58 4.58 1.41-1.41L2.1 2.1zM5 17.33l1.74-1.74L13.07 19H5v-1.67z" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                                </svg>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CallOverlay;
