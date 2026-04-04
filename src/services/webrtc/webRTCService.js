/**
 * WebRTC Audio Service for Spaces (Audio Rooms)
 * 
 * Manages peer connections, audio streams, and room lifecycle.
 * Uses a simple mesh topology for small rooms (≤10 participants).
 * For larger rooms, a SFU (Selective Forwarding Unit) would be needed.
 */

class WebRTCService {
    constructor() {
        this.localStream = null;
        this.peerConnections = new Map(); // userId -> RTCPeerConnection
        this.onRemoteStream = null;
        this.onLocalStream = null;
        this.onPeerDisconnected = null;
        this.onIceCandidate = null;
        this.isMuted = false;
        this.isVideoOff = false;

        // ICE servers (use public STUN + optional TURN)
        this.iceServers = [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
        ];
    }

    /**
     * Initialize local audio/video stream
     */
    async initLocalStream(video = false) {
        try {
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => track.stop());
            }

            this.localStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: video ? {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                } : false
            });

            if (this.onLocalStream) {
                this.onLocalStream(this.localStream);
            }

            return this.localStream;
        } catch (error) {
            console.error('Failed to get local stream:', error);
            throw error;
        }
    }

    /**
     * Create a peer connection for a specific user
     */
    createPeerConnection(userId) {
        if (this.peerConnections.has(userId)) {
            this.peerConnections.get(userId).close();
        }

        const pc = new RTCPeerConnection({
            iceServers: this.iceServers,
            iceCandidatePoolSize: 10
        });

        // Add local audio tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                pc.addTrack(track, this.localStream);
            });
        }

        // Handle remote stream
        pc.ontrack = (event) => {
            if (this.onRemoteStream) {
                this.onRemoteStream(userId, event.streams[0]);
            }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && this.onIceCandidate) {
                this.onIceCandidate(userId, event.candidate);
            }
        };

        // Handle connection state
        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                if (this.onPeerDisconnected) {
                    this.onPeerDisconnected(userId);
                }
                this.removePeer(userId);
            }
        };

        this.peerConnections.set(userId, pc);
        return pc;
    }

    /**
     * Create an offer (for the initiator)
     */
    async createOffer(userId) {
        const pc = this.createPeerConnection(userId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        return offer;
    }

    /**
     * Handle a received offer (for the receiver)
     */
    async handleOffer(userId, offer) {
        const pc = this.createPeerConnection(userId);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        return answer;
    }

    /**
     * Handle a received answer
     */
    async handleAnswer(userId, answer) {
        const pc = this.peerConnections.get(userId);
        if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }

    /**
     * Handle a received ICE candidate
     */
    async addIceCandidate(userId, candidate) {
        const pc = this.peerConnections.get(userId);
        if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
    }

    /**
     * Toggle mute/unmute
     */
    toggleMute() {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            this.isMuted = !this.isMuted;
        }
        return this.isMuted;
    }

    /**
     * Toggle video on/off
     */
    toggleVideo() {
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            this.isVideoOff = !this.isVideoOff;
        }
        return this.isVideoOff;
    }

    /**
     * Remove a peer connection
     */
    removePeer(userId) {
        const pc = this.peerConnections.get(userId);
        if (pc) {
            pc.close();
            this.peerConnections.delete(userId);
        }
    }

    /**
     * Disconnect all peers and cleanup
     */
    disconnect() {
        this.peerConnections.forEach((pc) => pc.close());
        this.peerConnections.clear();

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        this.isMuted = false;
    }

    /**
     * Get connection stats for debugging
     */
    async getStats() {
        const stats = {};
        for (const [userId, pc] of this.peerConnections) {
            const report = await pc.getStats();
            const info = { state: pc.connectionState, iceState: pc.iceConnectionState };
            report.forEach(stat => {
                if (stat.type === 'inbound-rtp' && stat.kind === 'audio') {
                    info.bytesReceived = stat.bytesReceived;
                    info.packetsReceived = stat.packetsReceived;
                    info.packetsLost = stat.packetsLost;
                }
            });
            stats[userId] = info;
        }
        return stats;
    }
}

// Singleton
const webRTCService = new WebRTCService();
export default webRTCService;
