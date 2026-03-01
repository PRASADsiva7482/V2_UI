import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    getExploreForYou,
    getTrendingTopics,
    getExploreNews,
    searchExploreTopics,
    getTrendingPostsByCategory
} from '../services/api/explore';
import { getTrendingHashtags } from '../services/api/hashtags';
import PostCard from '../components/posts/PostCard';
import './Explore.css';

const TABS = [
    { key: 'foryou', label: 'For You', icon: '✨' },
    { key: 'trending', label: 'Trending', icon: '🔥' },
    { key: 'news', label: 'News', icon: '📰' },
    { key: 'sports', label: 'Sports', icon: '⚽' },
    { key: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { key: 'technology', label: 'Technology', icon: '💻' },
];

function Explore() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('foryou');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    // For You data
    const [forYouData, setForYouData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Category data
    const [categoryTopics, setCategoryTopics] = useState([]);
    const [categoryNews, setCategoryNews] = useState([]);
    const [categoryPosts, setCategoryPosts] = useState([]);
    const [categoryLoading, setCategoryLoading] = useState(false);

    useEffect(() => {
        loadForYouData();
    }, []);

    useEffect(() => {
        if (activeTab !== 'foryou') {
            loadCategoryData(activeTab);
        }
    }, [activeTab]);

    // Debounced search
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const results = await searchExploreTopics(searchQuery, 10);
                setSearchResults(results || []);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadForYouData = async () => {
        try {
            setLoading(true);
            const data = await getExploreForYou({ topicLimit: 20, newsLimit: 10 });
            setForYouData(data);
        } catch (error) {
            console.error('Error loading explore data:', error);
            // Fallback: load data from individual endpoints
            try {
                const [hashtags] = await Promise.all([
                    getTrendingHashtags({ page: 0, size: 10 }).catch(() => ({ content: [] })),
                ]);
                setForYouData({
                    categories: [],
                    trendingTopics: [],
                    news: [],
                    trendingHashtags: hashtags?.content || [],
                    trendingPosts: []
                });
            } catch (fallbackErr) {
                console.error('Fallback also failed:', fallbackErr);
                setForYouData({
                    categories: [],
                    trendingTopics: [],
                    news: [],
                    trendingHashtags: [],
                    trendingPosts: []
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const loadCategoryData = async (categoryKey) => {
        setCategoryLoading(true);
        try {
            const [topics, news, posts] = await Promise.all([
                getTrendingTopics({ category: categoryKey, limit: 20 }).catch(() => []),
                getExploreNews({ category: categoryKey, limit: 10 }).catch(() => []),
                getTrendingPostsByCategory({ category: categoryKey, limit: 10 }).catch(() => []),
            ]);
            setCategoryTopics(topics || []);
            setCategoryNews(news || []);
            setCategoryPosts(posts || []);
        } catch (error) {
            console.error('Error loading category data:', error);
            setCategoryTopics([]);
            setCategoryNews([]);
            setCategoryPosts([]);
        } finally {
            setCategoryLoading(false);
        }
    };

    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleTopicClick = (topic) => {
        if (topic.isHashtag && topic.hashtagName) {
            navigate(`/hashtag/${topic.hashtagName}`);
        }
    };

    const handleHashtagClick = (tagName) => {
        navigate(`/hashtag/${tagName}`);
    };

    const formatPostCount = (count) => {
        if (!count) return '0 posts';
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M posts`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K posts`;
        return `${count} posts`;
    };

    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHrs < 1) return 'Just now';
        if (diffHrs < 24) return `${diffHrs}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const renderSearchBar = () => (
        <div className={`explore-search-container ${searchFocused ? 'focused' : ''}`}>
            <div className="explore-search-wrapper">
                <svg className="explore-search-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z" />
                </svg>
                <input
                    type="text"
                    className="explore-search-input"
                    placeholder={t('search.placeholder', 'Search Explore')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    autoComplete="off"
                    id="explore-search-input"
                />
                {searchQuery && (
                    <button
                        className="explore-search-clear"
                        onClick={() => {
                            setSearchQuery('');
                            setSearchResults([]);
                        }}
                        aria-label="Clear search"
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Search Results Dropdown */}
            {searchFocused && searchQuery.trim().length >= 2 && (
                <div className="explore-search-results">
                    {searching ? (
                        <div className="explore-search-loading">
                            <div className="explore-spinner"></div>
                            <span>Searching...</span>
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="explore-search-empty">
                            No results found for "{searchQuery}"
                        </div>
                    ) : (
                        searchResults.map((topic, index) => (
                            <div
                                key={topic.id || index}
                                className="explore-search-result-item"
                                onClick={() => handleTopicClick(topic)}
                            >
                                <div className="search-result-icon">
                                    {topic.isHashtag ? '#' : '🔍'}
                                </div>
                                <div className="search-result-content">
                                    <div className="search-result-title">{topic.title}</div>
                                    <div className="search-result-meta">
                                        {topic.categoryDisplayName && (
                                            <span>{topic.categoryIcon} {topic.categoryDisplayName}</span>
                                        )}
                                        {topic.postCount > 0 && (
                                            <span> · {formatPostCount(topic.postCount)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );

    const renderTabs = () => (
        <div className="explore-tabs">
            {TABS.map(tab => (
                <button
                    key={tab.key}
                    className={`explore-tab ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => handleTabChange(tab.key)}
                    id={`explore-tab-${tab.key}`}
                >
                    <span className="explore-tab-label">{tab.label}</span>
                    {activeTab === tab.key && <div className="explore-tab-indicator" />}
                </button>
            ))}
        </div>
    );

    const renderTrendingTopic = (topic, index) => (
        <div
            key={topic.id || index}
            className="explore-trending-item"
            onClick={() => handleTopicClick(topic)}
        >
            <div className="trending-item-header">
                <span className="trending-item-category">
                    {topic.categoryIcon} {topic.categoryDisplayName || 'Trending'}
                    {topic.location && ` in ${topic.location}`}
                </span>
                <button className="trending-item-more" onClick={(e) => e.stopPropagation()}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                    </svg>
                </button>
            </div>
            <div className="trending-item-title">{topic.title}</div>
            {topic.description && (
                <div className="trending-item-description">{topic.description}</div>
            )}
            <div className="trending-item-footer">
                <span className="trending-item-posts">{formatPostCount(topic.postCount)}</span>
                {topic.isPromoted && <span className="trending-promoted-badge">Promoted</span>}
            </div>
        </div>
    );

    const renderNewsItem = (news, index, featured = false) => (
        <div
            key={news.id || index}
            className={`explore-news-item ${featured ? 'featured' : ''} ${news.isBreaking ? 'breaking' : ''}`}
            onClick={() => news.sourceUrl && window.open(news.sourceUrl, '_blank')}
        >
            {news.imageUrl && (
                <div className="news-item-image">
                    <img src={news.imageUrl} alt={news.headline} loading="lazy" />
                    {news.isBreaking && (
                        <span className="breaking-badge">BREAKING</span>
                    )}
                </div>
            )}
            <div className="news-item-content">
                {news.isBreaking && !news.imageUrl && (
                    <span className="breaking-badge-inline">BREAKING</span>
                )}
                <div className="news-item-meta">
                    <span className="news-item-category">
                        {news.categoryIcon} {news.categoryDisplayName}
                    </span>
                    {news.publishedAt && (
                        <span className="news-item-time"> · {formatTimeAgo(news.publishedAt)}</span>
                    )}
                    {news.postCount > 0 && (
                        <span className="news-item-engagement"> · {formatPostCount(news.postCount)}</span>
                    )}
                </div>
                <h3 className="news-item-headline">{news.headline}</h3>
                {news.description && featured && (
                    <p className="news-item-description">{news.description}</p>
                )}
                {news.source && (
                    <span className="news-item-source">via {news.source}</span>
                )}
            </div>
        </div>
    );

    const renderForYouTab = () => {
        if (loading) {
            return (
                <div className="explore-loading">
                    <div className="explore-spinner-large"></div>
                    <p>Loading explore...</p>
                </div>
            );
        }

        if (!forYouData) {
            return (
                <div className="explore-empty">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" className="empty-icon">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <h3>Nothing trending right now</h3>
                    <p>Check back later for trending topics and news</p>
                </div>
            );
        }

        const { trendingTopics, news, trendingHashtags, trendingPosts } = forYouData;
        const hasTopics = trendingTopics && trendingTopics.length > 0;
        const hasNews = news && news.length > 0;
        const hasHashtags = trendingHashtags && trendingHashtags.length > 0;
        const hasPosts = trendingPosts && trendingPosts.length > 0;

        return (
            <div className="explore-for-you">
                {/* Featured News */}
                {hasNews && (
                    <div className="explore-section explore-featured-news">
                        {renderNewsItem(news[0], 0, true)}
                    </div>
                )}

                {/* Trending Topics */}
                {hasTopics && (
                    <div className="explore-section">
                        <h2 className="explore-section-title">Trending</h2>
                        <div className="explore-trending-list">
                            {trendingTopics.slice(0, 10).map((topic, index) =>
                                renderTrendingTopic(topic, index)
                            )}
                        </div>
                        {trendingTopics.length > 10 && (
                            <button
                                className="explore-show-more"
                                onClick={() => handleTabChange('trending')}
                            >
                                Show more
                            </button>
                        )}
                    </div>
                )}

                {/* More News */}
                {hasNews && news.length > 1 && (
                    <div className="explore-section">
                        <h2 className="explore-section-title">What's happening</h2>
                        <div className="explore-news-list">
                            {news.slice(1).map((item, index) =>
                                renderNewsItem(item, index + 1)
                            )}
                        </div>
                    </div>
                )}

                {/* Trending Hashtags */}
                {hasHashtags && (
                    <div className="explore-section">
                        <h2 className="explore-section-title">Popular Hashtags</h2>
                        <div className="explore-hashtags">
                            {trendingHashtags.map((hashtag, index) => (
                                <div
                                    key={hashtag.id || index}
                                    className="explore-hashtag-chip"
                                    onClick={() => handleHashtagClick(hashtag.tagName)}
                                >
                                    <span className="hashtag-name">#{hashtag.tagName}</span>
                                    <span className="hashtag-count">
                                        {formatPostCount(hashtag.usageCount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Trending Posts */}
                {hasPosts && (
                    <div className="explore-section">
                        <h2 className="explore-section-title">Trending Posts</h2>
                        <div className="explore-posts">
                            {trendingPosts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state if nothing is populated */}
                {!hasTopics && !hasNews && !hasHashtags && !hasPosts && (
                    <div className="explore-empty">
                        <div className="explore-empty-icon">🔍</div>
                        <h3>Explore is getting ready</h3>
                        <p>Trending topics, news, and popular content will appear here as your community grows.</p>
                    </div>
                )}
            </div>
        );
    };

    const renderCategoryTab = () => {
        if (categoryLoading) {
            return (
                <div className="explore-loading">
                    <div className="explore-spinner-large"></div>
                    <p>Loading...</p>
                </div>
            );
        }

        const hasTopics = categoryTopics && categoryTopics.length > 0;
        const hasNews = categoryNews && categoryNews.length > 0;
        const hasPosts = categoryPosts && categoryPosts.length > 0;

        if (!hasTopics && !hasNews && !hasPosts) {
            return (
                <div className="explore-empty">
                    <div className="explore-empty-icon">
                        {TABS.find(t => t.key === activeTab)?.icon || '📋'}
                    </div>
                    <h3>Nothing trending in {TABS.find(t => t.key === activeTab)?.label}</h3>
                    <p>Check back later for trending content in this category.</p>
                </div>
            );
        }

        return (
            <div className="explore-category-content">
                {/* News for this category */}
                {hasNews && (
                    <div className="explore-section">
                        <div className="explore-news-list">
                            {categoryNews.map((item, index) =>
                                renderNewsItem(item, index, index === 0)
                            )}
                        </div>
                    </div>
                )}

                {/* Trending topics for this category */}
                {hasTopics && (
                    <div className="explore-section">
                        <h2 className="explore-section-title">Trending in {TABS.find(t => t.key === activeTab)?.label}</h2>
                        <div className="explore-trending-list">
                            {categoryTopics.map((topic, index) =>
                                renderTrendingTopic(topic, index)
                            )}
                        </div>
                    </div>
                )}

                {/* Trending posts */}
                {hasPosts && (
                    <div className="explore-section">
                        <h2 className="explore-section-title">Top Posts</h2>
                        <div className="explore-posts">
                            {categoryPosts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="explore-page" id="explore-page">
            {/* Sticky Header */}
            <div className="explore-header">
                {renderSearchBar()}
                {renderTabs()}
            </div>

            {/* Content */}
            <div className="explore-content">
                {activeTab === 'foryou' ? renderForYouTab() : renderCategoryTab()}
            </div>
        </div>
    );
}

export default Explore;
