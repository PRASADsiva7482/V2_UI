import React, { useState } from 'react';
import './Spaces.css';

function Spaces() {
    const [activeTab, setActiveTab] = useState('discover');

    // Placeholder spaces data (would come from API)
    const liveSpaces = [];

    return (
        <div className="spaces-page">
            <div className="spaces-header">
                <h2>Spaces</h2>
                <p className="spaces-subtitle">Live audio conversations with your community</p>
            </div>

            <div className="spaces-tabs">
                <button className={`spaces-tab ${activeTab === 'discover' ? 'active' : ''}`} onClick={() => setActiveTab('discover')}>Discover</button>
                <button className={`spaces-tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>Upcoming</button>
                <button className={`spaces-tab ${activeTab === 'my' ? 'active' : ''}`} onClick={() => setActiveTab('my')}>My Spaces</button>
            </div>

            <div className="spaces-create-card">
                <div className="spaces-create-icon">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1.02 1.15V12c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92v-.08c.07-.61-.41-1.15-1.02-1.15z"/>
                    </svg>
                </div>
                <div className="spaces-create-content">
                    <h3>Start a Space</h3>
                    <p>Host a live audio room and connect with your followers in real-time.</p>
                </div>
                <button className="spaces-start-btn" onClick={() => alert('Audio Spaces requires WebRTC integration. Coming in the next release!')}>
                    Start Now
                </button>
            </div>

            {activeTab === 'discover' && (
                <div className="spaces-section">
                    <h3 className="spaces-section-title">🔴 Happening Now</h3>
                    {liveSpaces.length === 0 ? (
                        <div className="spaces-empty">
                            <div className="spaces-empty-icon">
                                <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" opacity="0.3">
                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                                </svg>
                            </div>
                            <h4>No active Spaces right now</h4>
                            <p>When people you follow host or join a Space, it will appear here. Be the first to start one!</p>
                        </div>
                    ) : (
                        <div className="spaces-list">
                            {liveSpaces.map(space => (
                                <div key={space.id} className="space-card">
                                    <div className="space-card-live-badge">LIVE</div>
                                    <h4>{space.title}</h4>
                                    <span>{space.listenerCount} listening</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'upcoming' && (
                <div className="spaces-section">
                    <h3 className="spaces-section-title">📅 Scheduled Spaces</h3>
                    <div className="spaces-empty">
                        <h4>No upcoming Spaces</h4>
                        <p>Schedule a Space to let your followers know when you'll be live.</p>
                    </div>
                </div>
            )}

            {activeTab === 'my' && (
                <div className="spaces-section">
                    <h3 className="spaces-section-title">🎙️ Your Spaces</h3>
                    <div className="spaces-empty">
                        <h4>You haven't hosted any Spaces yet</h4>
                        <p>Start your first audio conversation and build your community.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Spaces;
