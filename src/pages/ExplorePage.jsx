import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExploreContent } from '../services/api/explore';
import { useAuth } from '../auth/AuthProvider';
import Loading from '../components/common/Loading';
import PostCard from '../components/posts/PostCard';
import './ExplorePage.css';

const CATEGORIES = [
    { id: 'FOR_YOU', label: 'For You', icon: '✨' },
    { id: 'TRENDING', label: 'Trending', icon: '🔥' },
    { id: 'NEWS', label: 'News', icon: '📰' },
    { id: 'SPORTS', label: 'Sports', icon: '⚽' },
    { id: 'ENTERTAINMENT', label: 'Entertainment', icon: '🎬' }
];

function ExplorePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeCategory, setActiveCategory] = useState('FOR_YOU');
    const [exploreData, setExploreData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadExploreContent();
    }, [activeCategory]);

    const loadExploreContent = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getExploreContent(activeCategory, 20);
            setExploreData(data);
        } catch (err) {
            console.error('Error loading explore content:', err);
            setError('Failed to load explore content. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
    };

    const handleTopicClick = (topic) => {
        if (topic.hashtagName) {
            navigate(`/hashtag/${topic.hashtagName}`);
        }
    };

    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`);
    };

    if (loading && !exploreData) {
        return (
            <div className="explore-page">
                <Loading />
            </div>
        );
    }

    return (
        <div className="explore-page">
            {/* Header with category tabs */}
            <div className="explore-header">
                <h1 className="explore-title">Explore</h1>
                <div className="explore-tabs">
                    {CATEGORIES.map(category => (
                        <button
                            key={category.id}
                            className={`explore-tab ${activeCategory === category.id ? 'active' : ''}`}
                            onClick={() => handleCategoryChange(category.id)}
                        >
                            <span className="tab-icon">{category.icon}</span>
                            <span className="tab-label">{category.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content area */}
            <div className="explore-content">
                {loading ? (
                    <Loading />
                ) : error ? (
                    <div className="explore-error">
                        <p>{error}</p>
                        <button onClick={loadExploreContent} className="retry-btn">
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Trending Topics Section */}
                        {exploreData?.trendingTopics && exploreData.trendingTopics.length > 0 && (
                            <section className="explore-section">
                                <h2 className="section-title">Trending Topics</h2>
                                <div className="trending-topics-grid">
                                    {exploreData.trendingTopics.map((topic, index) => (
                                        <div
                                            key={topic.id}
                                            className="trending-topic-card"
                                            onClick={() => handleTopicClick(topic)}
                                        >
                                            <div className="topic-rank">#{index + 1}</div>
                                            <div className="topic-content">
                                                <div className="topic-category">{topic.category}</div>
                                                <div className="topic-title">{topic.title}</div>
                                                <div className="topic-stats">
                                                    {topic.postCount?.toLocaleString()} posts
                                                </div>
                                            </div>
                                            {topic.imageUrl && (
                                                <div className="topic-image">
                                                    <img src={topic.imageUrl} alt={topic.title} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Trending Hashtags Section */}
                        {exploreData?.trendingHashtags && exploreData.trendingHashtags.length > 0 && (
                            <section className="explore-section">
                                <h2 className="section-title">Trending Hashtags</h2>
                                <div className="trending-hashtags-list">
                                    {exploreData.trendingHashtags.map((hashtag) => (
                                        <div
                                            key={hashtag.id}
                                            className="hashtag-item"
                                            onClick={() => navigate(`/hashtag/${hashtag.tagName}`)}
                                        >
                                            <div className="hashtag-name">#{hashtag.tagName}</div>
                                            <div className="hashtag-count">
                                                {hashtag.usageCount?.toLocaleString()} posts
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Trending Posts Section */}
                        {exploreData?.trendingPosts && exploreData.trendingPosts.length > 0 && (
                            <section className="explore-section">
                                <h2 className="section-title">Trending Posts</h2>
                                <div className="trending-posts-list">
                                    {exploreData.trendingPosts.map((post) => (
                                        <PostCard key={post.id} post={post} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Suggested Users Section (only for FOR_YOU) */}
                        {activeCategory === 'FOR_YOU' &&
                            exploreData?.suggestedUsers &&
                            exploreData.suggestedUsers.length > 0 && (
                                <section className="explore-section">
                                    <h2 className="section-title">Who to Follow</h2>
                                    <div className="suggested-users-list">
                                        {exploreData.suggestedUsers.map((user) => (
                                            <div key={user.userId} className="user-suggestion-card">
                                                <div
                                                    className="user-avatar"
                                                    onClick={() => handleUserClick(user.userId)}
                                                >
                                                    {user.profilePictureUrl ? (
                                                        <img
                                                            src={user.profilePictureUrl}
                                                            alt={user.displayName}
                                                        />
                                                    ) : (
                                                        <div className="avatar-placeholder">
                                                            {user.displayName?.charAt(0) || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="user-info">
                                                    <div
                                                        className="user-name"
                                                        onClick={() => handleUserClick(user.userId)}
                                                    >
                                                        {user.displayName}
                                                    </div>
                                                    <div className="user-username">@{user.userName}</div>
                                                    {user.bio && (
                                                        <div className="user-bio">{user.bio}</div>
                                                    )}
                                                    <div className="user-stats">
                                                        <span>{user.followersCount} followers</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                        {/* Empty state */}
                        {!exploreData?.trendingTopics?.length &&
                            !exploreData?.trendingHashtags?.length &&
                            !exploreData?.trendingPosts?.length && (
                                <div className="explore-empty">
                                    <div className="empty-icon">🔍</div>
                                    <h3>No trending content yet</h3>
                                    <p>Check back later for exciting discoveries!</p>
                                </div>
                            )}
                    </>
                )}
            </div>
        </div>
    );
}

export default ExplorePage;
