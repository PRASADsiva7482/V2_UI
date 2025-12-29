import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { likePost, unlikePost, incrementViewCount } from '../../services/api/posts';
import { formatRelativeTime, formatNumber } from '../../services/utils/formatters';
import { parseHashtagsInText } from '../../services/utils/hashtagUtils';
import Avatar from '../common/Avatar';
import CommentModal from '../comments/CommentModal';
import VideoPlayer from '../media/VideoPlayer';
import './PostCard.css';

function PostCard({ post, onPostUpdate }) {
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(post.isLiked || false);
    const [likesCount, setLikesCount] = useState(post.likesCount || 0);
    const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
    const [viewsCount, setViewsCount] = useState(post.viewsCount || 0);
    const [isLiking, setIsLiking] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const handleLike = async (e) => {
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
    };

    const handlePostClick = async () => {
        // Increment view count
        try {
            await incrementViewCount(post.id);
            setViewsCount(prev => prev + 1);
        } catch (error) {
            console.error('Error incrementing view count:', error);
        }

        // Open comments modal
        setShowComments(true);
    };

    const handleCommentClick = (e) => {
        e.stopPropagation();
        setShowComments(true);
    };

    const handleCommentAdded = () => {
        setCommentsCount(prev => prev + 1);
        if (onPostUpdate) {
            onPostUpdate(post.id, { commentsCount: commentsCount + 1 });
        }
    };

    const handleProfileClick = (e) => {
        e.stopPropagation();
        if (post.userId) {
            navigate(`/profile/${post.userId}`);
        }
    };

    const handleHashtagClick = (tagName) => {
        navigate(`/hashtag/${tagName}`);
    };

    // Helper to build full media URL
    const getMediaUrl = (fileUrl) => {
        if (!fileUrl) return '';
        // If already a full URL, return as-is
        if (fileUrl.startsWith('http')) return fileUrl;
        // Remove leading slash to avoid double /v-app
        const cleanPath = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
        // Prepend backend base URL
        const baseUrl = 'http://localhost:2000';
        return `${baseUrl}/${cleanPath}`;
    };

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
                            {post.author?.displayName && !post.author.displayName.startsWith('User ')
                                ? post.author.displayName
                                : post.author?.username || 'Unknown'}
                        </span>
                        <span className="author-username" onClick={handleProfileClick}>
                            @{post.author?.username || 'unknown'}
                        </span>
                        <span className="post-time">
                            · {formatRelativeTime(post.createdAt)}
                        </span>
                    </div>
                </div>

                {post.content && (
                    <div className="post-text">
                        {parseHashtagsInText(post.content, handleHashtagClick).map((segment, index) => {
                            if (segment.type === 'hashtag') {
                                return (
                                    <span
                                        key={index}
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
                            return <span key={index}>{segment.content}</span>;
                        })}
                    </div>
                )}

                {post.media && post.media.length > 0 && (
                    <div
                        className={`post-media media-grid-${Math.min(post.media.length, 4)}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {post.media.map((media, index) => {
                            // Calculate aspect ratio from media dimensions if available
                            let aspectRatio = 'auto';
                            if (media.width && media.height) {
                                aspectRatio = `${media.width} / ${media.height}`;
                            } else if (media.aspectRatio) {
                                aspectRatio = media.aspectRatio;
                            }

                            return (
                                <div
                                    key={media.id || index}
                                    className="media-item"
                                    style={{
                                        aspectRatio: aspectRatio
                                    }}
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
}

export default PostCard;
