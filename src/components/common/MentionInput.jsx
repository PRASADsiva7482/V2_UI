import React, { useState, useRef, useEffect, useCallback } from 'react';
import { searchUsers } from '../../services/api/profile';
import { getCurrentMentionQuery } from '../../services/utils/mentionUtils';
import './MentionInput.css';

/**
 * MentionInput - A textarea with @mention autocomplete support.
 * 
 * When the user types "@" followed by characters, a dropdown appears
 * showing matching users. Selecting a user inserts their @username.
 * 
 * Props:
 *   - value: string - current text value
 *   - onChange: (newValue: string) => void
 *   - placeholder: string
 *   - maxLength: number
 *   - rows: number
 *   - disabled: boolean
 *   - autoFocus: boolean
 *   - className: string
 *   - onMentionedUsersChange: (userIds: string[]) => void - callback when mentioned users change
 */
function MentionInput({
    value,
    onChange,
    placeholder = "What's happening?",
    maxLength,
    rows = 2,
    disabled = false,
    autoFocus = false,
    className = '',
    onMentionedUsersChange
}) {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mentionQuery, setMentionQuery] = useState(null);
    const [mentionedUsers, setMentionedUsers] = useState(new Map()); // username -> userId
    const textareaRef = useRef(null);
    const suggestionsRef = useRef(null);
    const debounceRef = useRef(null);

    // Search for users when mention query changes
    const searchForUsers = useCallback(async (query) => {
        if (!query || query.length < 1) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            setLoading(true);
            const response = await searchUsers(query, { page: 0, size: 8 });
            const users = response?.content || response || [];
            setSuggestions(Array.isArray(users) ? users : []);
            setShowSuggestions(Array.isArray(users) && users.length > 0);
            setSelectedIndex(0);
        } catch (error) {
            console.error('Error searching users for mention:', error);
            setSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle text changes
    const handleChange = useCallback((e) => {
        const newValue = e.target.value;
        onChange(newValue);

        // Check if user is currently typing a mention
        const cursorPos = e.target.selectionStart;
        const mention = getCurrentMentionQuery(newValue, cursorPos);

        if (mention && mention.query.length >= 1) {
            setMentionQuery(mention);

            // Debounce the search
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => {
                searchForUsers(mention.query);
            }, 300);
        } else {
            setMentionQuery(null);
            setShowSuggestions(false);
            setSuggestions([]);
        }
    }, [onChange, searchForUsers]);

    // Select a user from suggestions
    const selectUser = useCallback((user) => {
        if (!mentionQuery || !textareaRef.current) return;

        const textarea = textareaRef.current;
        const beforeMention = value.substring(0, mentionQuery.startIndex);
        const afterMention = value.substring(mentionQuery.endIndex);
        const username = user.username || user.userName;
        const newValue = `${beforeMention}@${username} ${afterMention}`;

        onChange(newValue);

        // Track mentioned user
        const newMentionedUsers = new Map(mentionedUsers);
        newMentionedUsers.set(username.toLowerCase(), user.userId || user.id);
        setMentionedUsers(newMentionedUsers);

        if (onMentionedUsersChange) {
            onMentionedUsersChange(Array.from(newMentionedUsers.values()));
        }

        // Close suggestions
        setShowSuggestions(false);
        setSuggestions([]);
        setMentionQuery(null);

        // Set cursor position after the inserted mention
        setTimeout(() => {
            const newCursorPos = mentionQuery.startIndex + username.length + 2; // @ + username + space
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    }, [mentionQuery, value, onChange, mentionedUsers, onMentionedUsersChange]);

    // Handle keyboard navigation in suggestions
    const handleKeyDown = useCallback((e) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % suggestions.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
                break;
            case 'Enter':
                if (showSuggestions && suggestions[selectedIndex]) {
                    e.preventDefault();
                    selectUser(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSuggestions([]);
                break;
            case 'Tab':
                if (showSuggestions && suggestions[selectedIndex]) {
                    e.preventDefault();
                    selectUser(suggestions[selectedIndex]);
                }
                break;
            default:
                break;
        }
    }, [showSuggestions, suggestions, selectedIndex, selectUser]);

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target) &&
                textareaRef.current &&
                !textareaRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        if (showSuggestions) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSuggestions]);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    // Get the display avatar
    const getAvatarUrl = (user) => {
        const url = user.profilePictureUrl || user.profilePicture;
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const baseUrl = window.config?.api?.mediaBaseUrl || 'http://localhost:2000';
        return `${baseUrl}/${url.startsWith('/') ? url.substring(1) : url}`;
    };

    return (
        <div className="mention-input-wrapper">
            <textarea
                ref={textareaRef}
                className={`mention-textarea ${className}`}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                maxLength={maxLength}
                rows={rows}
                disabled={disabled}
                autoFocus={autoFocus}
            />

            {/* Mention Suggestions Dropdown */}
            {showSuggestions && (
                <div className="mention-suggestions" ref={suggestionsRef}>
                    {loading ? (
                        <div className="mention-loading">
                            <div className="mention-loading-spinner" />
                            <span>Searching users...</span>
                        </div>
                    ) : (
                        suggestions.map((user, index) => {
                            const username = user.username || user.userName;
                            const displayName = user.displayName || user.firstName || username;
                            const avatarUrl = getAvatarUrl(user);

                            return (
                                <div
                                    key={user.userId || user.id || index}
                                    className={`mention-suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                                    onClick={() => selectUser(user)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <div className="mention-suggestion-avatar">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt={displayName} />
                                        ) : (
                                            <div className="mention-avatar-placeholder">
                                                {(displayName || 'U').charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mention-suggestion-info">
                                        <span className="mention-suggestion-name">{displayName}</span>
                                        <span className="mention-suggestion-username">@{username}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

export default MentionInput;
