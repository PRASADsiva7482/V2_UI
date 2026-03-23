import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useChat } from '../../context/ChatContext';
import chatWebSocketService from '../../services/websocket/chatWebSocket';
import { searchUsers } from '../../services/api/profile';
import { pauseAllMedia } from '../../hooks/useMediaAutoStop';
import Avatar from '../common/Avatar';
import EmojiPicker from './EmojiPicker';
import MentionInput from '../common/MentionInput';
import { parseContentSegments } from '../../services/utils/mentionUtils';
import { useToast } from '../common/Toast';
import './Chat.css';

/**
 * Resolve backend-relative media URLs to full absolute URLs.
 * The backend stores fileUrl as /v-app/api/v1/media/images/file.png
 * but the frontend runs on port 3000, so <img src> would hit the Vite
 * dev server instead of the backend on port 2000.
 * This mirrors the getMediaUrl() helper used in PostCard.
 */
const getMediaUrl = (fileUrl) => {
    if (!fileUrl) return '';
    // Already absolute (e.g. blob: for optimistic previews, or http/https)
    if (fileUrl.startsWith('http') || fileUrl.startsWith('blob:')) return fileUrl;
    const cleanPath = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
    const baseUrl = window.config?.api?.mediaBaseUrl || 'http://localhost:2000';
    return `${baseUrl}/${cleanPath}`;
};

/* ════════════════════════════════════════════════════════════════
   MAIN CHAT COMPONENT
   WhatsApp-like layout: ChatList (left) + ChatRoom (right)
   ════════════════════════════════════════════════════════════════ */
function Chat() {
    const {
        conversations, activeConversation, setActiveConversation,
        messages, loading, wsConnected, onlineUsers, unreadCounts,
        loadMessages, sendMessage, sendMediaMessage, markConversationAsRead,
        sendTypingIndicator, startConversation, currentUserId,
    } = useChat();

    const [showNewChat, setShowNewChat] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const { showToast } = useToast();

    const handleSelectConversation = useCallback((conv) => {
        pauseAllMedia();
        setActiveConversation(conv);
        loadMessages(conv.id);
        markConversationAsRead(conv.id);
    }, [setActiveConversation, loadMessages, markConversationAsRead]);

    const handleBack = useCallback(() => {
        pauseAllMedia();
        setActiveConversation(null);
    }, [setActiveConversation]);

    return (
        <div className="chat-container" id="chat-page">
            {/* Connection indicator */}
            {!wsConnected && (
                <div className="ws-reconnecting">
                    <div className="ws-reconnecting-dot" />
                    Reconnecting...
                </div>
            )}

            <div className={`chat-sidebar ${activeConversation ? 'chat-sidebar-hidden' : ''}`}>
                <ChatListHeader
                    onNewChat={() => { setShowNewChat(true); setShowCreateGroup(false); }}
                    onNewGroup={() => { setShowCreateGroup(true); setShowNewChat(false); }}
                    wsConnected={wsConnected}
                />
                {showCreateGroup ? (
                    <GroupChatCreator
                        onCreateGroup={async (groupName, memberIds) => {
                            try {
                                const apiCaller = (await import('../../services/api/apiCaller')).default;
                                const resp = await apiCaller.post('/api/v1/chat/conversations/group', {
                                    type: 'GROUP',
                                    groupName,
                                    participantIds: memberIds
                                });
                                setShowCreateGroup(false);
                                showToast('Group chat created! 🎉', 'success');
                                handleSelectConversation(resp);
                            } catch (err) {
                                showToast('Failed to create group', 'error');
                            }
                        }}
                        onClose={() => setShowCreateGroup(false)}
                    />
                ) : showNewChat ? (
                    <NewChatSearch
                        onStartConversation={async (userId) => {
                            const conv = await startConversation(userId);
                            setShowNewChat(false);
                            handleSelectConversation(conv);
                        }}
                        onClose={() => setShowNewChat(false)}
                    />
                ) : (
                    <ChatList
                        conversations={conversations}
                        activeId={activeConversation?.id}
                        onSelect={handleSelectConversation}
                        unreadCounts={unreadCounts}
                        currentUserId={currentUserId}
                    />
                )}
            </div>

            <div className={`chat-main ${activeConversation ? 'chat-main-active' : ''}`}>
                {activeConversation ? (
                    <ChatRoom
                        conversation={activeConversation}
                        messages={messages[activeConversation.id] || []}
                        currentUserId={currentUserId}
                        onSendMessage={(content, mentionedUserIds) => sendMessage(activeConversation.id, content, mentionedUserIds)}
                        onSendMediaMessage={(content, files, mentionedUserIds) => sendMediaMessage(activeConversation.id, content, files, mentionedUserIds)}
                        onMarkRead={() => markConversationAsRead(activeConversation.id)}
                        onSendTyping={(typing) => sendTypingIndicator(activeConversation.id, typing)}
                        onBack={handleBack}
                        onLoadMore={() => {
                            const convMsgs = messages[activeConversation.id] || [];
                            const page = Math.floor(convMsgs.length / 30);
                            loadMessages(activeConversation.id, page);
                        }}
                    />
                ) : (
                    <ChatEmptyState />
                )}
            </div>
        </div>
    );
}

/* ──────────────────────────
   CHAT LIST HEADER
   ────────────────────────── */
function ChatListHeader({ onNewChat, onNewGroup, wsConnected }) {
    return (
        <div className="chat-list-header">
            <h2 className="chat-list-title">
                Messages
                {wsConnected && <span className="online-dot" title="Connected" />}
            </h2>
            <div style={{ display: 'flex', gap: '6px' }}>
                <button className="new-chat-btn" onClick={onNewGroup} title="Create group chat" style={{ opacity: 0.7 }}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                    </svg>
                </button>
                <button className="new-chat-btn" onClick={onNewChat} title="New conversation">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                        <path d="M11 5h2v4h4v2h-4v4h-2v-4H7V9h4z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

/* ──────────────────────────
   NEW CHAT SEARCH
   ────────────────────────── */
function NewChatSearch({ onStartConversation, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const debounceRef = useRef(null);

    const handleSearch = useCallback((value) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (value.trim().length < 2) {
            setResults([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const data = await searchUsers(value, { page: 0, size: 10 });
                setResults(data?.content || []);
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setSearching(false);
            }
        }, 300);
    }, []);

    return (
        <div className="new-chat-search">
            <div className="new-chat-search-header">
                <button className="back-btn" onClick={onClose}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </button>
                <input
                    type="text"
                    placeholder="Search people..."
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    autoFocus
                    className="new-chat-input"
                />
            </div>
            <div className="new-chat-results">
                {searching && <div className="search-loading">Searching...</div>}
                {results.map(user => (
                    <button
                        key={user.userId}
                        className="search-result-item"
                        onClick={() => onStartConversation(user.username || user.userId)}
                    >
                        <Avatar
                            src={user.profilePictureUrl}
                            alt={user.displayName || user.username}
                            size="small"
                        />
                        <div className="search-result-info">
                            <span className="search-result-name">{user.displayName || user.username}</span>
                            <span className="search-result-username">@{user.username}</span>
                        </div>
                    </button>
                ))}
                {!searching && query.length >= 2 && results.length === 0 && (
                    <div className="search-no-results">No users found</div>
                )}
            </div>
        </div>
    );
}

/* ──────────────────────────
   GROUP CHAT CREATOR
   ────────────────────────── */
function GroupChatCreator({ onCreateGroup, onClose }) {
    const [groupName, setGroupName] = useState('');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searching, setSearching] = useState(false);
    const debounceRef = useRef(null);

    const handleSearch = useCallback((value) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (value.trim().length < 2) { setResults([]); return; }

        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const data = await searchUsers(value, { page: 0, size: 10 });
                setResults(data?.content || []);
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setSearching(false);
            }
        }, 300);
    }, []);

    const toggleMember = (user) => {
        setSelectedMembers(prev => {
            const exists = prev.find(m => m.userId === user.userId);
            if (exists) return prev.filter(m => m.userId !== user.userId);
            return [...prev, user];
        });
    };

    return (
        <div className="new-chat-search">
            <div className="new-chat-search-header">
                <button className="back-btn" onClick={onClose}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </button>
                <span style={{ fontSize: '16px', fontWeight: '700' }}>Create Group</span>
            </div>
            <div style={{ padding: '12px' }}>
                <input
                    type="text"
                    placeholder="Group name..."
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="new-chat-input"
                    style={{ marginBottom: '10px', width: '100%', boxSizing: 'border-box' }}
                />
                {selectedMembers.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {selectedMembers.map(m => (
                            <span key={m.userId} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                padding: '4px 10px', borderRadius: '16px',
                                background: 'rgba(29,155,240,0.15)', color: '#1d9bf0',
                                fontSize: '13px', fontWeight: '600'
                            }}>
                                @{m.username}
                                <button onClick={() => toggleMember(m)} style={{
                                    background: 'none', border: 'none', color: '#1d9bf0',
                                    cursor: 'pointer', padding: '0 2px', fontSize: '14px'
                                }}>×</button>
                            </span>
                        ))}
                    </div>
                )}
                <input
                    type="text"
                    placeholder="Search people to add..."
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="new-chat-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                />
            </div>
            <div className="new-chat-results">
                {searching && <div className="search-loading">Searching...</div>}
                {results.map(user => (
                    <button
                        key={user.userId}
                        className={`search-result-item ${selectedMembers.find(m => m.userId === user.userId) ? 'selected' : ''}`}
                        onClick={() => toggleMember(user)}
                    >
                        <Avatar src={user.profilePictureUrl} alt={user.displayName || user.username} size="small" />
                        <div className="search-result-info">
                            <span className="search-result-name">{user.displayName || user.username}</span>
                            <span className="search-result-username">@{user.username}</span>
                        </div>
                        {selectedMembers.find(m => m.userId === user.userId) && (
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="#1d9bf0" style={{ marginLeft: 'auto' }}>
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                        )}
                    </button>
                ))}
            </div>
            {selectedMembers.length >= 1 && (
                <div style={{ padding: '12px', borderTop: '1px solid var(--border-color, #2f3336)' }}>
                    <button
                        onClick={() => onCreateGroup(groupName || 'Group Chat', selectedMembers.map(m => m.username || m.userId))}
                        style={{
                            width: '100%', padding: '10px', border: 'none', borderRadius: '20px',
                            background: '#1d9bf0', color: '#fff', fontWeight: '700', fontSize: '14px',
                            cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        Create Group ({selectedMembers.length} members)
                    </button>
                </div>
            )}
        </div>
    );
}

/* ──────────────────────────
   CHAT LIST
   ────────────────────────── */
function ChatList({ conversations, activeId, onSelect, unreadCounts, currentUserId }) {
    if (conversations.length === 0) {
        return (
            <div className="chat-list-empty">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" opacity="0.3">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                </svg>
                <p>No conversations yet</p>
                <p className="chat-list-empty-hint">Start a new chat to begin messaging</p>
            </div>
        );
    }

    return (
        <div className="chat-list">
            {conversations.map(conv => (
                <ChatListItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeId}
                    onSelect={() => onSelect(conv)}
                    unreadCount={unreadCounts[conv.id] || 0}
                    currentUserId={currentUserId}
                />
            ))}
        </div>
    );
}

/* ──────────────────────────
   CHAT LIST ITEM
   ────────────────────────── */
function ChatListItem({ conversation, isActive, onSelect, unreadCount, currentUserId }) {
    const displayName = conversation.type === 'DIRECT'
        ? (conversation.otherUserDisplayName || conversation.otherUserName || 'Unknown')
        : (conversation.groupName || 'Group Chat');
    const avatar = conversation.type === 'DIRECT'
        ? conversation.otherUserAvatar
        : conversation.groupAvatarUrl;
    const isOnline = conversation.otherUserOnline;

    const lastMessage = conversation.lastMessageContent;
    const lastMessagePrefix = conversation.lastMessageSenderId === currentUserId
        ? 'You: '
        : '';

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const date = new Date(timeStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <button
            className={`chat-list-item ${isActive ? 'active' : ''} ${unreadCount > 0 ? 'unread' : ''}`}
            onClick={onSelect}
        >
            <div className="chat-avatar-wrapper">
                <Avatar src={avatar} alt={displayName} size="medium" />
                {isOnline && <span className="online-indicator" />}
            </div>
            <div className="chat-item-info">
                <div className="chat-item-header">
                    <span className="chat-item-name">{displayName}</span>
                    <span className="chat-item-time">{formatTime(conversation.lastMessageTime)}</span>
                </div>
                <div className="chat-item-preview">
                    <span className="chat-item-message">
                        {lastMessagePrefix}
                        {conversation.lastMessageType === 'IMAGE' ? '📷 Photo' :
                            conversation.lastMessageType === 'VIDEO' ? '🎥 Video' :
                                conversation.lastMessageType === 'AUDIO' ? '🎵 Audio' :
                                    conversation.lastMessageType === 'FILE' ? '📄 File' :
                                        lastMessage || 'No messages yet'}
                    </span>
                    {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                </div>
            </div>
        </button>
    );
}

/* ════════════════════════════════════════════════════════════════
   CHAT ROOM — WhatsApp-style with Emoji + Media
   ════════════════════════════════════════════════════════════════ */
function ChatRoom({ conversation, messages, currentUserId, onSendMessage, onSendMediaMessage, onMarkRead, onSendTyping, onBack, onLoadMore }) {
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [remoteTyping, setRemoteTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const [lightboxMedia, setLightboxMedia] = useState(null);
    const [mentionedUserIds, setMentionedUserIds] = useState([]);

    // Voice Recorder state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimerRef = useRef(null);

    // Vanish Mode state
    const [vanishMode, setVanishMode] = useState(false);
    const [vanishTimer, setVanishTimer] = useState(30); // seconds
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);
    const inputRef = useRef(null);

    // Track scroll positions
    const prevMsgCountRef = useRef(0);
    const prevFirstMsgIdRef = useRef(null);
    const scrollHeightRef = useRef(0);
    const scrollTopRef = useRef(0);


    const displayName = conversation.type === 'DIRECT'
        ? (conversation.otherUserDisplayName || conversation.otherUserName || 'Unknown')
        : (conversation.groupName || 'Group Chat');
    const isOnline = conversation.otherUserOnline;

    // Auto-scroll logic: instant on open, smooth on new message, preserve on load more
    useLayoutEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        // Has conversation changed?
        const isNewConversation = container.dataset.convId !== conversation.id;
        if (isNewConversation) {
            container.dataset.convId = conversation.id;
            prevMsgCountRef.current = 0;
            prevFirstMsgIdRef.current = null;
            scrollHeightRef.current = 0;
            scrollTopRef.current = 0;
        }

        const currentMsgCount = messages.length;
        const prevMsgCount = prevMsgCountRef.current;
        const firstMsgId = messages[0]?.id || messages[0]?.tempId;
        const prevFirstMsgId = prevFirstMsgIdRef.current;

        // Is it the initial load of a conversation?
        if (currentMsgCount > 0 && prevMsgCount === 0) {
            // Jump to the bottom immediately
            container.scrollTop = container.scrollHeight;
        }
        // Prepended messages (pagination)
        else if (currentMsgCount > prevMsgCount && firstMsgId !== prevFirstMsgId && prevFirstMsgId) {
            // Preserve scroll position
            const diff = container.scrollHeight - scrollHeightRef.current;
            container.scrollTop = scrollTopRef.current + diff;
        }
        // Appended message (new message at the end)
        else if (currentMsgCount > prevMsgCount || messages[messages.length - 1]?.id !== prevFirstMsgId) {
            const isNearBottom = scrollHeightRef.current - scrollTopRef.current - container.clientHeight < 250;
            const lastMsg = messages[messages.length - 1];
            const isMyMessage = lastMsg?.senderId === currentUserId;

            if (isNearBottom || isMyMessage) {
                // Smooth scroll down for new messages
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        }

        prevMsgCountRef.current = currentMsgCount;
        prevFirstMsgIdRef.current = firstMsgId;
        scrollHeightRef.current = container.scrollHeight;
        scrollTopRef.current = container.scrollTop;
    }, [messages, currentUserId, conversation.id]);

    // Mark as read when conversation opens
    useEffect(() => {
        onMarkRead();
    }, [conversation.id]);

    // Subscribe to typing for this conversation
    useEffect(() => {
        chatWebSocketService.subscribeToTyping(conversation.id);
        const unsub = chatWebSocketService.onTyping(conversation.id, (event) => {
            if (event.userId !== currentUserId) {
                setRemoteTyping(event.typing);
                if (event.typing) {
                    setTimeout(() => setRemoteTyping(false), 3000);
                }
            }
        });

        return () => {
            chatWebSocketService.unsubscribeFromTyping(conversation.id);
            unsub();
        };
    }, [conversation.id, currentUserId]);

    // Clean up file previews on unmount or file change
    useEffect(() => {
        return () => {
            filePreviews.forEach(p => {
                if (p.url) URL.revokeObjectURL(p.url);
            });
        };
    }, [filePreviews]);

    // ─── Handlers ───

    const handleSend = () => {
        const content = inputValue.trim();

        if (selectedFiles.length > 0) {
            // Send media message
            onSendMediaMessage(content, selectedFiles, mentionedUserIds);
            setInputValue('');
            setMentionedUserIds([]);
            clearFiles();
            handleStopTyping();
            setShowEmojiPicker(false);
            return;
        }

        if (!content) return;
        onSendMessage(content, mentionedUserIds);
        setInputValue('');
        setMentionedUserIds([]);
        handleStopTyping();
        setShowEmojiPicker(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (value) => {
        setInputValue(value);

        if (!isTyping) {
            setIsTyping(true);
            onSendTyping(true);
        }

        // Reset typing timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(handleStopTyping, 2000);
    };

    const handleStopTyping = () => {
        if (isTyping) {
            setIsTyping(false);
            onSendTyping(false);
        }
    };

    const handleEmojiSelect = (emoji) => {
        const textarea = inputRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const before = inputValue.substring(0, start);
            const after = inputValue.substring(end);
            const newValue = before + emoji + after;
            setInputValue(newValue);
            // Set cursor position after emoji
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
                textarea.focus();
            }, 0);
        } else {
            setInputValue(prev => prev + emoji);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Max 4 files
        const allFiles = [...selectedFiles, ...files].slice(0, 4);
        setSelectedFiles(allFiles);

        // Generate previews
        const previews = allFiles.map(file => {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');
            return {
                name: file.name,
                type: file.type,
                size: file.size,
                isImage,
                isVideo,
                url: isImage || isVideo ? URL.createObjectURL(file) : null,
            };
        });
        setFilePreviews(previews);

        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);

        // Revoke old preview URL
        if (filePreviews[index]?.url) URL.revokeObjectURL(filePreviews[index].url);
        const newPreviews = filePreviews.filter((_, i) => i !== index);
        setFilePreviews(newPreviews);
    };

    const clearFiles = () => {
        filePreviews.forEach(p => { if (p.url) URL.revokeObjectURL(p.url); });
        setSelectedFiles([]);
        setFilePreviews([]);
    };

    // Keep track of scroll position for layout effects
    const handleScroll = (e) => {
        const container = e.target;
        scrollTopRef.current = container.scrollTop;
        scrollHeightRef.current = container.scrollHeight;

        // Scroll to load more
        if (container.scrollTop === 0 && messages.length > 0) {
            onLoadMore();
        }
    };



    // Group messages by date
    const groupedMessages = groupMessagesByDate(messages);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'SENDING':
                return <span className="msg-status sending">⏳</span>;
            case 'FAILED':
                return <span className="msg-status failed">⚠️</span>;
            case 'SENT':
                return <span className="msg-status sent">✓</span>;
            case 'DELIVERED':
                return <span className="msg-status delivered">✓✓</span>;
            case 'READ':
                return <span className="msg-status read">✓✓</span>;
            default:
                return null;
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="chat-room">
            {/* Header */}
            <div className="chat-room-header">
                <button className="back-btn mobile-only" onClick={onBack}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </button>
                <div className="chat-room-avatar">
                    <Avatar
                        src={conversation.type === 'DIRECT' ? conversation.otherUserAvatar : conversation.groupAvatarUrl}
                        alt={displayName}
                        size="small"
                    />
                    {isOnline && <span className="online-indicator small" />}
                </div>
                <div className="chat-room-info">
                    <span className="chat-room-name">{displayName}</span>
                    <span className="chat-room-status">
                        {remoteTyping ? 'typing...' : isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>
                {/* Vanish Mode Toggle */}
                <button
                    className={`vanish-mode-btn ${vanishMode ? 'active' : ''}`}
                    onClick={() => setVanishMode(prev => !prev)}
                    title={vanishMode ? `Vanish Mode ON (${vanishTimer}s)` : 'Enable Vanish Mode'}
                    type="button"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                    {vanishMode && <span className="vanish-mode-dot" />}
                </button>
            </div>

            {/* Messages */}
            <div
                className="chat-messages"
                ref={messagesContainerRef}
                onScroll={handleScroll}
            >
                {groupedMessages.map(({ date, msgs }) => (
                    <div key={date}>
                        <div className="date-separator">
                            <span>{date}</span>
                        </div>
                        {msgs.map((msg) => {
                            const isMine = msg.senderId === currentUserId;
                            return (
                                <div
                                    key={msg.id || msg.tempId}
                                    className={`message-row ${isMine ? 'mine' : 'theirs'}`}
                                >
                                    <div className={`message-bubble ${isMine ? 'mine' : 'theirs'} ${msg.isDeleted ? 'deleted' : ''}`}>
                                        {msg.isDeleted ? (
                                            <span className="deleted-text">🚫 This message was deleted</span>
                                        ) : (
                                            <>
                                                {/* Attachments */}
                                                {msg.attachments && msg.attachments.length > 0 && (
                                                    <div className={`message-attachments ${msg.attachments.length > 1 ? 'multi' : ''}`}>
                                                        {msg.attachments.map((att, attIdx) => (
                                                            <MessageAttachment
                                                                key={att.id || attIdx}
                                                                attachment={att}
                                                                onMediaClick={(media) => setLightboxMedia(media)}
                                                                onMediaLoad={() => {
                                                                    // Re-adjust scroll if we were already at the bottom
                                                                    const container = messagesContainerRef.current;
                                                                    if (container) {
                                                                        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 250;
                                                                        if (isNearBottom || isMine) {
                                                                            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
                                                                            scrollHeightRef.current = container.scrollHeight;
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                                {/* Text content */}
                                                {msg.content && (
                                                    <span className="message-text">
                                                        {parseContentSegments(msg.content).map((segment, idx) => {
                                                            if (segment.type === 'mention') {
                                                                return (
                                                                    <span key={idx} className="mention-text">
                                                                        {segment.content}
                                                                    </span>
                                                                );
                                                            }
                                                            if (segment.type === 'hashtag') {
                                                                return (
                                                                    <span key={idx} className="hashtag-text">
                                                                        {segment.content}
                                                                    </span>
                                                                );
                                                            }
                                                            return <span key={idx}>{segment.content}</span>;
                                                        })}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                        <div className="message-meta">
                                            <span className="message-time">
                                                {formatMessageTime(msg.createdAt)}
                                            </span>
                                            {msg.isEdited && <span className="edited-label">edited</span>}
                                            {isMine && getStatusIcon(msg.status)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* File Previews */}
            {filePreviews.length > 0 && (
                <div className="chat-file-preview-bar">
                    <div className="file-preview-list">
                        {filePreviews.map((preview, idx) => (
                            <div key={idx} className="file-preview-item">
                                {preview.isImage ? (
                                    <img src={preview.url} alt={preview.name} className="file-preview-thumb" />
                                ) : preview.isVideo ? (
                                    <div className="file-preview-video">
                                        <video src={preview.url} className="file-preview-thumb" />
                                        <div className="file-preview-play-icon">▶</div>
                                    </div>
                                ) : (
                                    <div className="file-preview-doc">
                                        <span className="file-doc-icon">📄</span>
                                        <span className="file-doc-name">{preview.name}</span>
                                    </div>
                                )}
                                <button
                                    className="file-preview-remove"
                                    onClick={() => removeFile(idx)}
                                    title="Remove"
                                >×</button>
                                <span className="file-preview-size">{formatFileSize(preview.size)}</span>
                            </div>
                        ))}
                    </div>
                    <button className="file-preview-clear" onClick={clearFiles}>
                        Clear all
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className="chat-input-area">
                <div className="chat-input-wrapper">
                    {/* Emoji Button */}
                    <button
                        className={`chat-action-btn emoji-btn ${showEmojiPicker ? 'active' : ''}`}
                        onClick={() => setShowEmojiPicker(prev => !prev)}
                        title="Emoji"
                        type="button"
                    >
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-8c.78 0 1.41-.63 1.41-1.41S8.78 9.18 8 9.18s-1.41.63-1.41 1.41S7.22 12 8 12zm8 0c.78 0 1.41-.63 1.41-1.41S16.78 9.18 16 9.18s-1.41.63-1.41 1.41S15.22 12 16 12zm-4 5.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                        </svg>
                    </button>

                    {/* Media Attach Button */}
                    <button
                        className="chat-action-btn media-btn"
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach media"
                        type="button"
                    >
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
                        </svg>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                        multiple
                        style={{ display: 'none' }}
                    />

                    {/* Voice Recorder Button */}
                    <button
                        className={`chat-action-btn voice-btn ${isRecording ? 'recording' : ''}`}
                        onClick={() => {
                            if (isRecording) {
                                // Stop recording
                                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                                    mediaRecorderRef.current.stop();
                                }
                                clearInterval(recordingTimerRef.current);
                                setIsRecording(false);
                                setRecordingTime(0);
                            } else {
                                // Start recording
                                navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                                    const recorder = new MediaRecorder(stream);
                                    audioChunksRef.current = [];
                                    mediaRecorderRef.current = recorder;

                                    recorder.ondataavailable = (e) => {
                                        if (e.data.size > 0) audioChunksRef.current.push(e.data);
                                    };

                                    recorder.onstop = () => {
                                        stream.getTracks().forEach(t => t.stop());
                                        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                                        const file = new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
                                        onSendMediaMessage('🎤 Voice message', [file], []);
                                    };

                                    recorder.start();
                                    setIsRecording(true);
                                    setRecordingTime(0);
                                    recordingTimerRef.current = setInterval(() => {
                                        setRecordingTime(prev => prev + 1);
                                    }, 1000);
                                }).catch(err => {
                                    console.error('Microphone access denied:', err);
                                });
                            }
                        }}
                        title={isRecording ? 'Stop recording' : 'Record voice message'}
                        type="button"
                    >
                        {isRecording ? (
                            <>
                                <span className="voice-recording-dot" />
                                <span className="voice-recording-time">
                                    {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                                </span>
                            </>
                        ) : (
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1.02 1.15.49 3.52 3.27 6.27 6.93 6.7V21h2v-3.15c3.66-.43 6.44-3.18 6.93-6.7.07-.61-.41-1.15-1.02-1.15z" />
                            </svg>
                        )}
                    </button>

                    {/* Text Input */}
                    <MentionInput
                        className="chat-input"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        onMentionedUsersChange={setMentionedUserIds}
                        mentionUsersWithin={conversation.type === 'GROUP' ? null : null} // Can optimize to fetch group users only if there is group data
                    />

                    {/* Send Button */}
                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={!inputValue.trim() && selectedFiles.length === 0}
                    >
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </div>

                {/* Emoji Picker Popover */}
                {showEmojiPicker && (
                    <div className="emoji-picker-container">
                        <EmojiPicker
                            onSelect={handleEmojiSelect}
                            onClose={() => setShowEmojiPicker(false)}
                        />
                    </div>
                )}
            </div>

            {/* Media Lightbox — supports Image, Video, File */}
            {lightboxMedia && (
                <div className="chat-lightbox" onClick={() => { pauseAllMedia(); setLightboxMedia(null); }}>
                    <button className="lightbox-close" onClick={() => { pauseAllMedia(); setLightboxMedia(null); }}>×</button>

                    {/* Download button */}
                    <a
                        className="lightbox-download"
                        href={lightboxMedia.url}
                        download={lightboxMedia.name || 'download'}
                        onClick={(e) => e.stopPropagation()}
                        title="Download"
                    >
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                        </svg>
                    </a>

                    {lightboxMedia.type === 'image' && (
                        <img
                            src={lightboxMedia.url}
                            alt={lightboxMedia.name || 'Full size'}
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}

                    {lightboxMedia.type === 'video' && (
                        <video
                            src={lightboxMedia.url}
                            controls
                            autoPlay
                            className="lightbox-video"
                            onClick={(e) => e.stopPropagation()}
                            tabIndex="0"
                            autoFocus
                            onKeyDown={(e) => {
                                const el = e.target;
                                if (e.key === ' ' || e.code === 'Space') {
                                    e.preventDefault();
                                    if (el.paused) el.play(); else el.pause();
                                } else if (e.key === 'ArrowRight') {
                                    el.currentTime += 5;
                                } else if (e.key === 'ArrowLeft') {
                                    el.currentTime -= 5;
                                } else if (e.key === 'f' || e.key === 'F') {
                                    if (el.requestFullscreen) el.requestFullscreen();
                                } else if (e.key === 'Escape') {
                                    setLightboxMedia(null);
                                }
                            }}
                        />
                    )}

                    {lightboxMedia.type === 'file' && (
                        <div className="lightbox-file" onClick={(e) => e.stopPropagation()}>
                            <span className="lightbox-file-icon">📄</span>
                            <span className="lightbox-file-name">{lightboxMedia.name || 'File'}</span>
                            {lightboxMedia.size > 0 && (
                                <span className="lightbox-file-size">{formatFileSize(lightboxMedia.size)}</span>
                            )}
                            <a
                                className="lightbox-file-download-btn"
                                href={lightboxMedia.url}
                                download={lightboxMedia.name || 'download'}
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                                </svg>
                                Download
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}



/* ──────────────────────────
   MESSAGE ATTACHMENT — Fully functional media previews
   ────────────────────────── */
function MessageAttachment({ attachment, onMediaClick, onMediaLoad }) {
    const { fileUrl, fileName, fileType, fileSize, isUploading } = attachment;

    const isImage = fileType?.startsWith('image');
    const isVideo = fileType?.startsWith('video');
    const isAudio = fileType?.startsWith('audio');

    const formatSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Resolve URLs through the backend base URL helper
    const resolvedUrl = getMediaUrl(fileUrl);

    if (isImage) {
        return (
            <div className={`attachment-preview image-attachment ${isUploading ? 'uploading' : ''}`}>
                <img
                    src={resolvedUrl}
                    alt={fileName || 'Image'}
                    onClick={() => onMediaClick({ type: 'image', url: resolvedUrl, name: fileName, size: fileSize })}
                    onLoad={onMediaLoad}
                    loading="lazy"
                />
                <div className="attachment-hover-overlay">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff">
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                        <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z" />
                    </svg>
                </div>
                {isUploading && (
                    <div className="attachment-upload-overlay">
                        <div className="upload-spinner" />
                    </div>
                )}
            </div>
        );
    }

    if (isVideo) {
        return (
            <div className={`attachment-preview video-attachment ${isUploading ? 'uploading' : ''}`}>
                <video src={resolvedUrl} preload="metadata" onLoadedMetadata={onMediaLoad} />
                <div
                    className="video-play-overlay"
                    onClick={() => onMediaClick({ type: 'video', url: resolvedUrl, name: fileName, size: fileSize })}
                >
                    <div className="video-play-btn">
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="#fff">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                    {fileSize > 0 && (
                        <span className="video-size-badge">{formatSize(fileSize)}</span>
                    )}
                </div>
                {isUploading && (
                    <div className="attachment-upload-overlay">
                        <div className="upload-spinner" />
                    </div>
                )}
            </div>
        );
    }

    if (isAudio) {
        return (
            <div className={`attachment-preview audio-attachment ${isUploading ? 'uploading' : ''}`}>
                <div className="audio-player" onClick={(e) => e.stopPropagation()}>
                    <span className="audio-icon">🎵</span>
                    <audio
                        src={resolvedUrl}
                        controls
                        preload="metadata"
                        onKeyDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
                    />
                </div>
                {fileName && <span className="audio-filename">{fileName}</span>}
                {isUploading && (
                    <div className="attachment-upload-overlay">
                        <div className="upload-spinner" />
                    </div>
                )}
            </div>
        );
    }

    // File/document — clickable with download
    const getFileIcon = (name) => {
        const ext = name?.split('.').pop()?.toLowerCase() || '';
        const icons = {
            pdf: '📕', doc: '📘', docx: '📘', xls: '📊', xlsx: '📊',
            ppt: '📙', pptx: '📙', txt: '📝', zip: '📦', rar: '📦',
            csv: '📊', json: '📋', html: '🌐', css: '🎨', js: '📜',
        };
        return icons[ext] || '📄';
    };

    return (
        <div className={`attachment-preview file-attachment ${isUploading ? 'uploading' : ''}`}>
            <a
                className="file-download-link"
                href={resolvedUrl}
                download={fileName || 'download'}
                onClick={(e) => e.stopPropagation()}
                style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
            >
                <span className="file-icon">{getFileIcon(fileName)}</span>
                <div className="file-info">
                    <span className="file-name">{fileName || 'File'}</span>
                    {fileSize > 0 && <span className="file-size">{formatSize(fileSize)}</span>}
                </div>
                <svg className="file-download-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                </svg>
            </a>
            {isUploading && (
                <div className="attachment-upload-overlay">
                    <div className="upload-spinner" />
                </div>
            )}
        </div>
    );
}

/* ──────────────────────────
   EMPTY STATE
   ────────────────────────── */
function ChatEmptyState() {
    return (
        <div className="chat-empty-state">
            <div className="chat-empty-icon">
                <svg viewBox="0 0 24 24" width="80" height="80" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                    <path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z" opacity="0.5" />
                </svg>
            </div>
            <h3>Welcome to Messages</h3>
            <p>Select a conversation or start a new chat</p>
        </div>
    );
}

/* ──────────────────────────
   HELPERS
   ────────────────────────── */
function groupMessagesByDate(messages) {
    const groups = [];
    let currentDate = null;
    let currentMsgs = [];

    messages.forEach(msg => {
        const date = formatDateLabel(msg.createdAt);
        if (date !== currentDate) {
            if (currentMsgs.length > 0) {
                groups.push({ date: currentDate, msgs: currentMsgs });
            }
            currentDate = date;
            currentMsgs = [msg];
        } else {
            currentMsgs.push(msg);
        }
    });

    if (currentMsgs.length > 0) {
        groups.push({ date: currentDate, msgs: currentMsgs });
    }

    return groups;
}

function formatDateLabel(dateStr) {
    if (!dateStr) return 'Today';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return 'Today';
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

function formatMessageTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default Chat;
