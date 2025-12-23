import { useState, useEffect } from 'react';
import { getTimelineFeed } from '../services/api/posts';
import PostCard from '../components/posts/PostCard';
import CreatePost from '../components/posts/CreatePost';
import Loading from '../components/common/Loading';
import './Home.css';

function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const loadFeed = async (pageNum = 0) => {
        try {
            setLoading(true);
            const response = await getTimelineFeed({ page: pageNum, size: 20 });

            if (pageNum === 0) {
                setPosts(response.content || []);
            } else {
                setPosts(prev => [...prev, ...(response.content || [])]);
            }

            setHasMore(!response.last);
        } catch (error) {
            console.error('Error loading feed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFeed(0);
    }, []);

    const handlePostCreated = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadFeed(nextPage);
    };

    return (
        <div className="home-page">
            <div className="home-header">
                <h1>Home</h1>
            </div>

            <CreatePost onPostCreated={handlePostCreated} />

            <div className="posts-feed">
                {loading && page === 0 ? (
                    <Loading />
                ) : posts.length === 0 ? (
                    <div className="empty-feed">
                        <p>No posts yet. Follow some users to see their posts!</p>
                    </div>
                ) : (
                    <>
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}

                        {hasMore && (
                            <button
                                className="load-more-btn"
                                onClick={handleLoadMore}
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'Load More'}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Home;
