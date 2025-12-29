import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrendingHashtags } from '../../services/api/hashtags';
import { formatNumber } from '../../services/utils/formatters';
import './TrendingHashtags.css';

function TrendingHashtags({ limit = 5 }) {
    const navigate = useNavigate();
    const [hashtags, setHashtags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadTrendingHashtags();
    }, [limit]);

    const loadTrendingHashtags = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getTrendingHashtags({ page: 0, size: limit });
            setHashtags(response.content || []);
        } catch (err) {
            console.error('Error loading trending hashtags:', err);
            setError('Failed to load trending hashtags');
        } finally {
            setLoading(false);
        }
    };

    const handleHashtagClick = (tagName) => {
        navigate(`/hashtag/${tagName}`);
    };

    if (loading) {
        return (
            <div className="trending-hashtags">
                <h3 className="trending-title">Trending Hashtags</h3>
                <div className="trending-loading">
                    <div className="skeleton-item"></div>
                    <div className="skeleton-item"></div>
                    <div className="skeleton-item"></div>
                </div>
            </div>
        );
    }

    if (error || hashtags.length === 0) {
        return null;
    }

    return (
        <div className="trending-hashtags">
            <h3 className="trending-title">Trending Hashtags</h3>
            <div className="trending-list">
                {hashtags.map((hashtag, index) => (
                    <div
                        key={hashtag.id || index}
                        className="trending-item"
                        onClick={() => handleHashtagClick(hashtag.tagName)}
                    >
                        <div className="trending-rank">{index + 1}</div>
                        <div className="trending-content">
                            <div className="trending-name">#{hashtag.tagName}</div>
                            <div className="trending-count">
                                {formatNumber(hashtag.usageCount)} posts
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TrendingHashtags;
