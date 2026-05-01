import React, { useState, useRef } from 'react';
import { createPost } from '../../services/api/posts';
import { uploadMedia } from '../../services/api/media';
import Avatar from '../common/Avatar';
import MediaUploader from '../media/MediaUploader';
import MentionInput from '../common/MentionInput';
import PollCreator from './PollCreator';
import './CreatePostModal.css';

function CreatePostModal({ onClose, onPostCreated }) {
    const [content, setContent] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const [error, setError] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [mentionedUserIds, setMentionedUserIds] = useState([]);
    const [showPollCreator, setShowPollCreator] = useState(false);
    const [isDraft, setIsDraft] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [gifSearch, setGifSearch] = useState('');
    const [pollData, setPollData] = useState({
        question: '',
        options: ['', ''],
        durationHours: 24
    });
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const overlayRef = useRef(null);

    const handleMediaSelect = (files) => setSelectedFiles(files);
    const triggerFileInput = () => fileInputRef.current?.click();

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            const fileData = { file: files[0], url: null, aspectRatio: null, width: null, height: null };
            setSelectedFiles([fileData]);
            handleMediaSelect([fileData]);
        }
        event.target.value = '';
    };

    const toggleEmojiPicker = () => setShowEmojiPicker(v => !v);

    const insertEmoji = (emoji) => {
        setContent(c => c + emoji);
        setShowEmojiPicker(false);
    };

    const emojis = ['😀','😂','😍','🥰','😎','🤔','😢','😭','😡','🤗','👍','👎','👏','🙏','💪','🎉','🎊','❤️','💯','🔥','✨','⭐','🌟','💡','🎯','🏆','🎁','🎈','🌈','☀️','🌙','⚡'];

    React.useEffect(() => {
        if (!showEmojiPicker) return;
        const close = (e) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target))
                setShowEmojiPicker(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [showEmojiPicker]);

    React.useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const handleOverlayClick = (e) => { if (e.target === overlayRef.current) onClose(); };

    const isPollValid = () => {
        if (!showPollCreator || !pollData.question.trim()) return false;
        return pollData.options.filter(o => o.trim()).length >= 2;
    };

    const handleSubmit = async (e, asDraft = false) => {
        if (e) e.preventDefault();
        if (!content.trim() && selectedFiles.length === 0 && !isPollValid()) {
            setError('Please add some content, media, or a poll to your post');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            let mediaIds = null;
            if (selectedFiles.length > 0) {
                setUploadingMedia(true);
                const file = selectedFiles[0].file || selectedFiles[0];
                const res = await uploadMedia(file);
                mediaIds = [res.id];
                setUploadingMedia(false);
            }
            const finalPollData = (showPollCreator && isPollValid()) ? {
                question: pollData.question.trim(),
                options: pollData.options.filter(o => o.trim()),
                durationHours: pollData.durationHours
            } : null;

            const newPost = await createPost(content, mediaIds, mentionedUserIds, finalPollData, null, null, asDraft);
            setContent('');
            setSelectedFiles([]);
            setShowPollCreator(false);
            setPollData({ question: '', options: ['', ''], durationHours: 24 });
            if (onPostCreated) onPostCreated(newPost);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create post. Please try again.');
        } finally {
            setLoading(false);
            setUploadingMedia(false);
        }
    };

    const charCount = content.length;
    const maxChars = 280;
    const isOverLimit = charCount > maxChars;
    const isNearLimit = charCount > 260;
    const canSubmit = (content.trim() || selectedFiles.length > 0 || isPollValid()) && !isOverLimit && !uploadingMedia;

    return (
        <div className="create-post-modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
            <div className="create-post-modal" id="create-post-modal">

                {/* ── Header ── */}
                <div className="create-post-modal-header">
                    <button type="button" className="modal-close-btn" onClick={onClose} title="Close" aria-label="Close">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
                        </svg>
                    </button>
                    <h3 className="modal-title">Create Post</h3>
                    <div className="modal-header-spacer" />
                </div>

                {/* ── Body ── */}
                <div className="create-post-modal-body">
                    <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} />

                    {/* Compose area */}
                    <div className="modal-compose-area">
                        <div className="modal-compose-avatar">
                            <Avatar size="medium" />
                        </div>
                        <div className="modal-compose-content">
                            <MentionInput
                                className="modal-compose-textarea"
                                placeholder="What's happening?"
                                value={content}
                                onChange={setContent}
                                maxLength={maxChars}
                                rows={4}
                                disabled={loading}
                                autoFocus
                                onMentionedUsersChange={setMentionedUserIds}
                            />
                        </div>
                    </div>

                    {/* Poll */}
                    {showPollCreator && (
                        <div className="modal-poll-container">
                            <PollCreator pollData={pollData} onChange={setPollData} onRemove={() => setShowPollCreator(false)} disabled={loading} />
                        </div>
                    )}

                    {/* Media preview */}
                    {selectedFiles.length > 0 && !showPollCreator && (
                        <div className="modal-media-preview">
                            <MediaUploader selectedFiles={selectedFiles} onMediaSelect={handleMediaSelect} maxFiles={1} />
                        </div>
                    )}

                    {error && <div className="modal-error">{error}</div>}

                    {/* ── Footer ── */}
                    <div className="modal-compose-footer">
                        {/* Left: media / poll / emoji / gif */}
                        <div className="modal-compose-actions">
                            {/* Media */}
                            <button
                                type="button"
                                className={`modal-action-icon-btn ${selectedFiles.length > 0 ? 'active' : ''}`}
                                onClick={triggerFileInput}
                                disabled={loading || selectedFiles.length >= 1 || showPollCreator}
                                title="Add photo / video"
                                aria-label="Add media"
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                    <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z" />
                                </svg>
                            </button>

                            {/* Poll */}
                            <button
                                type="button"
                                className={`modal-action-icon-btn ${showPollCreator ? 'active' : ''}`}
                                onClick={() => setShowPollCreator(v => !v)}
                                title="Create poll"
                                disabled={loading || selectedFiles.length > 0}
                                aria-label="Add poll"
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                    <path d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v12zm-3-10h-2v8h2V8zm-4 4h-2v4h2v-4zm-4-2H6v6h2v-6z" />
                                </svg>
                            </button>

                            {/* Emoji */}
                            <button
                                type="button"
                                className="modal-action-icon-btn"
                                onClick={toggleEmojiPicker}
                                title="Add emoji"
                                aria-label="Add emoji"
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                    <path d="M12 22.75C6.072 22.75 1.25 17.928 1.25 12S6.072 1.25 12 1.25 22.75 6.072 22.75 12 17.928 22.75 12 22.75zm0-20C6.9 2.75 2.75 6.9 2.75 12S6.9 21.25 12 21.25s9.25-4.15 9.25-9.25S17.1 2.75 12 2.75zm0 13c-1.93 0-3.682-.95-4.732-2.54-.344-.52-.032-1.22.562-1.22h8.34c.594 0 .906.7.562 1.22-1.05 1.59-2.802 2.54-4.732 2.54zM8.5 11c.828 0 1.5-.672 1.5-1.5S9.328 8 8.5 8 7 8.672 7 9.5 7.672 11 8.5 11zm7 0c.828 0 1.5-.672 1.5-1.5S16.328 8 15.5 8 14 8.672 14 9.5s.672 1.5 1.5 1.5z" />
                                </svg>
                            </button>

                            {/* GIF */}
                            <button
                                type="button"
                                className="modal-action-icon-btn modal-gif-btn"
                                onClick={() => setShowGifPicker(v => !v)}
                                title="Add GIF"
                                aria-label="Add GIF"
                            >
                                GIF
                            </button>

                            {/* Emoji picker popup */}
                            {showEmojiPicker && (
                                <div className="modal-emoji-picker" ref={emojiPickerRef}>
                                    <div className="modal-emoji-grid">
                                        {emojis.map((emoji, i) => (
                                            <button key={i} type="button" className="emoji-btn" onClick={() => insertEmoji(emoji)}>
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* GIF picker popup */}
                            {showGifPicker && (
                                <div className="modal-gif-picker">
                                    <input type="text" placeholder="Search GIFs…" value={gifSearch} onChange={(e) => setGifSearch(e.target.value)} className="modal-gif-search" />
                                    <p className="modal-gif-hint">GIF integration requires Tenor/Giphy API key.</p>
                                </div>
                            )}
                        </div>

                        {/* Right: char count + Submit Buttons */}
                        <div className="modal-compose-footer-right">
                            {charCount > 0 && (
                                <div className={`modal-char-count ${isNearLimit ? 'warning' : ''} ${isOverLimit ? 'error' : ''}`}>
                                    <svg viewBox="0 0 36 36" width="28" height="28" style={{ transform: 'rotate(-90deg)' }}>
                                        <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border)" strokeWidth="3" />
                                        <circle
                                            cx="18" cy="18" r="14" fill="none"
                                            stroke={isOverLimit ? 'var(--danger)' : isNearLimit ? '#FFD400' : 'var(--twitter-blue)'}
                                            strokeWidth="3"
                                            strokeDasharray={`${Math.min((charCount / maxChars) * 87.96, 87.96)} 87.96`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    {isNearLimit && (
                                        <span className="modal-char-text">{maxChars - charCount}</span>
                                    )}
                                </div>
                            )}

                            <div className="modal-submit-group">
                                <button
                                    type="button"
                                    className="modal-draft-btn"
                                    disabled={!canSubmit || loading}
                                    onClick={(e) => handleSubmit(e, true)}
                                >
                                    Draft
                                </button>
                                <button
                                    type="button"
                                    className="modal-post-btn"
                                    disabled={!canSubmit || loading}
                                    onClick={(e) => handleSubmit(e, false)}
                                >
                                    {loading ? (uploadingMedia ? 'Uploading…' : 'Posting…') : 'Post'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreatePostModal;
