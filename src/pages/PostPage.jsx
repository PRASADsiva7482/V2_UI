import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById } from '../services/api/posts';
import PostCard from '../components/posts/PostCard';
import './PostPage.css';

function PostPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const data = await getPostById(postId);
                setPost(data);
            } catch (err) {
                console.error('Error fetching post:', err);
                setError('Failed to load post. It may have been deleted.');
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId]);

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="post-page">
                <div className="post-page-loading">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="post-page">
                <div className="post-page-header">
                    <button className="back-btn" onClick={handleBack}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                        </svg>
                    </button>
                    <h2>Post</h2>
                </div>
                <div className="post-page-error">
                    <h3>{error || 'Post not found'}</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="post-page">
            <div className="post-page-header">
                <button className="back-btn" onClick={handleBack}>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </button>
                <h2>Post</h2>
            </div>
            <div className="post-page-content">
                <PostCard post={post} />
            </div>
        </div>
    );
}

export default PostPage;
