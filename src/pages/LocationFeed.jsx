import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/common/Toast';
import { getNearbyFeed } from '../services/api/location';
import { formatRelativeTime } from '../services/utils/formatters';
import Avatar from '../components/common/Avatar';
import './LocationFeed.css';

function LocationFeed() {
    const { showToast } = useToast();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [radius, setRadius] = useState(10);
    const [locationError, setLocationError] = useState(null);

    useEffect(() => {
        requestLocation();
    }, []);

    useEffect(() => {
        if (userLocation) {
            loadNearbyPosts();
        }
    }, [userLocation, radius]);

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLocationError(null);
            },
            (error) => {
                setLocationError('Location access denied. Enable location to see nearby posts.');
                // Fall back to demo data
                setUserLocation({ lat: 40.7128, lng: -74.006 }); // Default NYC
            }
        );
    };

    const loadNearbyPosts = async () => {
        if (!userLocation) return;
        try {
            setLoading(true);
            const data = await getNearbyFeed(userLocation.lat, userLocation.lng, radius);
            setPosts(data || []);
        } catch (err) {
            console.error('Error loading nearby posts:', err);
        } finally {
            setLoading(false);
        }
    };

    // Demo nearby posts
    const demoPosts = [
        { id: 1, userId: 'alice', content: 'Beautiful sunset at the park today! 🌅', locationName: 'Central Park', latitude: 40.785, longitude: -73.968, likesCount: 42, commentsCount: 8, createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 2, userId: 'bob', content: 'Just grabbed the best coffee ☕ ever at this spot!', locationName: 'Blue Bottle Coffee', latitude: 40.720, longitude: -74.001, likesCount: 23, commentsCount: 3, createdAt: new Date(Date.now() - 7200000).toISOString() },
        { id: 3, userId: 'cara', content: 'Live music tonight downtown 🎸 who\'s coming?', locationName: 'The Bowery Ballroom', latitude: 40.722, longitude: -73.993, likesCount: 89, commentsCount: 15, createdAt: new Date(Date.now() - 10800000).toISOString() },
        { id: 4, userId: 'dave', content: 'Street art discovery of the day 🎨', locationName: 'Brooklyn Bridge', latitude: 40.706, longitude: -73.997, likesCount: 156, commentsCount: 22, createdAt: new Date(Date.now() - 14400000).toISOString() },
        { id: 5, userId: 'emma', content: 'This pizza place is seriously underrated 🍕', locationName: 'Joe\'s Pizza', latitude: 40.730, longitude: -74.002, likesCount: 67, commentsCount: 11, createdAt: new Date(Date.now() - 18000000).toISOString() },
    ];

    const displayPosts = posts.length > 0 ? posts : demoPosts;

    const getDistanceColor = (dist) => {
        if (dist < 1) return '#1db954';
        if (dist < 5) return '#f39c12';
        return '#e74c3c';
    };

    return (
        <div className="location-feed-page">
            <div className="lf-header">
                <div className="lf-header-text">
                    <h2>📍 Nearby</h2>
                    <p className="lf-subtitle">Discover posts from people around you</p>
                </div>
                <button className="lf-refresh-btn" onClick={loadNearbyPosts}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                    </svg>
                </button>
            </div>

            {locationError && (
                <div className="lf-location-error">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span>{locationError}</span>
                    <button onClick={requestLocation}>Enable</button>
                </div>
            )}

            {/* Radius Selector */}
            <div className="lf-radius-bar">
                <span className="lf-radius-label">Radius:</span>
                {[1, 5, 10, 25, 50].map(r => (
                    <button
                        key={r}
                        className={`lf-radius-chip ${radius === r ? 'active' : ''}`}
                        onClick={() => setRadius(r)}
                    >
                        {r} km
                    </button>
                ))}
            </div>

            {/* Mini Map Placeholder */}
            <div className="lf-map-area">
                <div className="lf-map-grid">
                    {displayPosts.map((post, idx) => (
                        <div
                            key={post.id}
                            className="lf-map-pin"
                            style={{
                                left: `${15 + (idx * 17) % 70}%`,
                                top: `${15 + ((idx * 23) % 60)}%`
                            }}
                        >
                            <div className="lf-pin-dot"></div>
                            <div className="lf-pin-pulse"></div>
                        </div>
                    ))}
                </div>
                <div className="lf-map-center">
                    <div className="lf-user-marker">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="#1d9bf0">
                            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
                        </svg>
                    </div>
                </div>
                <div className="lf-map-legend">
                    {userLocation && <span>📍 {userLocation.lat.toFixed(3)}, {userLocation.lng.toFixed(3)}</span>}
                    <span>{displayPosts.length} posts within {radius}km</span>
                </div>
            </div>

            {/* Post List */}
            <div className="lf-post-list">
                {loading ? (
                    <div className="lf-loading">
                        <div className="lf-spinner"></div>
                        <p>Searching nearby...</p>
                    </div>
                ) : displayPosts.length === 0 ? (
                    <div className="lf-empty">
                        <div className="lf-empty-icon">📍</div>
                        <h3>No posts nearby</h3>
                        <p>Be the first to share your location!</p>
                    </div>
                ) : (
                    displayPosts.map(post => (
                        <div key={post.id} className="lf-post-card">
                            <div className="lf-post-header">
                                <Avatar size={36} username={post.userId} />
                                <div className="lf-post-user">
                                    <span className="lf-post-username">@{post.userId}</span>
                                    <span className="lf-post-time">{formatRelativeTime(post.createdAt)}</span>
                                </div>
                                {post.locationName && (
                                    <span className="lf-location-badge">
                                        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                        </svg>
                                        {post.locationName}
                                    </span>
                                )}
                            </div>
                            <p className="lf-post-content">{post.content}</p>
                            <div className="lf-post-stats">
                                <span>❤️ {post.likesCount}</span>
                                <span>💬 {post.commentsCount}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default LocationFeed;
