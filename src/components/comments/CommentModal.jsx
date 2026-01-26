import { useState, useEffect } from 'react';
import { getPostComments, addComment } from '../../services/api/comments';
import { formatRelativeTime, formatNumber } from '../../services/utils/formatters';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import CommentItem from './CommentItem';
import CommentSkeleton from './CommentSkeleton';
import './CommentModal.css';

function CommentModal({ post, onClose, onCommentAdded }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadComments();
    }, [post.id]);

    const loadComments = async () => {
        try {
            setLoading(true);
            const response = await getPostComments(post.id, { page, size: 20 });
            setComments(prev => page === 0 ? response.content : [...prev, ...response.content]);
            setHasMore(!response.last);
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || posting) return;

        try {
            setPosting(true);
            const comment = await addComment(post.id, newComment);
            setComments(prev => [comment, ...prev]);
            setNewComment('');
            if (onCommentAdded) {
                onCommentAdded();
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Failed to post comment. Please try again.');
        } finally {
            setPosting(false);
        }
    };

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
        loadComments();
    };

    const handleCommentUpdate = (commentId, updates) => {
        setComments(prev =>
            prev.map(comment =>
                comment.id === commentId ? { ...comment, ...updates } : comment
            )
        );
    };

    const handleCommentDelete = (commentId) => {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
    };

    const handleCloseClick = (e) => {
        e.stopPropagation();
        onClose();
    };

    const handleOverlayClick = (e) => {
        e.stopPropagation(); // Prevent clicks from bubbling to PostCard
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content comment-modal">
                <div className="modal-header">
                    <h2>Comments</h2>
                    <button className="close-btn" onClick={handleCloseClick} aria-label="Close">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                </div>

                {/* Original Post */}
                <div className="original-post">
                    <div className="post-author-info">
                        <Avatar
                            src={post.author?.profilePictureUrl}
                            alt={post.author?.displayName}
                            size="medium"
                        />
                        <div className="author-details">
                            <span className="author-name">{post.author?.displayName || 'Unknown User'}</span>
                            <span className="author-username">@{post.author?.username || 'unknown'}</span>
                            <span className="post-time">· {formatRelativeTime(post.createdAt)}</span>
                        </div>
                    </div>
                    <p className="post-text">{post.content}</p>
                    <div className="post-stats">
                        <span>{formatNumber(post.commentsCount || 0)} Comments</span>
                        <span>{formatNumber(post.likesCount || 0)} Likes</span>
                    </div>
                </div>

                {/* Comments List */}
                <div className="comments-list">
                    {loading && page === 0 ? (
                        <div className="comments-loading">
                            {[1, 2, 3].map((n) => (
                                <CommentSkeleton key={n} />
                            ))}
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="no-comments">
                            <p>No comments yet. Be the first to comment!</p>
                        </div>
                    ) : (
                        <>
                            {comments.map(comment => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    onUpdate={handleCommentUpdate}
                                    onDelete={handleCommentDelete}
                                />
                            ))}
                            {hasMore && (
                                <button
                                    className="load-more-btn"
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                >
                                    {loading ? 'Loading...' : 'Load more comments'}
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Add Comment Form */}
                <form className="add-comment-form" onSubmit={handleSubmit}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        maxLength="500"
                    />
                    <Button
                        type="submit"
                        disabled={!newComment.trim() || posting}
                        loading={posting}
                    >
                        Post
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default CommentModal;
