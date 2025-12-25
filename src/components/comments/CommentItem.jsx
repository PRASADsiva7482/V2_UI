import { useState } from 'react';
import { likeComment, unlikeComment, deleteComment } from '../../services/api/comments';
import { formatRelativeTime, formatNumber } from '../../services/utils/formatters';
import Avatar from '../common/Avatar';
import './CommentItem.css';

function CommentItem({ comment, onUpdate, onDelete }) {
    const [isLiked, setIsLiked] = useState(comment.isLiked || false);
    const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
    const [isLiking, setIsLiking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleLike = async (e) => {
        e.stopPropagation();
        if (isLiking) return;

        try {
            setIsLiking(true);
            if (isLiked) {
                await unlikeComment(comment.id);
                setIsLiked(false);
                setLikesCount(prev => Math.max(0, prev - 1));
            } else {
                await likeComment(comment.id);
                setIsLiked(true);
                setLikesCount(prev => prev + 1);
            }
            if (onUpdate) {
                onUpdate(comment.id, { isLiked: !isLiked, likesCount });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setIsLiking(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            setIsDeleting(true);
            await deleteComment(comment.id);
            if (onDelete) {
                onDelete(comment.id);
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Failed to delete comment. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="comment-item">
            <div className="comment-avatar">
                <Avatar
                    src={comment.author?.profilePictureUrl}
                    alt={comment.author?.displayName}
                    size="small"
                />
            </div>
            <div className="comment-content">
                <div className="comment-header">
                    <div className="comment-author">
                        <span className="author-name">{comment.author?.displayName || 'Unknown User'}</span>
                        <span className="author-username">@{comment.author?.username || 'unknown'}</span>
                        <span className="comment-time">· {formatRelativeTime(comment.createdAt)}</span>
                    </div>
                    <div className="comment-actions">
                        <button
                            className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
                            onClick={handleLike}
                            disabled={isLiking}
                            aria-label="Like comment"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                width="14"
                                height="14"
                                fill={isLiked ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            {likesCount > 0 && <span>{formatNumber(likesCount)}</span>}
                        </button>
                        {comment.isOwnComment && (
                            <button
                                className="delete-btn"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                aria-label="Delete comment"
                            >
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                <p className="comment-text">{comment.content}</p>
            </div>
        </div>
    );
}

export default CommentItem;
