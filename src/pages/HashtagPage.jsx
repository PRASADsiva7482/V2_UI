import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostsByHashtag, getHashtagByName } from '../services/api/hashtags';
import PostCard from '../components/posts/PostCard';
import { formatNumber } from '../services/utils/formatters';
import './HashtagPage.css';

function HashtagPage() {
    const { tagName } = useParams();
    const navigate = useNavigate();
    const [hashtag, setHashtag] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        loadHashtagData();
    }, [tagName]);

    const loadHashtagData = async () => {
        try {
            setLoading(true);
            setError(null);
            setPage(0);
            setPosts([]);

            // Load hashtag details
            const hashtagData = await getHashtagByName(tagName);
            setHashtag(hashtagData);

            // Load posts
            const postsResponse = await getPostsByHashtag(tagName, { page: 0, size: 20 });
            setPosts(postsResponse.content || []);
            setHasMore(!postsResponse.last);
        } catch (err) {
            console.error('Error loading hashtag data:', err);
            setError(err.response?.data?.message || 'Hashtag not found');
        } finally {
            setLoading(false);
        }
    };

    const loadMore = async () => {
        if (loadingMore || !hasMore) return;

        try {
            setLoadingMore(true);
            const nextPage = page + 1;
            const response = await getPostsByHashtag(tagName, { page: nextPage, size: 20 });

            setPosts(prev => [...prev, ...(response.content || [])]);
            setPage(nextPage);
            setHasMore(!response.last);
        } catch (err) {
            console.error('Error loading more posts:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="hashtag-page">
                <div className="hashtag-page-loading">
                    <div className="spinner"></div>
                    <p>Loading hashtag...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="hashtag-page">
                <div className="hashtag-page-error">
                    <h2>Hashtag Not Found</h2>
                    <p>{error}</p>
                    <button onClick={handleBack} className="back-btn">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="hashtag-page">
            {/* Header */}
            <div className="hashtag-page-header">
                <button onClick={handleBack} className="back-button">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
                    </svg>
                </button>
                <div className="hashtag-info">
                    <h1 className="hashtag-title">#{hashtag?.tagName}</h1>
                    <p className="hashtag-stats">
                        {formatNumber(hashtag?.usageCount || 0)} posts
                    </p>
                </div>
            </div>

            {/* Posts */}
            <div className="hashtag-posts">
                {posts.length === 0 ? (
                    <div className="no-posts">
                        <p>No posts found with this hashtag yet.</p>
                    </div>
                ) : (
                    <>
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}

                        {hasMore && (
                            <div className="load-more-container">
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="load-more-btn"
                                >
                                    {loadingMore ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default HashtagPage;
