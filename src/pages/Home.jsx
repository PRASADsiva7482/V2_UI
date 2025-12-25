import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTimelineFeed } from '../services/api/posts';
import { getTrendingPosts } from '../services/api/discovery';
import PostCard from '../components/posts/PostCard';
import CreatePost from '../components/posts/CreatePost';
import Loading from '../components/common/Loading';
import './Home.css';

function Home() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('forYou'); // 'forYou' or 'following'
    const [forYouPosts, setForYouPosts] = useState([]);
    const [followingPosts, setFollowingPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Load For You feed (trending/discovery posts)
    const loadForYouFeed = async (pageNum = 0) => {
        try {
            setLoading(true);
            const response = await getTrendingPosts({ page: pageNum, size: 20 });

            if (pageNum === 0) {
                setForYouPosts(response.content || []);
            } else {
                setForYouPosts(prev => [...prev, ...(response.content || [])]);
            }

            setHasMore(!response.last);
        } catch (error) {
            console.error('Error loading For You feed:', error);
            setForYouPosts([]);
        } finally {
            setLoading(false);
        }
    };

    // Load Following feed (timeline from followed users)
    const loadFollowingFeed = async (pageNum = 0) => {
        try {
            setLoading(true);
            const response = await getTimelineFeed({ page: pageNum, size: 20 });

            if (pageNum === 0) {
                setFollowingPosts(response.content || []);
            } else {
                setFollowingPosts(prev => [...prev, ...(response.content || [])]);
            }

            setHasMore(!response.last);
        } catch (error) {
            console.error('Error loading Following feed:', error);
            setFollowingPosts([]);
        } finally {
            setLoading(false);
        }
    };

    // Load feed based on active tab
    useEffect(() => {
        setPage(0);
        if (activeTab === 'forYou') {
            loadForYouFeed(0);
        } else {
            loadFollowingFeed(0);
        }
    }, [activeTab]);

    const handlePostCreated = (newPost) => {
        // Add to both feeds
        setForYouPosts(prev => [newPost, ...prev]);
        setFollowingPosts(prev => [newPost, ...prev]);
    };

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

            <CreatePost onPostCreated={handlePostCreated} />

            <div className="posts-feed">
                {loading && page === 0 ? (
                    <Loading />
                ) : currentPosts.length === 0 ? (
                    <div className="empty-feed">
                        <p>{emptyMessage}</p>
                    </div>
                ) : (
                    <>
                        {currentPosts.map(post => (
                            <PostCard key={post.id} post={post} />
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
