import React, { useState, useRef } from 'react';
import { createPost } from '../../services/api/posts';
import { uploadMedia } from '../../services/api/media';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import MediaUploader from '../media/MediaUploader';
import './CreatePostModal.css';

function CreatePostModal({ onClose, onPostCreated }) {
    const [content, setContent] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const [error, setError] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const overlayRef = useRef(null);

    const handleMediaSelect = (files) => {
        setSelectedFiles(files);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            const fileData = {
                file: files[0],
                url: null,
                aspectRatio: null,
                width: null,
                height: null
            };
            setSelectedFiles([fileData]);
            handleMediaSelect([fileData]);
        }
        event.target.value = '';
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const insertEmoji = (emoji) => {
        setContent(content + emoji);
        setShowEmojiPicker(false);
    };

    const emojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '😢', '😭', '😡', '🤗', '👍', '👎', '👏', '🙏', '💪', '🎉', '🎊', '❤️', '💯', '🔥', '✨', '⭐', '🌟', '💡', '🎯', '🏆', '🎁', '🎈', '🌈', '☀️', '🌙', '⚡'];

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    // Close on escape key
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim() && selectedFiles.length === 0) {
            setError('Please add some content or media to your post');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let mediaIds = null;

            if (selectedFiles.length > 0) {
                setUploadingMedia(true);
                const fileData = selectedFiles[0];
                const file = fileData.file || fileData;
                console.log('Uploading single media file:', file.name);

                const mediaResponse = await uploadMedia(file);
                mediaIds = [mediaResponse.id];

                console.log('Media uploaded successfully. ID:', mediaIds);
                setUploadingMedia(false);
            }

            console.log('Creating post with content:', content, 'and media:', mediaIds);
            const newPost = await createPost(content, mediaIds);

            console.log('Post created successfully:', newPost);
            setContent('');
            setSelectedFiles([]);

            if (onPostCreated) {
                onPostCreated(newPost);
            }
        } catch (error) {
            console.error('Error creating post:', error);
            setError(error.response?.data?.message || 'Failed to create post. Please try again.');
        } finally {
            setLoading(false);
            setUploadingMedia(false);
        }
    };

    const charCount = content.length;
    const maxChars = 280;
    const isOverLimit = charCount > maxChars;
    const isNearLimit = charCount > 260;
    const canSubmit = (content.trim() || selectedFiles.length > 0) && !isOverLimit;

    return (
        <div className="create-post-modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
            <div className="create-post-modal" id="create-post-modal">
                {/* Modal Header */}
                <div className="create-post-modal-header">
                    <button className="modal-close-btn" onClick={onClose} title="Close">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
                        </svg>
                    </button>
                    <h3 className="modal-title">Create Post</h3>
                    <div className="modal-header-spacer"></div>
                </div>

                {/* Modal Body */}
                <form className="create-post-modal-body" onSubmit={handleSubmit}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />

                    <div className="modal-compose-area">
                        <div className="modal-compose-avatar">
                            <Avatar size="medium" />
                        </div>
                        <div className="modal-compose-content">
                            <textarea
                                className="modal-compose-textarea"
                                placeholder="What's happening?"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                maxLength={maxChars}
                                rows={4}
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Media preview */}
                    {selectedFiles.length > 0 && (
                        <div className="modal-media-preview">
                            <MediaUploader
                                selectedFiles={selectedFiles}
                                onMediaSelect={handleMediaSelect}
                                maxFiles={1}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="modal-error">
                            {error}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="modal-compose-footer">
                        <div className="modal-compose-actions">
                            <button
                                type="button"
                                className="modal-action-icon-btn"
                                onClick={triggerFileInput}
                                disabled={loading || selectedFiles.length >= 1}
                                title="Add photo/video"
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                    <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z" />
                                </svg>
                            </button>

                            <button
                                type="button"
                                className="modal-action-icon-btn"
                                onClick={toggleEmojiPicker}
                                title="Add emoji"
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                    <path d="M12 22.75C6.072 22.75 1.25 17.928 1.25 12S6.072 1.25 12 1.25 22.75 6.072 22.75 12 17.928 22.75 12 22.75zm0-20C6.9 2.75 2.75 6.9 2.75 12S6.9 21.25 12 21.25s9.25-4.15 9.25-9.25S17.1 2.75 12 2.75zm0 13c-1.93 0-3.682-.95-4.732-2.54-.344-.52-.032-1.22.562-1.22h8.34c.594 0 .906.7.562 1.22-1.05 1.59-2.802 2.54-4.732 2.54zM8.5 11c.828 0 1.5-.672 1.5-1.5S9.328 8 8.5 8 7 8.672 7 9.5 7.672 11 8.5 11zm7 0c.828 0 1.5-.672 1.5-1.5S16.328 8 15.5 8 14 8.672 14 9.5s.672 1.5 1.5 1.5z" />
                                </svg>
                            </button>

                            {/* Emoji Picker Popup */}
                            {showEmojiPicker && (
                                <div className="modal-emoji-picker" ref={emojiPickerRef}>
                                    <div className="modal-emoji-grid">
                                        {emojis.map((emoji, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                className="emoji-btn"
                                                onClick={() => insertEmoji(emoji)}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-compose-footer-right">
                            {content.length > 0 && (
                                <div className={`modal-char-count ${isNearLimit ? 'warning' : ''} ${isOverLimit ? 'error' : ''}`}>
                                    <span>{charCount}/{maxChars}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                size="medium"
                                disabled={!canSubmit}
                                loading={loading}
                            >
                                {uploadingMedia ? 'Uploading...' : 'Post'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreatePostModal;
