import './CommentSkeleton.css';

function CommentSkeleton() {
    return (
        <div className="comment-skeleton">
            <div className="comment-skeleton-avatar skeleton-shimmer"></div>
            <div className="comment-skeleton-content">
                <div className="comment-skeleton-header skeleton-shimmer"></div>
                <div className="comment-skeleton-text skeleton-shimmer"></div>
                <div className="comment-skeleton-text short skeleton-shimmer"></div>
            </div>
        </div>
    );
}

export default CommentSkeleton;
