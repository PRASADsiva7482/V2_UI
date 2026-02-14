import { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../auth/AuthProvider';
import { searchUsers } from '../../services/api/profile';
import chatWebSocketService from '../../services/websocket/chatWebSocket';
import Avatar from '../common/Avatar';
import './Chat.css';

/* ────────────────────────────────────────────────────────────
   MAIN CHAT COMPONENT
   WhatsApp-like layout: ChatList (left) + ChatRoom (right)
   ──────────────────────────────────────────────────────────── */
function Chat() {
    const {
        conversations, activeConversation, setActiveConversation,
        messages, loading, wsConnected, onlineUsers, unreadCounts,
        loadMessages, sendMessage, markConversationAsRead,
        sendTypingIndicator, startConversation, currentUserId,
    } = useChat();

    const [showNewChat, setShowNewChat] = useState(false);

    const handleSelectConversation = useCallback((conv) => {
        setActiveConversation(conv);
        loadMessages(conv.id);
        markConversationAsRead(conv.id);
    }, [setActiveConversation, loadMessages, markConversationAsRead]);

    const handleBack = useCallback(() => {
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
                    onNewChat={() => setShowNewChat(true)}
                    wsConnected={wsConnected}
                />
                {showNewChat ? (
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
                        onSendMessage={(content) => sendMessage(activeConversation.id, content)}
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
function ChatListHeader({ onNewChat, wsConnected }) {
    return (
        <div className="chat-list-header">
            <h2 className="chat-list-title">
                Messages
                {wsConnected && <span className="online-dot" title="Connected" />}
            </h2>
            <button className="new-chat-btn" onClick={onNewChat} title="New conversation">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                    <path d="M11 5h2v4h4v2h-4v4h-2v-4H7V9h4z" />
                </svg>
            </button>
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

/* ──────────────────────────
   CHAT ROOM
   ────────────────────────── */
function ChatRoom({ conversation, messages, currentUserId, onSendMessage, onMarkRead, onSendTyping, onBack, onLoadMore }) {
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [remoteTyping, setRemoteTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const displayName = conversation.type === 'DIRECT'
        ? (conversation.otherUserDisplayName || conversation.otherUserName || 'Unknown')
        : (conversation.groupName || 'Group Chat');
    const isOnline = conversation.otherUserOnline;

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
            if (isNearBottom || messages.length <= 30) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [messages]);

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

    const handleSend = () => {
        const content = inputValue.trim();
        if (!content) return;

        onSendMessage(content);
        setInputValue('');
        handleStopTyping();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);

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

    // Scroll to load more
    const handleScroll = (e) => {
        if (e.target.scrollTop === 0 && messages.length > 0) {
            onLoadMore();
        }
    };

    // Group messages by date
    const groupedMessages = groupMessagesByDate(messages);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'SENDING':
                return <span className="msg-status sending">⏳</span>;
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
            </div>

            {/* Messages */}
            <div
                className="chat-messages"
                ref={messagesContainerRef}
                onScroll={handleScroll}
            >
                {groupedMessages.map(({ date, msgs }, groupIdx) => (
                    <div key={date}>
                        <div className="date-separator">
                            <span>{date}</span>
                        </div>
                        {msgs.map((msg, idx) => {
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
                                                {msg.attachments && msg.attachments.length > 0 && (
                                                    <div className="message-attachments">
                                                        {msg.attachments.map(att => (
                                                            <div key={att.id} className="attachment-preview">
                                                                {att.fileType?.startsWith('image') ? (
                                                                    <img src={att.fileUrl} alt={att.fileName} />
                                                                ) : (
                                                                    <a href={att.fileUrl} target="_blank" rel="noreferrer">
                                                                        📄 {att.fileName}
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <span className="message-text">{msg.content}</span>
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

            {/* Input */}
            <div className="chat-input-area">
                <div className="chat-input-wrapper">
                    <textarea
                        className="chat-input"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                    />
                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                    >
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </div>
            </div>
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
