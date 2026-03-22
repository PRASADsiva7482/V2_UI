import React, { useState, useEffect } from 'react';
import { getAnalyticsDashboard } from '../services/api/analytics';
import './Analytics.css';

function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const response = await getAnalyticsDashboard();
                setData(response);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        })();
    }, []);

    const formatNum = (n) => {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return String(n || 0);
    };

    if (loading) return <div className="analytics-page"><div className="analytics-loading"><div className="analytics-spinner"></div>Loading analytics...</div></div>;

    return (
        <div className="analytics-page">
            <div className="analytics-header">
                <h2>📊 Analytics Dashboard</h2>
                <p className="analytics-subtitle">Track your growth and engagement metrics</p>
            </div>

            <div className="analytics-stats-grid">
                <div className="analytics-stat-card stat-posts">
                    <div className="stat-icon">📝</div>
                    <div className="stat-value">{formatNum(data?.totalPosts)}</div>
                    <div className="stat-label">Total Posts</div>
                </div>
                <div className="analytics-stat-card stat-likes">
                    <div className="stat-icon">❤️</div>
                    <div className="stat-value">{formatNum(data?.totalLikes)}</div>
                    <div className="stat-label">Total Likes</div>
                </div>
                <div className="analytics-stat-card stat-followers">
                    <div className="stat-icon">👥</div>
                    <div className="stat-value">{formatNum(data?.followers)}</div>
                    <div className="stat-label">Followers</div>
                </div>
                <div className="analytics-stat-card stat-following">
                    <div className="stat-icon">👤</div>
                    <div className="stat-value">{formatNum(data?.following)}</div>
                    <div className="stat-label">Following</div>
                </div>
            </div>

            <div className="analytics-engagement">
                <h3>Engagement Rate</h3>
                <div className="engagement-bar-container">
                    <div className="engagement-bar" style={{ width: `${Math.min((data?.engagementRate || 0) * 100, 100)}%` }}></div>
                </div>
                <span className="engagement-value">{((data?.engagementRate || 0) * 100).toFixed(1)}% avg likes per post</span>
            </div>

            <div className="analytics-insights">
                <h3>💡 Insights</h3>
                <div className="insight-cards">
                    <div className="insight-card">
                        <span className="insight-emoji">🚀</span>
                        <p>{data?.totalPosts > 10 ? 'You\'re an active poster! Keep engaging.' : 'Post more to grow your audience.'}</p>
                    </div>
                    <div className="insight-card">
                        <span className="insight-emoji">📈</span>
                        <p>{data?.followers > data?.following ? 'Great ratio! More people follow you than you follow.' : 'Follow more people in your niche to grow.'}</p>
                    </div>
                    <div className="insight-card">
                        <span className="insight-emoji">💬</span>
                        <p>{data?.engagementRate > 0.05 ? 'Your engagement rate is healthy!' : 'Try using hashtags to boost engagement.'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;
