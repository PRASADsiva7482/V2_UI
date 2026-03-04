import { useState, useEffect, memo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { likePost, unlikePost, incrementViewCount, updatePost, deletePost } from '../../services/api/posts';
import { uploadMedia } from '../../services/api/media';
import { formatRelativeTime, formatNumber } from '../../services/utils/formatters';
import { parseContentSegments } from '../../services/utils/mentionUtils';
import Avatar from '../common/Avatar';
import CommentModal from '../comments/CommentModal';
import VideoPlayer from '../media/VideoPlayer';
import './PostCard.css';

// U-17: Wrapped in React.memo to prevent unnecessary re-renders in feed lists
const PostCard = memo(function PostCard({ post, onPostUpdate, onPostDeleted }) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // U-14: Sync local state from props when props change
    const [isLiked, setIsLiked] = useState(post.isLiked || false);
    const [likesCount, setLikesCount] = useState(post.likesCount || 0);
    const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
    const [viewsCount, setViewsCount] = useState(post.viewsCount || 0);
    const [isLiking, setIsLiking] = useState(false);
    const [showComments, setShowComments] = useState(false);

    // Edit/Delete state
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content || '');
    const [editMediaToRemove, setEditMediaToRemove] = useState([]);
    const [editNewFiles, setEditNewFiles] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editError, setEditError] = useState(null);
    const optionsMenuRef = useRef(null);
    const editFileInputRef = useRef(null);

    // U-14: Sync local state when post prop changes
    useEffect(() => {
        setIsLiked(post.isLiked || false);
        setLikesCount(post.likesCount || 0);
        setCommentsCount(post.commentsCount || 0);
        setViewsCount(post.viewsCount || 0);
    }, [post.isLiked, post.likesCount, post.commentsCount, post.viewsCount]);

    // Close options menu on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
                setShowOptionsMenu(false);
            }
        };
        if (showOptionsMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptionsMenu]);

    const handleLike = useCallback(async (e) => {
        e.stopPropagation();

        if (isLiking) return;

        try {
            setIsLiking(true);

            if (isLiked) {
                await unlikePost(post.id);
                setIsLiked(false);
                setLikesCount(prev => Math.max(0, prev - 1));
            } else {
                await likePost(post.id);
                setIsLiked(true);
                setLikesCount(prev => prev + 1);
            }

            if (onPostUpdate) {
                onPostUpdate(post.id, { isLiked: !isLiked, likesCount });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setIsLiking(false);
        }
    }, [isLiked, isLiking, likesCount, post.id, onPostUpdate]);

    const handlePostClick = useCallback(async () => {
        if (isEditing || showDeleteConfirm) return;

        // Increment view count
        try {
            await incrementViewCount(post.id);
            setViewsCount(prev => prev + 1);
        } catch (error) {
            console.error('Error incrementing view count:', error);
        }

        // Open comments modal
        setShowComments(true);
    }, [post.id, isEditing, showDeleteConfirm]);

    const handleCommentClick = useCallback((e) => {
        e.stopPropagation();
        setShowComments(true);
    }, []);

    const handleCommentAdded = useCallback(() => {
        setCommentsCount(prev => prev + 1);
        if (onPostUpdate) {
            onPostUpdate(post.id, { commentsCount: commentsCount + 1 });
        }
    }, [commentsCount, post.id, onPostUpdate]);

    const handleProfileClick = useCallback((e) => {
        e.stopPropagation();
        if (post.userId) {
            navigate(`/profile/${post.userId}`);
        }
    }, [post.userId, navigate]);

    const handleHashtagClick = useCallback((tagName) => {
        navigate(`/hashtag/${tagName}`);
    }, [navigate]);

    const handleMentionClick = useCallback((username) => {
        navigate(`/profile/u/${username}`);
    }, [navigate]);

    // ==================== Edit Handlers ====================

    const handleEditClick = useCallback((e) => {
        e.stopPropagation();
        setShowOptionsMenu(false);
        setIsEditing(true);
        setEditContent(post.content || '');
        setEditMediaToRemove([]);
        setEditNewFiles([]);
        setEditError(null);
    }, [post.content]);

    const handleCancelEdit = useCallback((e) => {
        if (e) e.stopPropagation();
        setIsEditing(false);
        setEditContent(post.content || '');
        setEditMediaToRemove([]);
        setEditNewFiles([]);
        setEditError(null);
    }, [post.content]);

    const handleRemoveExistingMedia = useCallback((mediaId, e) => {
        if (e) e.stopPropagation();
        setEditMediaToRemove(prev => [...prev, mediaId]);
    }, []);

    const handleUndoRemoveMedia = useCallback((mediaId, e) => {
        if (e) e.stopPropagation();
        setEditMediaToRemove(prev => prev.filter(id => id !== mediaId));
    }, []);

    const handleEditFileChange = useCallback((e) => {
        e.stopPropagation();
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setEditNewFiles(prev => [...prev, ...files].slice(0, 4));
        }
        e.target.value = '';
    }, []);

    const handleRemoveNewFile = useCallback((index, e) => {
        if (e) e.stopPropagation();
        setEditNewFiles(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleSaveEdit = useCallback(async (e) => {
        if (e) e.stopPropagation();

        // Validate - at least content or remaining media
        const remainingMedia = (post.media || []).filter(m => !editMediaToRemove.includes(m.id));
        if (!editContent.trim() && remainingMedia.length === 0 && editNewFiles.length === 0) {
            setEditError(t('post.editErrorEmpty', 'Post must have either content or media'));
            return;
        }

        try {
            setIsSaving(true);
            setEditError(null);

            let addMediaIds = null;

            // Upload new media files if any
            if (editNewFiles.length > 0) {
                addMediaIds = [];
                for (const file of editNewFiles) {
                    const mediaResponse = await uploadMedia(file);
                    addMediaIds.push(mediaResponse.id);
                }
            }

            const updateData = {
                content: editContent,
            };

            if (addMediaIds && addMediaIds.length > 0) {
                updateData.addMediaIds = addMediaIds;
            }

            if (editMediaToRemove.length > 0) {
                updateData.removeMediaIds = editMediaToRemove;
            }

            const updatedPost = await updatePost(post.id, updateData);

            setIsEditing(false);
            setEditMediaToRemove([]);
            setEditNewFiles([]);

            if (onPostUpdate) {
                onPostUpdate(post.id, updatedPost);
            }
        } catch (error) {
            console.error('Error updating post:', error);
            const errorMsg = error.response?.data?.message || t('post.editErrorFailed', 'Failed to update post');
            setEditError(errorMsg);
        } finally {
            setIsSaving(false);
        }
    }, [editContent, editMediaToRemove, editNewFiles, post.id, post.media, onPostUpdate, t]);

    // ==================== Delete Handlers ====================

    const handleDeleteClick = useCallback((e) => {
        e.stopPropagation();
        setShowOptionsMenu(false);
        setShowDeleteConfirm(true);
    }, []);

    const handleConfirmDelete = useCallback(async (e) => {
        if (e) e.stopPropagation();

        try {
            setIsDeleting(true);
            await deletePost(post.id);

            setShowDeleteConfirm(false);
            if (onPostDeleted) {
                onPostDeleted(post.id);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            const errorMsg = error.response?.data?.message || t('post.deleteErrorFailed', 'Failed to delete post');
            setEditError(errorMsg);
            setShowDeleteConfirm(false);
        } finally {
            setIsDeleting(false);
        }
    }, [post.id, onPostDeleted, t]);

    const handleCancelDelete = useCallback((e) => {
        if (e) e.stopPropagation();
        setShowDeleteConfirm(false);
    }, []);

    // ==================== Helpers ====================

    const getMediaUrl = (fileUrl) => {
        if (!fileUrl) return '';
        if (fileUrl.startsWith('http')) return fileUrl;
        const cleanPath = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
        const baseUrl = window.config?.api?.mediaBaseUrl || 'http://localhost:2000';
        return `${baseUrl}/${cleanPath}`;
    };

    const canEditOrDelete = post.isOwnPost && post.isEditable;

    return (
        <div className="post-card" onClick={handlePostClick}>
            <div className="post-avatar">
                <Avatar
                    src={post.author?.profilePictureUrl}
                    alt={post.author?.displayName}
                    size="medium"
                />
            </div>

            <div className="post-content">
                <div className="post-header">
                    <div className="post-author">
                        <span className="author-name" onClick={handleProfileClick}>
                            {post.author?.displayName || post.author?.username || 'Unknown'}
                        </span>
                        <span className="author-username" onClick={handleProfileClick}>
                            @{post.author?.username || 'unknown'}
                        </span>
                        <span className="post-time">
                            · {formatRelativeTime(post.createdAt)}
                        </span>
                    </div>

                    {/* Options menu (three-dot) for own editable posts */}
                    {canEditOrDelete && (
                        <div className="post-options-wrapper" ref={optionsMenuRef}>
                            <button
                                className="post-options-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowOptionsMenu(!showOptionsMenu);
                                }}
                                aria-label="Post options"
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <circle cx="12" cy="5" r="2" />
                                    <circle cx="12" cy="12" r="2" />
                                    <circle cx="12" cy="19" r="2" />
                                </svg>
                            </button>

                            {showOptionsMenu && (
                                <div className="post-options-menu">
                                    <button
                                        className="post-option-item"
                                        onClick={handleEditClick}
                                    >
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                        </svg>
                                        <span>{t('post.edit', 'Edit')}</span>
                                    </button>
                                    <button
                                        className="post-option-item post-option-delete"
                                        onClick={handleDeleteClick}
                                    >
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                        </svg>
                                        <span>{t('post.delete', 'Delete')}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Delete confirmation dialog */}
                {showDeleteConfirm && (
                    <div className="post-delete-confirm" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-confirm-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </div>
                        <p className="delete-confirm-text">
                            {t('post.deleteConfirm', 'Are you sure you want to delete this post? This will permanently remove the post and all its comments, likes, and media.')}
                        </p>
                        <div className="delete-confirm-actions">
                            <button
                                className="delete-confirm-cancel"
                                onClick={handleCancelDelete}
                                disabled={isDeleting}
                            >
                                {t('post.cancel', 'Cancel')}
                            </button>
                            <button
                                className="delete-confirm-btn"
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? t('post.deleting', 'Deleting...') : t('post.delete', 'Delete')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Editing mode */}
                {isEditing ? (
                    <div className="post-edit-area" onClick={(e) => e.stopPropagation()}>
                        <textarea
                            className="post-edit-textarea"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            maxLength={5000}
                            rows={3}
                            disabled={isSaving}
                            autoFocus
                        />

                        {/* Show existing media with remove option */}
                        {post.media && post.media.length > 0 && (
                            <div className="post-edit-media-list">
                                {post.media.map((media) => {
                                    const isMarkedForRemoval = editMediaToRemove.includes(media.id);
                                    return (
                                        <div
                                            key={media.id}
                                            className={`post-edit-media-item ${isMarkedForRemoval ? 'marked-remove' : ''}`}
                                        >
                                            {media.mediaType === 'IMAGE' || media.mediaType === 'GIF' ? (
                                                <img src={getMediaUrl(media.fileUrl)} alt="Media" />
                                            ) : (
                                                <div className="edit-media-video-thumb">
                                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                            )}
                                            {isMarkedForRemoval ? (
                                                <button
                                                    className="edit-media-undo-btn"
                                                    onClick={(e) => handleUndoRemoveMedia(media.id, e)}
                                                    title={t('post.undoRemove', 'Undo remove')}
                                                >
                                                    ↩
                                                </button>
                                            ) : (
                                                <button
                                                    className="edit-media-remove-btn"
                                                    onClick={(e) => handleRemoveExistingMedia(media.id, e)}
                                                    title={t('post.removeMedia', 'Remove media')}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Show new files to be added */}
                        {editNewFiles.length > 0 && (
                            <div className="post-edit-media-list post-edit-new-media">
                                {editNewFiles.map((file, index) => (
                                    <div key={`new-${index}`} className="post-edit-media-item new-media">
                                        <span className="new-media-name">{file.name}</span>
                                        <button
                                            className="edit-media-remove-btn"
                                            onClick={(e) => handleRemoveNewFile(index, e)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {editError && (
                            <div className="post-edit-error">{editError}</div>
                        )}

                        <div className="post-edit-actions">
                            <div className="post-edit-actions-left">
                                <input
                                    ref={editFileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleEditFileChange}
                                    style={{ display: 'none' }}
                                    multiple
                                />
                                <button
                                    className="post-edit-add-media-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        editFileInputRef.current?.click();
                                    }}
                                    disabled={isSaving}
                                    title={t('post.addMedia', 'Add media')}
                                >
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                        <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z" />
                                    </svg>
                                </button>
                            </div>
                            <div className="post-edit-actions-right">
                                <button
                                    className="post-edit-cancel-btn"
                                    onClick={handleCancelEdit}
                                    disabled={isSaving}
                                >
                                    {t('post.cancel', 'Cancel')}
                                </button>
                                <button
                                    className="post-edit-save-btn"
                                    onClick={handleSaveEdit}
                                    disabled={isSaving}
                                >
                                    {isSaving ? t('post.saving', 'Saving...') : t('post.save', 'Save')}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {post.content && (
                            <div className="post-text">
                                {parseContentSegments(post.content, handleMentionClick, handleHashtagClick).map((segment, index) => {
                                    const stableKey = `${post.id}-seg-${index}-${segment.type}`;
                                    if (segment.type === 'hashtag') {
                                        return (
                                            <span
                                                key={stableKey}
                                                className="hashtag-link"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    segment.onClick(segment.tagName);
                                                }}
                                            >
                                                {segment.content}
                                            </span>
                                        );
                                    }
                                    if (segment.type === 'mention') {
                                        return (
                                            <span
                                                key={stableKey}
                                                className="mention-link"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    segment.onClick(segment.username);
                                                }}
                                            >
                                                {segment.content}
                                            </span>
                                        );
                                    }
                                    return <span key={stableKey}>{segment.content}</span>;
                                })}
                            </div>
                        )}

                        {post.media && post.media.length > 0 && (
                            <div
                                className={`post-media media-grid-${Math.min(post.media.length, 4)}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {post.media.map((media) => {
                                    let aspectRatio = 'auto';
                                    if (media.width && media.height) {
                                        aspectRatio = `${media.width} / ${media.height}`;
                                    } else if (media.aspectRatio) {
                                        aspectRatio = media.aspectRatio;
                                    }

                                    return (
                                        <div
                                            key={media.id || `media-${post.id}-${media.fileUrl}`}
                                            className="media-item"
                                            style={{ aspectRatio }}
                                        >
                                            {media.mediaType === 'IMAGE' || media.mediaType === 'GIF' ? (
                                                <img
                                                    src={getMediaUrl(media.fileUrl)}
                                                    alt="Post media"
                                                    loading="lazy"
                                                    className="media-image"
                                                />
                                            ) : media.mediaType === 'VIDEO' ? (
                                                <VideoPlayer
                                                    src={getMediaUrl(media.fileUrl)}
                                                    thumbnail={media.thumbnailUrl ? getMediaUrl(media.thumbnailUrl) : null}
                                                    className="media-video"
                                                />
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                <div className="post-actions">
                    <button className="action-btn comment-btn" onClick={handleCommentClick}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69c-.407.04-.816.06-1.229.06-4.42 0-8.02-3.58-8.02-8z" />
                        </svg>
                        <span>{formatNumber(commentsCount)}</span>
                    </button>

                    <button
                        className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
                        onClick={handleLike}
                        disabled={isLiking}
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <span>{formatNumber(likesCount)}</span>
                    </button>

                    <button className="action-btn share-btn" onClick={(e) => e.stopPropagation()}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" />
                        </svg>
                    </button>

                    <button className="action-btn views-btn">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                        <span>{formatNumber(viewsCount)}</span>
                    </button>
                </div>
            </div>

            {showComments && (
                <CommentModal
                    post={{ ...post, commentsCount, likesCount }}
                    onClose={() => setShowComments(false)}
                    onCommentAdded={handleCommentAdded}
                />
            )}
        </div>
    );
});

export default PostCard;
