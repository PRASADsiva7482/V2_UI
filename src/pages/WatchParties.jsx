import React, { useState, useEffect } from 'react';
import { useToast } from '../components/common/Toast';
import { createWatchParty, getActiveWatchParties, joinWatchParty, leaveWatchParty, endWatchParty } from '../services/api/watchParties';
import InputModal from '../components/common/InputModal';
import './WatchParties.css';

function WatchParties() {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('discover');
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newParty, setNewParty] = useState({ title: '', videoUrl: '', videoPlatform: 'YOUTUBE' });
    const [joinedPartyId, setJoinedPartyId] = useState(null);

    useEffect(() => {
        loadParties();
    }, []);

    const loadParties = async () => {
        try {
            setLoading(true);
            const data = await getActiveWatchParties();
            setParties(data || []);
        } catch (err) {
            console.error('Error loading watch parties:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateParty = async () => {
        if (!newParty.title.trim() || !newParty.videoUrl.trim()) {
            showToast('Please fill in all fields', 'warning');
            return;
        }
        try {
            const party = await createWatchParty(newParty);
            setParties(prev => [party, ...prev]);
            setShowCreateModal(false);
            setNewParty({ title: '', videoUrl: '', videoPlatform: 'YOUTUBE' });
            showToast('Watch party created! 🎬', 'success');
        } catch (err) {
            showToast('Failed to create watch party', 'error');
        }
    };

    const handleJoin = async (partyId) => {
        try {
            await joinWatchParty(partyId);
            setJoinedPartyId(partyId);
            showToast('Joined the watch party! 🎉', 'success');
            loadParties();
        } catch (err) {
            showToast('Failed to join party', 'error');
        }
    };

    const handleLeave = async (partyId) => {
        try {
            await leaveWatchParty(partyId);
            setJoinedPartyId(null);
            showToast('Left the watch party', 'info');
            loadParties();
        } catch (err) {
            showToast('Failed to leave party', 'error');
        }
    };

    // Demo data for when API hasn't returned real data yet
    const demoParties = [
        { id: 'd1', title: 'Friday Movie Night 🍿', videoUrl: 'https://youtube.com/watch?v=demo1', videoPlatform: 'YOUTUBE', participantCount: 12, maxParticipants: 50, status: 'ACTIVE', hostId: 'user1' },
        { id: 'd2', title: 'Anime Watch Along', videoUrl: 'https://youtube.com/watch?v=demo2', videoPlatform: 'YOUTUBE', participantCount: 8, maxParticipants: 30, status: 'ACTIVE', hostId: 'user2' },
        { id: 'd3', title: 'Music Video Premiere 🎵', videoUrl: 'https://youtube.com/watch?v=demo3', videoPlatform: 'YOUTUBE', participantCount: 24, maxParticipants: 100, status: 'ACTIVE', hostId: 'user3' },
    ];

    const displayParties = parties.length > 0 ? parties : demoParties;

    return (
        <div className="watch-parties-page">
            <div className="wp-header">
                <div className="wp-header-text">
                    <h2>🎬 Watch Parties</h2>
                    <p className="wp-subtitle">Watch videos together with friends in real-time</p>
                </div>
                <button className="wp-create-btn" onClick={() => setShowCreateModal(true)}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                    Create Party
                </button>
            </div>

            <div className="wp-tabs">
                <button className={`wp-tab ${activeTab === 'discover' ? 'active' : ''}`} onClick={() => setActiveTab('discover')}>
                    🔥 Discover
                </button>
                <button className={`wp-tab ${activeTab === 'popular' ? 'active' : ''}`} onClick={() => setActiveTab('popular')}>
                    ⭐ Popular
                </button>
                <button className={`wp-tab ${activeTab === 'my' ? 'active' : ''}`} onClick={() => setActiveTab('my')}>
                    📺 My Parties
                </button>
            </div>

            <div className="wp-list">
                {loading ? (
                    <div className="wp-loading">
                        <div className="wp-spinner"></div>
                        <p>Loading watch parties...</p>
                    </div>
                ) : displayParties.length === 0 ? (
                    <div className="wp-empty">
                        <div className="wp-empty-icon">🎬</div>
                        <h3>No active watch parties</h3>
                        <p>Create one and invite your friends!</p>
                    </div>
                ) : (
                    displayParties.map(party => (
                        <div key={party.id} className={`wp-card ${joinedPartyId === party.id ? 'joined' : ''}`}>
                            <div className="wp-card-thumbnail">
                                <div className="wp-platform-badge">{party.videoPlatform}</div>
                                <div className="wp-live-badge">
                                    <span className="wp-live-dot"></span>LIVE
                                </div>
                            </div>
                            <div className="wp-card-info">
                                <h3 className="wp-card-title">{party.title}</h3>
                                <div className="wp-card-meta">
                                    <span className="wp-viewers">
                                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                        </svg>
                                        {party.participantCount}/{party.maxParticipants}
                                    </span>
                                </div>
                            </div>
                            <div className="wp-card-actions">
                                {joinedPartyId === party.id ? (
                                    <button className="wp-leave-btn" onClick={() => handleLeave(party.id)}>Leave</button>
                                ) : (
                                    <button className="wp-join-btn" onClick={() => handleJoin(party.id)}>Join</button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Party Modal */}
            {showCreateModal && (
                <div className="wp-modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="wp-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="wp-modal-header">
                            <h3>Create Watch Party</h3>
                            <button className="wp-modal-close" onClick={() => setShowCreateModal(false)}>×</button>
                        </div>
                        <div className="wp-modal-body">
                            <div className="wp-form-group">
                                <label>Party Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Friday Movie Night 🍿"
                                    value={newParty.title}
                                    onChange={(e) => setNewParty(p => ({ ...p, title: e.target.value }))}
                                />
                            </div>
                            <div className="wp-form-group">
                                <label>Video URL</label>
                                <input
                                    type="url"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={newParty.videoUrl}
                                    onChange={(e) => setNewParty(p => ({ ...p, videoUrl: e.target.value }))}
                                />
                            </div>
                            <div className="wp-form-group">
                                <label>Platform</label>
                                <select
                                    value={newParty.videoPlatform}
                                    onChange={(e) => setNewParty(p => ({ ...p, videoPlatform: e.target.value }))}
                                >
                                    <option value="YOUTUBE">YouTube</option>
                                    <option value="VIMEO">Vimeo</option>
                                    <option value="TWITCH">Twitch</option>
                                    <option value="CUSTOM">Custom URL</option>
                                </select>
                            </div>
                        </div>
                        <div className="wp-modal-footer">
                            <button className="wp-modal-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            <button className="wp-modal-submit" onClick={handleCreateParty}>Create Party</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WatchParties;
