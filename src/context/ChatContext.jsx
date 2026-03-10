import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../auth/AuthProvider';
import chatWebSocketService from '../services/websocket/chatWebSocket';
import {
    getConversations,
    getMessages,
    startConversation as startConversationApi,
    uploadChatMedia,
    sendMessageWithMedia,
} from '../services/api/chat';

const ChatContext = createContext(null);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const { user, getToken, keycloak } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState({});
    const [wsConnected, setWsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [typingUsers, setTypingUsers] = useState({});
    const [unreadCounts, setUnreadCounts] = useState({});
    const [loading, setLoading] = useState(false);
    const initialized = useRef(false);
    const currentUserId = user?.username || keycloak?.tokenParsed?.preferred_username;

    // Initialize WebSocket connection
    useEffect(() => {
        if (!currentUserId || initialized.current) return;
        initialized.current = true;

        // Connect WebSocket
        chatWebSocketService.connect(currentUserId, getToken);

        // Listen for connection changes
        const unsubConnection = chatWebSocketService.onConnectionChange((connected) => {
            setWsConnected(connected);
        });

        // Listen for incoming messages
        const unsubMessage = chatWebSocketService.onMessage((message) => {
            handleIncomingMessage(message);
        });

        // Listen for presence events
        const unsubPresence = chatWebSocketService.onPresence((event) => {
            setOnlineUsers(prev => ({
                ...prev,
                [event.userId]: {
                    online: event.online,
                    lastSeenAt: event.lastSeenAt,
                },
            }));

            // Update conversation list
            setConversations(prev => prev.map(conv => {
                if (conv.otherUserId === event.userId) {
                    return { ...conv, otherUserOnline: event.online };
                }
                return conv;
            }));
        });

        // Listen for read receipts
        const unsubReadReceipt = chatWebSocketService.onReadReceipt((event) => {
            handleReadReceipt(event);
        });

        // Load initial conversations
        loadConversations();

        return () => {
            unsubConnection();
            unsubMessage();
            unsubPresence();
            unsubReadReceipt();
            chatWebSocketService.disconnect();
            initialized.current = false;
        };
    }, [currentUserId]);

    const loadConversations = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getConversations();
            setConversations(data || []);

            // Build unread counts map
            const counts = {};
            (data || []).forEach(conv => {
                if (conv.unreadCount > 0) {
                    counts[conv.id] = conv.unreadCount;
                }
            });
            setUnreadCounts(counts);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMessages = useCallback(async (conversationId, page = 0) => {
        try {
            const data = await getMessages(conversationId, page, 30);
            const messageList = data?.content || [];

            setMessages(prev => {
                const existing = page > 0 ? (prev[conversationId] || []) : [];
                // Reverse to chronological order (newest-first from API)
                const reversed = [...messageList].reverse();

                if (page === 0) {
                    return { ...prev, [conversationId]: reversed };
                }

                // Append but filter duplicates
                const existingIds = new Set(existing.map(m => m.id).filter(Boolean));
                const newMessages = reversed.filter(m => !existingIds.has(m.id));

                return {
                    ...prev,
                    [conversationId]: [...newMessages, ...existing],
                };
            });

            return data;
        } catch (error) {
            console.error('Error loading messages:', error);
            return null;
        }
    }, []);

    const handleIncomingMessage = useCallback((message) => {
        // Add to messages if we have the conversation open
        setMessages(prev => {
            const convMessages = prev[message.conversationId] || [];
            // Check for duplicate (by id or tempId)
            const isDupe = convMessages.some(m =>
                (m.id && m.id === message.id) ||
                (m.tempId && message.tempId && m.tempId === message.tempId)
            );
            if (isDupe) {
                // Update existing (e.g., replace optimistic message with server-confirmed)
                return {
                    ...prev,
                    [message.conversationId]: convMessages.map(m =>
                        ((m.tempId && message.tempId && m.tempId === message.tempId) ||
                            (m.id && message.id && m.id === message.id))
                            ? message : m
                    ),
                };
            }
            return {
                ...prev,
                [message.conversationId]: [...convMessages, message],
            };
        });

        // Update conversation list (move to top, update last message)
        setConversations(prev => {
            const updated = prev.map(conv => {
                if (conv.id === message.conversationId) {
                    return {
                        ...conv,
                        lastMessageContent: message.content,
                        lastMessageSenderId: message.senderId,
                        lastMessageType: message.type,
                        lastMessageTime: message.createdAt,
                    };
                }
                return conv;
            });
            // Sort by lastMessageTime (most recent first)
            updated.sort((a, b) => {
                const timeA = a.lastMessageTime || a.updatedAt || '';
                const timeB = b.lastMessageTime || b.updatedAt || '';
                return timeB > timeA ? 1 : -1;
            });
            return updated;
        });

        // Update unread count if message is from someone else and not in active conv
        if (message.senderId !== currentUserId) {
            setUnreadCounts(prev => ({
                ...prev,
                [message.conversationId]: (prev[message.conversationId] || 0) + 1,
            }));
        }
    }, [currentUserId]);

    const handleReadReceipt = useCallback((event) => {
        // Update message statuses in the conversation
        setMessages(prev => {
            const convMessages = prev[event.conversationId];
            if (!convMessages) return prev;

            return {
                ...prev,
                [event.conversationId]: convMessages.map(msg => {
                    if (msg.senderId === currentUserId && msg.status !== 'READ') {
                        return { ...msg, status: event.newStatus };
                    }
                    return msg;
                }),
            };
        });
    }, [currentUserId]);

    /**
     * Send a text-only message via WebSocket (fast path).
     */
    const sendMessage = useCallback((conversationId, content, mentionedUserIds = [], type = 'TEXT', replyToId = null) => {
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Optimistic UI update
        const optimisticMessage = {
            tempId,
            conversationId,
            senderId: currentUserId,
            senderName: user?.username || currentUserId,
            content,
            type,
            replyToId,
            status: 'SENDING',
            createdAt: new Date().toISOString(),
            isEdited: false,
            isDeleted: false,
            attachments: [],
        };

        setMessages(prev => ({
            ...prev,
            [conversationId]: [...(prev[conversationId] || []), optimisticMessage],
        }));

        // Send via WebSocket
        chatWebSocketService.sendMessage({
            conversationId,
            content,
            type,
            replyToId,
            tempId,
            mentionedUserIds,
        });
    }, [currentUserId, user]);

    /**
     * Send a message WITH media attachments.
     * 1. Upload each file via REST → get fileUrl metadata
     * 2. Send message via REST with attachment info
     * 3. WebSocket will broadcast the saved message to recipients
     */
    const sendMediaMessage = useCallback(async (conversationId, content, files, mentionedUserIds = [], replyToId = null) => {
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Determine message type from files
        const firstFile = files[0];
        let msgType = 'FILE';
        if (firstFile.type.startsWith('image/')) msgType = 'IMAGE';
        else if (firstFile.type.startsWith('video/')) msgType = 'VIDEO';
        else if (firstFile.type.startsWith('audio/')) msgType = 'AUDIO';

        // Optimistic UI update with file previews
        const previewAttachments = files.map((file, idx) => ({
            id: `preview_${idx}`,
            fileUrl: URL.createObjectURL(file),
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            isUploading: true,
        }));

        const optimisticMessage = {
            tempId,
            conversationId,
            senderId: currentUserId,
            senderName: user?.username || currentUserId,
            content: content || '',
            type: msgType,
            replyToId,
            status: 'SENDING',
            createdAt: new Date().toISOString(),
            isEdited: false,
            isDeleted: false,
            attachments: previewAttachments,
        };

        setMessages(prev => ({
            ...prev,
            [conversationId]: [...(prev[conversationId] || []), optimisticMessage],
        }));

        try {
            // Upload all files
            const uploadedAttachments = [];
            for (const file of files) {
                const result = await uploadChatMedia(file);
                uploadedAttachments.push({
                    fileUrl: result.fileUrl,
                    fileName: result.fileName,
                    fileType: result.fileType,
                    fileSize: result.fileSize,
                    thumbnailUrl: result.thumbnailUrl,
                });
            }

            // Send the message with attachments via REST
            const request = {
                conversationId,
                content: content || '',
                type: msgType,
                replyToId,
                tempId,
                attachments: uploadedAttachments,
                mentionedUserIds,
            };

            await sendMessageWithMedia(request);
            // The WebSocket broadcast will update the message with the real server data
        } catch (error) {
            console.error('Error sending media message:', error);
            // Mark the optimistic message as failed
            setMessages(prev => {
                const convMsgs = prev[conversationId] || [];
                return {
                    ...prev,
                    [conversationId]: convMsgs.map(m =>
                        m.tempId === tempId ? { ...m, status: 'FAILED' } : m
                    ),
                };
            });
        }
    }, [currentUserId, user]);

    const markConversationAsRead = useCallback((conversationId) => {
        chatWebSocketService.markAsRead(conversationId);
        setUnreadCounts(prev => {
            const updated = { ...prev };
            delete updated[conversationId];
            return updated;
        });
    }, []);

    const sendTypingIndicator = useCallback((conversationId, typing) => {
        chatWebSocketService.sendTyping(conversationId, typing);
    }, []);

    const startConversation = useCallback(async (recipientUserId) => {
        try {
            const conversation = await startConversationApi(recipientUserId);
            // Add to list if not already there
            setConversations(prev => {
                if (prev.some(c => c.id === conversation.id)) {
                    return prev;
                }
                return [conversation, ...prev];
            });
            return conversation;
        } catch (error) {
            console.error('Error starting conversation:', error);
            throw error;
        }
    }, []);

    const getTotalUnread = useCallback(() => {
        return Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
    }, [unreadCounts]);

    const value = {
        conversations,
        activeConversation,
        setActiveConversation,
        messages,
        wsConnected,
        onlineUsers,
        typingUsers,
        unreadCounts,
        loading,
        currentUserId,
        loadConversations,
        loadMessages,
        sendMessage,
        sendMediaMessage,
        markConversationAsRead,
        sendTypingIndicator,
        startConversation,
        getTotalUnread,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
