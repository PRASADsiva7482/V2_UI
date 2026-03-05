import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './SearchBox.css';

function SearchBox({ onSearch }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all'); // all, users, posts
    const [showResults, setShowResults] = useState(false);
    const [searchResults, setSearchResults] = useState({ users: [], posts: [], loading: false });
    const searchBoxRef = useRef(null);

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Live search as user types
    useEffect(() => {
        const searchLive = async () => {
            if (query.trim().length < 2) {
                setSearchResults({ users: [], posts: [], loading: false });
                setShowResults(false);
                return;
            }

            setSearchResults(prev => ({ ...prev, loading: true }));
            setShowResults(true);

            try {
                const { searchUsers } = await import('../../services/api/profile');
                const { searchPosts } = await import('../../services/api/posts');

                if (filter === 'all') {
                    const [userResults, postResults] = await Promise.all([
                        searchUsers(query, { page: 0, size: 5 }).catch(() => ({ content: [] })),
                        searchPosts(query, { page: 0, size: 5 }).catch(() => ({ content: [] }))
                    ]);
                    setSearchResults({
                        users: userResults.content || [],
                        posts: postResults.content || [],
                        loading: false
                    });
                } else if (filter === 'users') {
                    const results = await searchUsers(query, { page: 0, size: 10 }).catch(() => ({ content: [] }));
                    setSearchResults({
                        users: results.content || [],
                        posts: [],
                        loading: false
                    });
                } else if (filter === 'posts') {
                    const results = await searchPosts(query, { page: 0, size: 10 }).catch(() => ({ content: [] }));
                    setSearchResults({
                        users: [],
                        posts: results.content || [],
                        loading: false
                    });
                }
            } catch (error) {
                console.error('Live search error:', error);
                setSearchResults({ users: [], posts: [], loading: false });
            }
        };

        const debounceTimer = setTimeout(searchLive, 300);
        return () => clearTimeout(debounceTimer);
    }, [query, filter]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query, filter);
            setShowResults(false);
        }
    };

    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`);
        setShowResults(false);
        setQuery('');
    };

    const handlePostClick = (postId) => {
        // Navigate to post detail or open modal
        console.log('Navigate to post:', postId);
        setShowResults(false);
        setQuery('');
    };

    const totalResults = searchResults.users.length + searchResults.posts.length;

    const getMediaUrl = (fileUrl) => {
        if (!fileUrl) return '';
        if (fileUrl.startsWith('http')) return fileUrl;
        const cleanPath = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
        const baseUrl = window.config?.api?.mediaBaseUrl || 'http://localhost:2000';
        return `${baseUrl}/${cleanPath}`;
    };

    return (
        <div className="search-box" ref={searchBoxRef}>
            <form className="search-form" onSubmit={handleSubmit}>
                <div className="search-input-wrapper">
                    <svg className="search-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z" />
                    </svg>
                    <input
                        type="text"
                        className="search-input"
                        placeholder={t('search.placeholder')}
                        value={query}
                        onChange={handleInputChange}
                        autoComplete="off"
                    />
                    {query && (
                        <button
                            type="button"
                            className="search-clear"
                            onClick={() => {
                                setQuery('');
                                setShowResults(false);
                            }}
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>

                <div className="search-filters">
                    <button
                        type="button"
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        {t('search.filters.all')}
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${filter === 'users' ? 'active' : ''}`}
                        onClick={() => setFilter('users')}
                    >
                        {t('search.filters.users')}
                    </button>
                    <button
                        type="button"
                        className={`filter-btn ${filter === 'posts' ? 'active' : ''}`}
                        onClick={() => setFilter('posts')}
                    >
                        {t('search.filters.posts')}
                    </button>
                </div>
            </form>

            {/* Search Results Dropdown */}
            {showResults && query.trim().length >= 2 && (
                <div className="search-results">
                    {searchResults.loading ? (
                        <div className="search-results-loading">{t('search.searching')}</div>
                    ) : totalResults === 0 ? (
                        <div className="search-results-empty">{t('search.noResults', { query })}</div>
                    ) : (
                        <>
                            {searchResults.users.length > 0 && (
                                <div className="search-results-section">
                                    <div className="search-results-header">
                                        {t('search.results.users', { count: searchResults.users.length })}
                                    </div>
                                    {searchResults.users.map(user => (
                                        <div
                                            key={user.userId}
                                            className="search-result-item"
                                            onClick={() => handleUserClick(user.userId)}
                                        >
                                            <div className="search-result-avatar">
                                                {user.profilePictureUrl ? (
                                                    <img src={getMediaUrl(user.profilePictureUrl)} alt={user.displayName} />
                                                ) : (
                                                    <div className="search-result-avatar-placeholder">
                                                        {user.displayName?.charAt(0) || user.username?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="search-result-info">
                                                <div className="search-result-name">{user.displayName || user.username}</div>
                                                <div className="search-result-username">@{user.username}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {searchResults.posts.length > 0 && (
                                <div className="search-results-section">
                                    <div className="search-results-header">
                                        {t('search.results.posts', { count: searchResults.posts.length })}
                                    </div>
                                    {searchResults.posts.map(post => (
                                        <div
                                            key={post.id}
                                            className="search-result-item"
                                            onClick={() => handlePostClick(post.id)}
                                        >
                                            <div className="search-result-info">
                                                <div className="search-result-post-author">
                                                    {post.author?.displayName || post.author?.username || 'Unknown'}
                                                </div>
                                                <div className="search-result-post-content">
                                                    {post.content.substring(0, 80)}
                                                    {post.content.length > 80 ? '...' : ''}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchBox;
