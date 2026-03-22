import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getBookmarkedPosts } from '../services/api/bookmarks';
import PostCard from '../components/posts/PostCard';
import Loading from '../components/common/Loading';
import './Bookmarks.css';

function Bookmarks() {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadBookmarks(0);
    }, []);

    const loadBookmarks = async (pageNum) => {
        try {
            setLoading(true);
            const response = await getBookmarkedPosts({ page: pageNum, size: 20 });

            let fetchedPosts = [];
            let isMore = false;

            if (response && response.content) {
                fetchedPosts = response.content.filter(p => p !== null);
                isMore = !response.last;
            }

            let newPosts;
            if (pageNum === 0) {
                newPosts = fetchedPosts;
            } else {
                newPosts = [...posts, ...fetchedPosts];
            }

            setPosts(newPosts);
            setHasMore(isMore);
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            if (pageNum === 0) setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadBookmarks(nextPage);
    };

    const handlePostUpdate = useCallback((postId, updates) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updates } : p));
    }, []);

    const handlePostDeleted = useCallback((postId) => {
        setPosts(prev => prev.filter(p => p.id !== postId));
    }, []);

    return (
        <div className="bookmarks-page">
            <div className="bookmarks-header">
                <h1>{t('bookmarks.title', 'Bookmarks')}</h1>
                <p className="bookmarks-subtitle">
                    {t('bookmarks.subtitle', 'Posts you\'ve saved for later')}
                </p>
            </div>

            <div className="bookmarks-feed">
                {loading && page === 0 && posts.length === 0 ? (
                    <Loading />
                ) : posts.length === 0 ? (
                    <div className="bookmarks-empty">
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--text-secondary)">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                        <h2>{t('bookmarks.emptyTitle', 'No bookmarks yet')}</h2>
                        <p>{t('bookmarks.emptyMessage', 'Save posts to read them later. Bookmark a post by tapping the bookmark icon.')}</p>
                    </div>
                ) : (
                    <>
                        {posts.map(post => (
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

export default Bookmarks;
