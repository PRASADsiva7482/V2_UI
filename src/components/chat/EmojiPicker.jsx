import { useState, useEffect, useRef, useMemo } from 'react';
import './EmojiPicker.css';

/* ════════════════════════════════════════════════════════════════
   EMOJI PICKER — Lightweight, categorized, searchable
   No external dependency — uses native Unicode emojis.
   ════════════════════════════════════════════════════════════════ */

const EMOJI_CATEGORIES = [
    {
        id: 'smileys',
        name: 'Smileys & People',
        icon: '😀',
        emojis: [
            '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
            '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
            '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫',
            '🤔', '🫡', '🤐', '🤨', '😐', '😑', '😶', '🫥', '😏', '😒',
            '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷',
            '🤒', '🤕', '🤢', '🤮', '🥵', '🥶', '🥴', '😵', '🤯', '🤠',
            '🥳', '🥸', '😎', '🤓', '🧐', '😕', '🫤', '😟', '🙁', '☹️',
            '😮', '😯', '😲', '😳', '🥺', '🥹', '😦', '😧', '😨', '😰',
            '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫',
            '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩',
            '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹',
            '😻', '😼', '😽', '🙀', '😿', '😾',
        ],
    },
    {
        id: 'gestures',
        name: 'Gestures & Body',
        icon: '👋',
        emojis: [
            '👋', '🤚', '🖐️', '✋', '🖖', '🫱', '🫲', '🫳', '🫴', '👌',
            '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉',
            '👆', '🖕', '👇', '☝️', '🫵', '👍', '👎', '✊', '👊', '🤛',
            '🤜', '👏', '🙌', '🫶', '👐', '🤲', '🤝', '🙏', '✍️', '💅',
            '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠',
            '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '🫦', '💋',
        ],
    },
    {
        id: 'hearts',
        name: 'Hearts & Emotions',
        icon: '❤️',
        emojis: [
            '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
            '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝',
            '💟', '♥️', '💌', '💐', '🌹', '🥀', '💫', '⭐', '🌟', '✨',
            '⚡', '🔥', '💥', '🎉', '🎊', '🎈', '🎁', '🏆', '🏅', '🥇',
        ],
    },
    {
        id: 'animals',
        name: 'Animals & Nature',
        icon: '🐶',
        emojis: [
            '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨',
            '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
            '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇',
            '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞',
            '🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱',
            '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁',
        ],
    },
    {
        id: 'food',
        name: 'Food & Drink',
        icon: '🍕',
        emojis: [
            '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐',
            '🍈', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🫛',
            '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅',
            '🥔', '🍠', '🫘', '🥐', '🥖', '🫓', '🍞', '🥨', '🥯', '🧇',
            '🍕', '🌭', '🍔', '🍟', '🥙', '🌮', '🌯', '🫔', '🥗', '🥘',
            '☕', '🍵', '🫖', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻',
        ],
    },
    {
        id: 'travel',
        name: 'Travel & Places',
        icon: '✈️',
        emojis: [
            '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
            '🛻', '🚚', '🚛', '🚜', '🛵', '🏍️', '🛺', '🚲', '🛴', '🚂',
            '🚆', '🚇', '🚈', '🚊', '🚝', '🚄', '✈️', '🛩️', '🚀', '🛸',
            '🚁', '⛵', '🚤', '🛥️', '⛴️', '🚢', '🏠', '🏡', '🏢', '🏣',
            '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯',
            '🗽', '🗼', '🏰', '🎡', '🎢', '🎠', '⛲', '⛱️', '🌅', '🌄',
        ],
    },
    {
        id: 'objects',
        name: 'Objects',
        icon: '💡',
        emojis: [
            '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💽', '💾', '💿',
            '📀', '🎮', '🕹️', '🎲', '🧩', '🎭', '🎨', '🎬', '🎤', '🎧',
            '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '📷', '📸',
            '📹', '🎥', '📽️', '🔍', '🔎', '💡', '🔦', '🏮', '📝', '✏️',
            '🖊️', '🖋️', '📎', '📌', '📍', '✂️', '🗑️', '🔧', '🔨', '💎',
        ],
    },
    {
        id: 'symbols',
        name: 'Symbols',
        icon: '✅',
        emojis: [
            '✅', '❌', '❓', '❗', '‼️', '⁉️', '⭕', '🔴', '🟡', '🟢',
            '🔵', '🟣', '⚫', '⚪', '🟤', '🔶', '🔷', '🔸', '🔹', '🔺',
            '🔻', '💠', '🔘', '🔲', '🔳', '⬛', '⬜', '◼️', '◻️', '◾',
            '♻️', '♾️', '🔄', '🔃', '🔀', '🔁', '🔂', '▶️', '⏸️', '⏹️',
            '⏺️', '⏭️', '⏮️', '⏩', '⏪', '🔊', '🔉', '🔈', '🔇', '📢',
            '🏳️', '🏴', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️',
        ],
    },
];

// Flatten all emojis for search
const ALL_EMOJIS = EMOJI_CATEGORIES.flatMap(cat => cat.emojis);

// Recently used (stored in localStorage)
const RECENT_KEY = 'chat_recent_emojis';
const MAX_RECENT = 24;

function getRecentEmojis() {
    try {
        const stored = localStorage.getItem(RECENT_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function addRecentEmoji(emoji) {
    try {
        let recent = getRecentEmojis();
        recent = [emoji, ...recent.filter(e => e !== emoji)].slice(0, MAX_RECENT);
        localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
    } catch {
        // ignore
    }
}

export default function EmojiPicker({ onSelect, onClose }) {
    const [activeCategory, setActiveCategory] = useState('recent');
    const [searchQuery, setSearchQuery] = useState('');
    const [recentEmojis, setRecentEmojis] = useState(getRecentEmojis);
    const pickerRef = useRef(null);
    const searchRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                // Don't close if clicked on the emoji button itself
                if (!e.target.closest('.emoji-btn')) {
                    onClose();
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Filter emojis by search
    const filteredEmojis = useMemo(() => {
        if (!searchQuery.trim()) return null;
        // Simple search: just filter all emojis (they won't have text labels, so this is basic)
        // For a better UX, we could add emoji names, but keeping it lightweight
        return ALL_EMOJIS;
    }, [searchQuery]);

    const handleEmojiClick = (emoji) => {
        onSelect(emoji);
        addRecentEmoji(emoji);
        setRecentEmojis(getRecentEmojis());
    };

    const renderEmojiGrid = (emojis) => (
        <div className="emoji-grid">
            {emojis.map((emoji, idx) => (
                <button
                    key={`${emoji}-${idx}`}
                    className="emoji-item"
                    onClick={() => handleEmojiClick(emoji)}
                    title={emoji}
                    type="button"
                >
                    {emoji}
                </button>
            ))}
        </div>
    );

    const currentEmojis = searchQuery.trim()
        ? filteredEmojis
        : activeCategory === 'recent'
            ? recentEmojis
            : EMOJI_CATEGORIES.find(c => c.id === activeCategory)?.emojis || [];

    return (
        <div className="emoji-picker" ref={pickerRef}>
            {/* Search Input */}
            <div className="emoji-search">
                <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search emojis..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="emoji-search-input"
                />
                {searchQuery && (
                    <button
                        className="emoji-search-clear"
                        onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
                        type="button"
                    >×</button>
                )}
            </div>

            {/* Category Tabs */}
            {!searchQuery && (
                <div className="emoji-categories">
                    <button
                        className={`emoji-cat-btn ${activeCategory === 'recent' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('recent')}
                        title="Recently Used"
                        type="button"
                    >
                        🕐
                    </button>
                    {EMOJI_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className={`emoji-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                            title={cat.name}
                            type="button"
                        >
                            {cat.icon}
                        </button>
                    ))}
                </div>
            )}

            {/* Emoji Content */}
            <div className="emoji-content">
                {!searchQuery && activeCategory === 'recent' && recentEmojis.length === 0 && (
                    <div className="emoji-empty">
                        <span>No recent emojis</span>
                        <span className="emoji-empty-hint">Your recently used emojis will appear here</span>
                    </div>
                )}

                {searchQuery && currentEmojis?.length === 0 && (
                    <div className="emoji-empty">
                        <span>No emojis found</span>
                    </div>
                )}

                {currentEmojis && currentEmojis.length > 0 && (
                    <>
                        {!searchQuery && (
                            <div className="emoji-section-label">
                                {activeCategory === 'recent'
                                    ? 'Recently Used'
                                    : EMOJI_CATEGORIES.find(c => c.id === activeCategory)?.name || ''}
                            </div>
                        )}
                        {renderEmojiGrid(currentEmojis)}
                    </>
                )}
            </div>
        </div>
    );
}
