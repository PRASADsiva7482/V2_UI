import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTrendingPosts, getPopularUsers, getPlatformStats } from '../../services/api/discovery';
import { followUser } from '../../services/api/follows';
import { searchPosts } from '../../services/api/posts';
import SearchBox from '../search/SearchBox';
import Avatar from '../common/Avatar';
import './RightSidebar.css';

function RightSidebar() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [trendingPosts, setTrendingPosts] = useState([]);
    const [popularUsers, setPopularUsers] = useState([]);
    const [platformStats, setPlatformStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [followingUsers, setFollowingUsers] = useState(new Set());
    const [followLoading, setFollowLoading] = useState(new Set());

    useEffect(() => {
        loadSidebarContent();
    }, []);

    const loadSidebarContent = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('RightSidebar: Fetching discovery data...');

            // Fetch data from backend discovery API with individual error handling
            const [trending, popular, stats] = await Promise.all([
                getTrendingPosts(5).catch(err => {
                    console.error('Error fetching trending posts:', err);
                    return [];
                }),
                getPopularUsers(5).catch(err => {
                    console.error('Error fetching popular users:', err);
                    return [];
                }),
                getPlatformStats().catch(err => {
                    console.error('Error fetching platform stats:', err);
                    return null;
                })
            ]);

            console.log('RightSidebar: Data received', {
                trending: trending?.length,
                popular: popular?.length,
                stats: stats
            });

            setTrendingPosts(trending || []);
            setPopularUsers(popular || []);
            setPlatformStats(stats);
        } catch (error) {
            console.error('Error loading sidebar content:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const navigateToPost = (postId) => {
        // Navigate to post detail (you can implement this route later)
        navigate(`/post/${postId}`);
    };

    const navigateToProfile = (userId) => {
        navigate(`/profile/${userId}`);
    };

    const handleFollowUser = async (userId, e) => {
        e.stopPropagation();

        if (followLoading.has(userId)) return;

        try {
            setFollowLoading(prev => new Set(prev).add(userId));
            await followUser(userId);
            setFollowingUsers(prev => new Set(prev).add(userId));
        } catch (error) {
            console.error('Error following user:', error);
        } finally {
            setFollowLoading(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        }
    };

    const handleSearch = async (query, filter) => {
        if (!query.trim()) return;

        console.log('🔍 Search initiated:', { query, filter });

        try {
            if (filter === 'users') {
                // Search for users
                const { searchUsers } = await import('../../services/api/profile');
                const results = await searchUsers(query, { page: 0, size: 20 });
                console.log('👥 User search results:', results);
                console.log(`Found ${results.content?.length || 0} users matching "${query}"`);
                // Future: Navigate to search results page or update UI
                // navigate(`/search?q=${encodeURIComponent(query)}&filter=users`);
            } else if (filter === 'posts') {
                // Search for posts
                const results = await searchPosts(query, { page: 0, size: 20 });
                console.log('📝 Post search results:', results);
                console.log(`Found ${results.content?.length || 0} posts matching "${query}"`);
                // Future: Navigate to search results page or update UI
                // navigate(`/search?q=${encodeURIComponent(query)}&filter=posts`);
            } else if (filter === 'all') {
                // Search both users and posts
                const { searchUsers } = await import('../../services/api/profile');
                const [userResults, postResults] = await Promise.all([
                    searchUsers(query, { page: 0, size: 10 }),
                    searchPosts(query, { page: 0, size: 10 })
                ]);
                console.log('🔍 Combined search results:');
                console.log(`  - Users: ${userResults.content?.length || 0}`);
                console.log(`  - Posts: ${postResults.content?.length || 0}`);
                console.log('User results:', userResults);
                console.log('Post results:', postResults);
                // Future: Navigate to search results page with combined results
                // navigate(`/search?q=${encodeURIComponent(query)}&filter=all`);
            }
        } catch (error) {
            console.error('❌ Search error:', error);
        }
    };

    if (loading) {
        return (
            <aside className="right-sidebar">
                <div className="sidebar-loading">{t('common.loading')}</div>
            </aside>
        );
    }

    return (
        <aside className="right-sidebar">
            {/* Search Box */}
            <SearchBox onSearch={handleSearch} />

            {/* Trending Posts Section */}
            <div className="sidebar-section">
                <div className="section-header">
                    <h2>{t('sidebar.hotNews')}</h2>
                </div>
                <div className="trending-posts">
                    {trendingPosts.length === 0 ? (
                        <div className="empty-state">No trending posts yet</div>
                    ) : (
                        trendingPosts.map((post, index) => (
                            <div
                                key={post.id}
                                className="trending-item"
                                onClick={() => navigateToPost(post.id)}
                            >
                                <div className="trending-rank">#{index + 1}</div>
                                <div className="trending-content">
                                    <div className="trending-author" onClick={(e) => {
                                        e.stopPropagation();
                                        navigateToProfile(post.userId);
                                    }}>
                                        {post.author?.userName || 'User'}
                                    </div>
                                    <div className="trending-text">
                                        {post.content.length > 80
                                            ? post.content.substring(0, 80) + '...'
                                            : post.content}
                                    </div>
                                    <div className="trending-stats">
                                        <span>👁️ {post.viewsCount || 0}</span>
                                        <span>❤️ {post.likesCount || 0}</span>
                                        <span>💬 {post.commentsCount || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Popular Users Section */}
            <div className="sidebar-section">
                <div className="section-header">
                    <h2>{t('sidebar.whoToFollow')}</h2>
                </div>
                <div className="popular-users">
                    {popularUsers.length === 0 ? (
                        <div className="empty-state">No users to show</div>
                    ) : (
                        popularUsers.map(user => (
                            <div
                                key={user.userId}
                                className="user-item"
                                onClick={() => navigateToProfile(user.userId)}
                            >
                                <Avatar userId={user.userId} size="medium" />
                                <div className="user-info">
                                    <div className="user-name">{user.displayName || user.userName || 'User'}</div>
                                    <div className="user-handle">@{user.userName || ''}</div>
                                </div>
                                <button
                                    className={`follow-btn ${followingUsers.has(user.userId) ? 'following' : ''}`}
                                    onClick={(e) => handleFollowUser(user.userId, e)}
                                    disabled={followLoading.has(user.userId)}
                                >
                                    {followLoading.has(user.userId)
                                        ? 'Loading...'
                                        : followingUsers.has(user.userId)
                                            ? t('profile.unfollow')
                                            : t('profile.follow')}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Quick Stats Section */}
            <div className="sidebar-section">
                <div className="section-header">
                    <h2>{t('sidebar.platformStats')}</h2>
                </div>
                {platformStats ? (
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-value">{platformStats.totalViews?.toLocaleString() || 0}</div>
                            <div className="stat-label">{t('sidebar.totalViews')}</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{platformStats.totalLikes?.toLocaleString() || 0}</div>
                            <div className="stat-label">{t('sidebar.totalLikes')}</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{platformStats.totalPosts?.toLocaleString() || 0}</div>
                            <div className="stat-label">{t('sidebar.totalPosts')}</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{platformStats.totalUsers?.toLocaleString() || 0}</div>
                            <div className="stat-label">{t('sidebar.totalUsers')}</div>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">{t('sidebar.loadingStats')}</div>
                )}
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
                <a href="#">Terms</a>
                <a href="#">Privacy</a>
                <a href="#">Help</a>
                <div className="copyright">© 2025 V2 Social</div>
            </div>
        </aside>
    );
}

export default RightSidebar;
