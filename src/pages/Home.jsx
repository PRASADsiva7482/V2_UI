import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getTimelineFeed } from '../services/api/posts';
import { getForYouFeed } from '../services/api/discovery';
import { useDataCache } from '../context/DataCacheContext';
import PostCard from '../components/posts/PostCard';
import Loading from '../components/common/Loading';
import './Home.css';

function Home() {
    const { t } = useTranslation();
    const { cache, updateHomeCache, updateHomeActiveTab, isCacheValid } = useDataCache();

    // Initialize state from cache if available, otherwise default
    const [activeTab, setActiveTab] = useState(cache.home?.activeTab || 'forYou');

    const [forYouPosts, setForYouPosts] = useState(cache.home?.forYou?.data || []);
    const [followingPosts, setFollowingPosts] = useState(cache.home?.following?.data || []);

    const [loading, setLoading] = useState(!cache.home?.[activeTab]);

    // Page state
    const getInitialPage = (tab) => cache.home?.[tab]?.page || 0;
    const [page, setPage] = useState(getInitialPage(activeTab));

    const [hasMore, setHasMore] = useState(true);

    // Listen for new posts created from the navbar modal
    useEffect(() => {
        const handleNewPost = (event) => {
            const newPost = event.detail;
            if (newPost) {
                handlePostCreated(newPost);
            }
        };

        window.addEventListener('newPostCreated', handleNewPost);
        return () => window.removeEventListener('newPostCreated', handleNewPost);
    }, [forYouPosts, followingPosts, cache.home]);

    // Check if we need to load data on mount or tab change
    useEffect(() => {
        const cachedData = cache.home?.[activeTab];

        // If we have valid cached data, use it and don't fetch
        if (cachedData && isCacheValid(cachedData.timestamp)) {
            if (activeTab === 'forYou') {
                setForYouPosts(cachedData.data);
            } else {
                setFollowingPosts(cachedData.data);
            }
            setPage(cachedData.page);
            setHasMore(cachedData.hasMore);
            setLoading(false);
        } else {
            // No valid cache, fetch fresh data
            setPage(0); // Reset page for fresh fetch
            if (activeTab === 'forYou') {
                loadForYouFeed(0);
            } else {
                loadFollowingFeed(0);
            }
        }
    }, [activeTab]);

    // Load For You feed (trending/discovery posts)
    const loadForYouFeed = async (pageNum = 0) => {
        try {
            setLoading(true);
            const response = await getForYouFeed({ page: pageNum, size: 20 });

            let fetchedPosts = [];
            let isMore = false;

            // ForYouFeed returns a structured metadata response object
            if (response && response.data) {
                fetchedPosts = response.data.posts || [];
                isMore = response.data.pagination?.hasNext || false;
            } else if (Array.isArray(response)) {
                // Fallback in case of raw array return
                fetchedPosts = response;
                isMore = fetchedPosts.length === 20;
            }

            let newPosts;
            if (pageNum === 0) {
                newPosts = fetchedPosts;
            } else {
                newPosts = [...forYouPosts, ...fetchedPosts];
            }

            setForYouPosts(newPosts);
            setHasMore(isMore);

            // Update cache
            updateHomeCache('forYou', {
                data: newPosts,
                page: pageNum,
                hasMore: isMore
            });

        } catch (error) {
            console.error('Error loading For You feed:', error);
            if (pageNum === 0) setForYouPosts([]);
        } finally {
            setLoading(false);
        }
    };

    // Load Following feed (timeline from followed users)
    const loadFollowingFeed = async (pageNum = 0) => {
        try {
            setLoading(true);
            const response = await getTimelineFeed({ page: pageNum, size: 20 });

            let newPosts;
            if (pageNum === 0) {
                newPosts = response.content || [];
            } else {
                newPosts = [...followingPosts, ...(response.content || [])];
            }

            setFollowingPosts(newPosts);
            const isMore = !response.last;
            setHasMore(isMore);

            // Update cache
            updateHomeCache('following', {
                data: newPosts,
                page: pageNum,
                hasMore: isMore
            });

        } catch (error) {
            console.error('Error loading Following feed:', error);
            if (pageNum === 0) setFollowingPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePostCreated = (newPost) => {
        // Add to both feeds local state
        const updatedForYou = [newPost, ...forYouPosts];
        const updatedFollowing = [newPost, ...followingPosts];

        setForYouPosts(updatedForYou);
        setFollowingPosts(updatedFollowing);

        // Update cache as well so it doesn't disappear on nav change
        if (cache.home?.forYou) {
            updateHomeCache('forYou', { ...cache.home.forYou, data: updatedForYou });
        }
        if (cache.home?.following) {
            updateHomeCache('following', { ...cache.home.following, data: updatedFollowing });
        }
    };

    const handlePostUpdate = useCallback((postId, updates) => {
        setForYouPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updates } : p));
        setFollowingPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updates } : p));
    }, []);

    const handlePostDeleted = useCallback((postId) => {
        const updatedForYou = forYouPosts.filter(p => p.id !== postId);
        const updatedFollowing = followingPosts.filter(p => p.id !== postId);

        setForYouPosts(updatedForYou);
        setFollowingPosts(updatedFollowing);

        // Update cache
        if (cache.home?.forYou) {
            updateHomeCache('forYou', { ...cache.home.forYou, data: updatedForYou });
        }
        if (cache.home?.following) {
            updateHomeCache('following', { ...cache.home.following, data: updatedFollowing });
        }
    }, [forYouPosts, followingPosts, cache.home, updateHomeCache]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        if (activeTab === 'forYou') {
            loadForYouFeed(nextPage);
        } else {
            loadFollowingFeed(nextPage);
        }
    };

    const handleTabChange = (tab) => {
        if (tab !== activeTab) {
            setActiveTab(tab);
            updateHomeActiveTab(tab); // Persist active tab choice
        }
    };

    const currentPosts = activeTab === 'forYou' ? forYouPosts : followingPosts;
    const emptyMessage = activeTab === 'forYou'
        ? t('home.emptyForYou')
        : t('home.emptyFeed');

    return (
        <div className="home-page">
            {/* Tabs Header */}
            <div className="home-tabs">
                <button
                    className={`tab-btn ${activeTab === 'forYou' ? 'active' : ''}`}
                    onClick={() => handleTabChange('forYou')}
                >
                    {t('home.tabs.forYou')}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'following' ? 'active' : ''}`}
                    onClick={() => handleTabChange('following')}
                >
                    {t('home.tabs.following')}
                </button>
            </div>

            <div className="posts-feed">
                {loading && page === 0 && currentPosts.length === 0 ? (
                    <Loading />
                ) : currentPosts.length === 0 ? (
                    <div className="empty-feed">
                        <p>{emptyMessage}</p>
                    </div>
                ) : (
                    <>
                        {currentPosts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onPostUpdate={handlePostUpdate}
                                onPostDeleted={handlePostDeleted}
                            />
                        ))}

                        {hasMore && (
                            <button
                                className="load-more-btn"
                                onClick={handleLoadMore}
                                disabled={loading}
                            >
                                {loading ? t('home.loading') : t('home.loadMore')}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Home;
