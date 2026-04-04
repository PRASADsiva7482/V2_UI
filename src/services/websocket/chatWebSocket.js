import { Client } from '@stomp/stompjs';

/**
 * WebSocket service for real-time chat.
 *
 * ✅ Single WebSocket connection per logged-in user
 * ✅ Auto-reconnect with exponential backoff
 * ✅ No timers, no polling
 * ✅ UI updates only via WebSocket events
 * ✅ Uses native WebSocket (no SockJS dependency)
 *
 * Topics subscribed:
 *   /topic/messages/{userId}      → incoming messages
 *   /topic/presence               → online/offline events (global)
 *   /topic/read-receipt/{userId}  → read receipt updates
 *   /topic/typing/{conversationId}→ typing indicators (per conversation)
 */
class ChatWebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscriptions = {};
        this.listeners = {
            message: [],
            presence: [],
            readReceipt: [],
            typing: {},
            call: [],
            connectionChange: [],
        };
        this.userId = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
    }

    /**
     * Connect to WebSocket with JWT token.
     * Called once after login.
     */
    connect(userId, getToken) {
        if (this.connected && this.client) {
            console.log('WebSocket already connected');
            return;
        }

        this.userId = userId;
        this.getToken = getToken;

        // Build WebSocket URL from the current page origin
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const apiHost = window.config?.api?.baseUrl
            ? new URL(window.config.api.baseUrl).host
            : 'localhost:2000';
        const contextPath = window.config?.api?.baseUrl
            ? new URL(window.config.api.baseUrl).pathname
            : '/v-app';
        const wsUrl = `${protocol}//${apiHost}${contextPath}/ws`;

        console.log('[WS] Connecting to:', wsUrl);

        this.client = new Client({
            brokerURL: wsUrl,
            connectHeaders: {
                Authorization: `Bearer ${getToken()}`,
            },
            debug: (str) => {
                if (import.meta.env.DEV) {
                    console.log('[WS]', str);
                }
            },
            reconnectDelay: 0, // We handle reconnect ourselves
            onConnect: () => {
                console.log('[WS] Connected successfully');
                this.connected = true;
                this.reconnectAttempts = 0;
                this._subscribeToTopics();
                this._notifyConnectionChange(true);
            },
            onDisconnect: () => {
                console.log('[WS] Disconnected');
                this.connected = false;
                this._notifyConnectionChange(false);
            },
            onStompError: (frame) => {
                console.error('[WS] STOMP error:', frame.headers?.message);
                this.connected = false;
                this._notifyConnectionChange(false);
                this._scheduleReconnect();
            },
            onWebSocketClose: () => {
                console.log('[WS] WebSocket closed');
                this.connected = false;
                this._notifyConnectionChange(false);
                this._scheduleReconnect();
            },
        });

        this.client.activate();
    }

    /**
     * Disconnect WebSocket.
     */
    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }
        this.connected = false;
        this.subscriptions = {};
        this.userId = null;
        this._notifyConnectionChange(false);
    }

    /**
     * Send a chat message via WebSocket.
     */
    sendMessage(request) {
        if (!this.connected || !this.client) {
            console.error('[WS] Cannot send message: not connected');
            return false;
        }

        this.client.publish({
            destination: '/app/chat.send',
            body: JSON.stringify(request),
        });
        return true;
    }

    /**
     * Send read receipt via WebSocket.
     */
    markAsRead(conversationId) {
        if (!this.connected || !this.client) return;

        this.client.publish({
            destination: '/app/chat.read',
            body: JSON.stringify({ conversationId }),
        });
    }

    /**
     * Send typing indicator via WebSocket.
     */
    sendTyping(conversationId, typing) {
        if (!this.connected || !this.client) return;

        this.client.publish({
            destination: '/app/chat.typing',
            body: JSON.stringify({ conversationId, typing }),
        });
    }

    /**
     * Send WebRTC signaling event via WebSocket.
     */
    sendCallSignal(event) {
        if (!this.connected || !this.client) {
            console.error('[WS] Cannot send call signal: not connected');
            return false;
        }

        this.client.publish({
            destination: '/app/call.signal',
            body: JSON.stringify(event),
        });
        return true;
    }

    // ─── Event Listeners ───

    onMessage(callback) {
        this.listeners.message.push(callback);
        return () => {
            this.listeners.message = this.listeners.message.filter(cb => cb !== callback);
        };
    }

    onPresence(callback) {
        this.listeners.presence.push(callback);
        return () => {
            this.listeners.presence = this.listeners.presence.filter(cb => cb !== callback);
        };
    }

    onCallSignal(callback) {
        this.listeners.call.push(callback);
        return () => {
            this.listeners.call = this.listeners.call.filter(cb => cb !== callback);
        };
    }

    onReadReceipt(callback) {
        this.listeners.readReceipt.push(callback);
        return () => {
            this.listeners.readReceipt = this.listeners.readReceipt.filter(cb => cb !== callback);
        };
    }

    onTyping(conversationId, callback) {
        if (!this.listeners.typing[conversationId]) {
            this.listeners.typing[conversationId] = [];
        }
        this.listeners.typing[conversationId].push(callback);
        return () => {
            this.listeners.typing[conversationId] = this.listeners.typing[conversationId]
                .filter(cb => cb !== callback);
        };
    }

    onConnectionChange(callback) {
        this.listeners.connectionChange.push(callback);
        return () => {
            this.listeners.connectionChange = this.listeners.connectionChange
                .filter(cb => cb !== callback);
        };
    }

    // Subscribe to typing for a specific conversation
    subscribeToTyping(conversationId) {
        if (!this.connected || !this.client) return;

        const dest = `/topic/typing/${conversationId}`;
        if (this.subscriptions[dest]) return; // Already subscribed

        this.subscriptions[dest] = this.client.subscribe(dest, (frame) => {
            const event = JSON.parse(frame.body);
            const callbacks = this.listeners.typing[conversationId] || [];
            callbacks.forEach(cb => cb(event));
        });
    }

    // Unsubscribe from typing for a specific conversation
    unsubscribeFromTyping(conversationId) {
        const dest = `/topic/typing/${conversationId}`;
        if (this.subscriptions[dest]) {
            this.subscriptions[dest].unsubscribe();
            delete this.subscriptions[dest];
        }
    }

    // ─── Private ───

    _subscribeToTopics() {
        // Subscribe to personal messages
        this.subscriptions.messages = this.client.subscribe(
            `/topic/messages/${this.userId}`,
            (frame) => {
                const message = JSON.parse(frame.body);
                this.listeners.message.forEach(cb => cb(message));
            }
        );

        // Subscribe to presence (global topic)
        this.subscriptions.presence = this.client.subscribe(
            '/topic/presence',
            (frame) => {
                const event = JSON.parse(frame.body);
                this.listeners.presence.forEach(cb => cb(event));
            }
        );

        // Subscribe to personal read receipts
        this.subscriptions.readReceipt = this.client.subscribe(
            `/topic/read-receipt/${this.userId}`,
            (frame) => {
                const event = JSON.parse(frame.body);
                this.listeners.readReceipt.forEach(cb => cb(event));
            }
        );

        // Subscribe to personal call signals
        this.subscriptions.calls = this.client.subscribe(
            `/topic/calls/${this.userId}`,
            (frame) => {
                const event = JSON.parse(frame.body);
                this.listeners.call.forEach(cb => cb(event));
            }
        );
    }

    _notifyConnectionChange(connected) {
        this.listeners.connectionChange.forEach(cb => cb(connected));
    }

    /**
     * Exponential backoff reconnection.
     * No polling — only reconnects the WebSocket itself.
     */
    _scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[WS] Max reconnect attempts reached');
            return;
        }

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        this.reconnectAttempts++;

        console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            if (!this.connected && this.userId && this.getToken) {
                // Refresh the token before reconnecting
                this.client.connectHeaders = {
                    Authorization: `Bearer ${this.getToken()}`,
                };
                this.client.activate();
            }
        }, delay);
    }

    isConnected() {
        return this.connected;
    }
}

// Singleton instance
const chatWebSocketService = new ChatWebSocketService();
export default chatWebSocketService;
