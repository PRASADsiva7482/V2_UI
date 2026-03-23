import React, { useState, useEffect, useRef, useCallback } from 'react';
import webRTCService from '../services/webrtc/webRTCService';
import { useToast } from '../components/common/Toast';
import Avatar from '../components/common/Avatar';
import './Spaces.css';

function Spaces() {
    const [activeTab, setActiveTab] = useState('discover');
    const { showToast } = useToast();

    // Active Space state
    const [activeSpace, setActiveSpace] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [roomTimer, setRoomTimer] = useState(0);
    const [audioLevels, setAudioLevels] = useState({});
    const timerRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animFrameRef = useRef(null);

    // Create Space form
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [spaceName, setSpaceName] = useState('');
    const [spaceDesc, setSpaceDesc] = useState('');

    // Simulated live spaces (would come from API in production)
    const [liveSpaces, setLiveSpaces] = useState([]);
    const [mySpaces, setMySpaces] = useState([]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (activeSpace) {
                handleLeaveSpace();
            }
        };
    }, []);

    const startRoomTimer = () => {
        setRoomTimer(0);
        timerRef.current = setInterval(() => {
            setRoomTimer(prev => prev + 1);
        }, 1000);
    };

    const formatTimer = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    /**
     * Start audio visualization for local stream
     */
    const startAudioVisualization = useCallback((stream) => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const update = () => {
                analyser.getByteFrequencyData(dataArray);
                const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setAudioLevels(prev => ({ ...prev, 'me': avg }));
                animFrameRef.current = requestAnimationFrame(update);
            };
            update();
        } catch (e) {
            console.error('Audio visualization error:', e);
        }
    }, []);

    /**
     * Create and start hosting a Space
     */
    const handleCreateSpace = async () => {
        if (!spaceName.trim()) {
            showToast('Please enter a Space name', 'error');
            return;
        }

        try {
            const stream = await webRTCService.initLocalStream();

            const space = {
                id: `space_${Date.now()}`,
                title: spaceName,
                description: spaceDesc,
                hostName: 'You',
                hostAvatar: null,
                listenerCount: 1,
                createdAt: new Date().toISOString(),
                isLive: true
            };

            setActiveSpace(space);
            setIsHost(true);
            setIsMuted(false);
            setParticipants([
                { id: 'me', name: 'You (Host)', avatar: null, isMuted: false, isHost: true, isSpeaking: false }
            ]);

            setMySpaces(prev => [space, ...prev]);
            setLiveSpaces(prev => [space, ...prev]);

            startRoomTimer();
            startAudioVisualization(stream);
            setShowCreateForm(false);
            setSpaceName('');
            setSpaceDesc('');

            showToast('🎙️ Your Space is now live!', 'success');
        } catch (error) {
            console.error('Failed to create space:', error);
            showToast('Failed to access microphone. Please check permissions.', 'error');
        }
    };

    /**
     * Join an existing Space
     */
    const handleJoinSpace = async (space) => {
        try {
            const stream = await webRTCService.initLocalStream();

            setActiveSpace(space);
            setIsHost(false);
            setIsMuted(true);
            webRTCService.toggleMute(); // Start muted as listener

            setParticipants([
                { id: 'host', name: space.hostName || 'Host', avatar: space.hostAvatar, isMuted: false, isHost: true, isSpeaking: false },
                { id: 'me', name: 'You', avatar: null, isMuted: true, isHost: false, isSpeaking: false }
            ]);

            // Update listener count
            setLiveSpaces(prev => prev.map(s =>
                s.id === space.id ? { ...s, listenerCount: (s.listenerCount || 0) + 1 } : s
            ));

            startRoomTimer();
            startAudioVisualization(stream);

            showToast(`Joined "${space.title}"`, 'success');
        } catch (error) {
            console.error('Failed to join space:', error);
            showToast('Failed to access microphone', 'error');
        }
    };

    /**
     * Toggle mute in active Space
     */
    const handleToggleMute = () => {
        const muted = webRTCService.toggleMute();
        setIsMuted(muted);
        setParticipants(prev => prev.map(p =>
            p.id === 'me' ? { ...p, isMuted: muted } : p
        ));
    };

    /**
     * Leave the active Space
     */
    const handleLeaveSpace = () => {
        webRTCService.disconnect();

        if (timerRef.current) clearInterval(timerRef.current);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (audioContextRef.current) audioContextRef.current.close();

        // Remove from live spaces if host
        if (isHost && activeSpace) {
            setLiveSpaces(prev => prev.filter(s => s.id !== activeSpace.id));
        } else if (activeSpace) {
            setLiveSpaces(prev => prev.map(s =>
                s.id === activeSpace.id ? { ...s, listenerCount: Math.max(0, (s.listenerCount || 1) - 1) } : s
            ));
        }

        setActiveSpace(null);
        setIsHost(false);
        setIsMuted(false);
        setParticipants([]);
        setRoomTimer(0);
        setAudioLevels({});

        showToast('Left the Space', 'info');
    };

    // ─── Active Space View ───
    if (activeSpace) {
        return (
            <div className="spaces-page">
                <div className="space-active">
                    <div className="space-active-header">
                        <div className="space-active-live">
                            <span className="space-live-dot" />
                            {isHost ? 'HOSTING' : 'LIVE'}
                        </div>
                        <div className="space-active-timer">{formatTimer(roomTimer)}</div>
                    </div>

                    <h2 className="space-active-title">{activeSpace.title}</h2>
                    {activeSpace.description && (
                        <p className="space-active-desc">{activeSpace.description}</p>
                    )}

                    {/* Participants Grid */}
                    <div className="space-participants-grid">
                        {participants.map(p => (
                            <div key={p.id} className={`space-participant ${p.isSpeaking || (audioLevels[p.id] > 15) ? 'speaking' : ''}`}>
                                <div className={`space-participant-avatar ${p.isMuted ? 'muted' : ''}`}>
                                    <Avatar src={p.avatar} alt={p.name} size="medium" />
                                    {p.isMuted && (
                                        <div className="space-mute-indicator">
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                            </svg>
                                        </div>
                                    )}
                                    {(audioLevels[p.id] > 15) && !p.isMuted && (
                                        <div className="space-speaking-ring" />
                                    )}
                                </div>
                                <span className="space-participant-name">
                                    {p.name}
                                    {p.isHost && <span className="space-host-badge">Host</span>}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="space-controls">
                        <button
                            className={`space-control-btn mute-btn ${isMuted ? 'muted' : ''}`}
                            onClick={handleToggleMute}
                        >
                            {isMuted ? (
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1.02 1.15.49 3.52 3.27 6.27 6.93 6.7V21h2v-3.15c3.66-.43 6.44-3.18 6.93-6.7.07-.61-.41-1.15-1.02-1.15z" />
                                </svg>
                            )}
                            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                        </button>

                        <button className="space-control-btn leave-btn" onClick={handleLeaveSpace}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                            </svg>
                            <span>{isHost ? 'End Space' : 'Leave'}</span>
                        </button>
                    </div>

                    {/* Participant count */}
                    <div className="space-active-footer">
                        <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{formatTimer(roomTimer)}</span>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Spaces Browse View ───
    return (
        <div className="spaces-page">
            <div className="spaces-header">
                <h2>Spaces</h2>
                <p className="spaces-subtitle">Live audio conversations with your community</p>
            </div>

            <div className="spaces-tabs">
                <button className={`spaces-tab ${activeTab === 'discover' ? 'active' : ''}`} onClick={() => setActiveTab('discover')}>Discover</button>
                <button className={`spaces-tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>Upcoming</button>
                <button className={`spaces-tab ${activeTab === 'my' ? 'active' : ''}`} onClick={() => setActiveTab('my')}>My Spaces</button>
            </div>

            {/* Create Space Card */}
            <div className="spaces-create-card">
                <div className="spaces-create-icon">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1.02 1.15V12c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92v-.08c.07-.61-.41-1.15-1.02-1.15z" />
                    </svg>
                </div>
                <div className="spaces-create-content">
                    <h3>Start a Space</h3>
                    <p>Host a live audio room and connect with your followers in real-time.</p>
                </div>
                <button
                    className="spaces-start-btn"
                    onClick={() => setShowCreateForm(true)}
                >
                    Start Now
                </button>
            </div>

            {/* Create Space Modal */}
            {showCreateForm && (
                <div className="spaces-modal-overlay" onClick={() => setShowCreateForm(false)}>
                    <div className="spaces-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="spaces-modal-header">
                            <h3>Create a Space</h3>
                            <button className="spaces-modal-close" onClick={() => setShowCreateForm(false)}>✕</button>
                        </div>
                        <div className="spaces-modal-body">
                            <div className="spaces-form-field">
                                <label>Space Name *</label>
                                <input
                                    type="text"
                                    value={spaceName}
                                    onChange={(e) => setSpaceName(e.target.value)}
                                    placeholder="What's this Space about?"
                                    maxLength={80}
                                    autoFocus
                                />
                            </div>
                            <div className="spaces-form-field">
                                <label>Description</label>
                                <textarea
                                    value={spaceDesc}
                                    onChange={(e) => setSpaceDesc(e.target.value)}
                                    placeholder="Optional description for your Space"
                                    maxLength={200}
                                    rows={3}
                                />
                            </div>
                            <div className="spaces-modal-info">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" opacity="0.5">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                                </svg>
                                <span>Your microphone will be activated when you start the Space.</span>
                            </div>
                        </div>
                        <div className="spaces-modal-footer">
                            <button className="spaces-go-live-btn" onClick={handleCreateSpace} disabled={!spaceName.trim()}>
                                🎙️ Go Live
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'discover' && (
                <div className="spaces-section">
                    <h3 className="spaces-section-title">🔴 Happening Now</h3>
                    {liveSpaces.length === 0 ? (
                        <div className="spaces-empty">
                            <div className="spaces-empty-icon">
                                <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" opacity="0.3">
                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                </svg>
                            </div>
                            <h4>No active Spaces right now</h4>
                            <p>When people you follow host or join a Space, it will appear here. Be the first to start one!</p>
                        </div>
                    ) : (
                        <div className="spaces-live-grid">
                            {liveSpaces.map(space => (
                                <div key={space.id} className="space-card-live">
                                    <div className="space-card-live-header">
                                        <span className="space-card-live-badge">🔴 LIVE</span>
                                        <span className="space-card-listeners">{space.listenerCount} listening</span>
                                    </div>
                                    <h4 className="space-card-title">{space.title}</h4>
                                    {space.description && <p className="space-card-desc">{space.description}</p>}
                                    <div className="space-card-host">
                                        <Avatar src={space.hostAvatar} alt={space.hostName} size="tiny" />
                                        <span>{space.hostName}</span>
                                    </div>
                                    <button className="space-join-btn" onClick={() => handleJoinSpace(space)}>
                                        Join Space
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'upcoming' && (
                <div className="spaces-section">
                    <h3 className="spaces-section-title">📅 Scheduled Spaces</h3>
                    <div className="spaces-empty">
                        <h4>No upcoming Spaces</h4>
                        <p>Schedule a Space to let your followers know when you'll be live.</p>
                    </div>
                </div>
            )}

            {activeTab === 'my' && (
                <div className="spaces-section">
                    <h3 className="spaces-section-title">🎙️ Your Spaces</h3>
                    {mySpaces.length === 0 ? (
                        <div className="spaces-empty">
                            <h4>You haven't hosted any Spaces yet</h4>
                            <p>Start your first audio conversation and build your community.</p>
                        </div>
                    ) : (
                        <div className="spaces-live-grid">
                            {mySpaces.map(space => (
                                <div key={space.id} className="space-card-live">
                                    <div className="space-card-live-header">
                                        <span className={`space-card-live-badge ${space.isLive ? '' : 'ended'}`}>
                                            {space.isLive ? '🔴 LIVE' : '⏹️ Ended'}
                                        </span>
                                    </div>
                                    <h4 className="space-card-title">{space.title}</h4>
                                    <div className="space-card-host">
                                        <span>Hosted by you</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Spaces;
