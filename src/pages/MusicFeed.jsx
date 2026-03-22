import React, { useState, useEffect } from 'react';
import { useToast } from '../components/common/Toast';
import { shareMusic, getRecentMusicShares, getMyMusicShares, deleteMusicShare } from '../services/api/music';
import InputModal from '../components/common/InputModal';
import './MusicFeed.css';

function MusicFeed() {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('trending');
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [newTrack, setNewTrack] = useState({
        songTitle: '', artist: '', albumName: '',
        spotifyUrl: '', appleMusicUrl: '', platform: 'MANUAL'
    });
    const [playingId, setPlayingId] = useState(null);

    useEffect(() => {
        loadTracks();
    }, [activeTab]);

    const loadTracks = async () => {
        try {
            setLoading(true);
            const data = activeTab === 'my'
                ? await getMyMusicShares()
                : await getRecentMusicShares();
            setTracks(data || []);
        } catch (err) {
            console.error('Error loading music:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!newTrack.songTitle.trim() || !newTrack.artist.trim()) {
            showToast('Please enter song title and artist', 'warning');
            return;
        }
        try {
            const shared = await shareMusic(newTrack);
            setTracks(prev => [shared, ...prev]);
            setShowShareModal(false);
            setNewTrack({ songTitle: '', artist: '', albumName: '', spotifyUrl: '', appleMusicUrl: '', platform: 'MANUAL' });
            showToast('Song shared! 🎵', 'success');
        } catch (err) {
            showToast('Failed to share song', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteMusicShare(id);
            setTracks(prev => prev.filter(t => t.id !== id));
            showToast('Song removed', 'info');
        } catch (err) {
            showToast('Failed to remove song', 'error');
        }
    };

    // Demo tracks
    const demoTracks = [
        { id: 'd1', songTitle: 'Blinding Lights', artist: 'The Weeknd', albumName: 'After Hours', platform: 'SPOTIFY', spotifyUrl: '#', durationSeconds: 200 },
        { id: 'd2', songTitle: 'Levitating', artist: 'Dua Lipa', albumName: 'Future Nostalgia', platform: 'APPLE', appleMusicUrl: '#', durationSeconds: 203 },
        { id: 'd3', songTitle: 'As It Was', artist: 'Harry Styles', albumName: "Harry's House", platform: 'SPOTIFY', spotifyUrl: '#', durationSeconds: 167 },
        { id: 'd4', songTitle: 'Bad Guy', artist: 'Billie Eilish', albumName: 'WHEN WE ALL FALL ASLEEP', platform: 'SPOTIFY', spotifyUrl: '#', durationSeconds: 194 },
        { id: 'd5', songTitle: 'Peaches', artist: 'Justin Bieber', albumName: 'Justice', platform: 'APPLE', appleMusicUrl: '#', durationSeconds: 198 },
    ];

    const displayTracks = tracks.length > 0 ? tracks : demoTracks;

    const formatDuration = (sec) => {
        if (!sec) return '--:--';
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const getAlbumColor = (i) => {
        const colors = ['#e74c3c', '#3498db', '#9b59b6', '#e67e22', '#1abc9c', '#f39c12'];
        return colors[i % colors.length];
    };

    return (
        <div className="music-feed-page">
            <div className="mf-header">
                <div className="mf-header-text">
                    <h2>🎵 Music Feed</h2>
                    <p className="mf-subtitle">Share & discover music with your network</p>
                </div>
                <button className="mf-share-btn" onClick={() => setShowShareModal(true)}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                    Share Song
                </button>
            </div>

            <div className="mf-tabs">
                <button className={`mf-tab ${activeTab === 'trending' ? 'active' : ''}`} onClick={() => setActiveTab('trending')}>
                    🔥 Trending
                </button>
                <button className={`mf-tab ${activeTab === 'recent' ? 'active' : ''}`} onClick={() => setActiveTab('recent')}>
                    🆕 Recent
                </button>
                <button className={`mf-tab ${activeTab === 'my' ? 'active' : ''}`} onClick={() => setActiveTab('my')}>
                    🎧 My Shares
                </button>
            </div>

            <div className="mf-track-list">
                {loading ? (
                    <div className="mf-loading">
                        <div className="mf-spinner"></div>
                        <p>Loading tracks...</p>
                    </div>
                ) : (
                    displayTracks.map((track, idx) => (
                        <div key={track.id} className={`mf-track-card ${playingId === track.id ? 'playing' : ''}`}>
                            <div className="mf-track-number">{idx + 1}</div>
                            <div className="mf-album-art" style={{ background: `linear-gradient(135deg, ${getAlbumColor(idx)}, ${getAlbumColor(idx + 2)})` }}>
                                <div className="mf-play-icon" onClick={() => setPlayingId(playingId === track.id ? null : track.id)}>
                                    {playingId === track.id ? (
                                        <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    )}
                                </div>
                                {playingId === track.id && (
                                    <div className="mf-equalizer">
                                        <span /><span /><span /><span />
                                    </div>
                                )}
                            </div>
                            <div className="mf-track-info">
                                <h4 className="mf-track-title">{track.songTitle}</h4>
                                <p className="mf-track-artist">{track.artist}</p>
                                {track.albumName && <p className="mf-track-album">{track.albumName}</p>}
                            </div>
                            <div className="mf-track-duration">{formatDuration(track.durationSeconds)}</div>
                            <div className="mf-track-links">
                                {track.spotifyUrl && (
                                    <a href={track.spotifyUrl} target="_blank" rel="noreferrer" className="mf-link-spotify" title="Open in Spotify">
                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#1DB954">
                                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                                        </svg>
                                    </a>
                                )}
                                {track.appleMusicUrl && (
                                    <a href={track.appleMusicUrl} target="_blank" rel="noreferrer" className="mf-link-apple" title="Open in Apple Music">
                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#FC3C44">
                                            <path d="M23.997 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043A5.022 5.022 0 0019.7.104a10.367 10.367 0 00-2.007-.104H6.31a17.57 17.57 0 00-1.746.072 5.316 5.316 0 00-1.61.422c-1.35.678-2.17 1.746-2.537 3.215A9.694 9.694 0 000 5.89v12.18c.02.679.07 1.357.194 2.02.339 1.524 1.2 2.605 2.603 3.244.466.207.967.33 1.479.39a16.14 16.14 0 001.846.084h11.513c.59 0 1.18-.03 1.766-.108.527-.067 1.028-.2 1.503-.434 1.377-.653 2.21-1.726 2.56-3.21.113-.457.17-.93.198-1.397.043-.747.043-1.494.043-2.24V8.34c-.003-.703-.003-1.408-.043-2.11V6.124zM16.948 13.2l-.003.006c-.02.18-.047.397-.073.6-.062.437-.345.702-.72.884a.79.79 0 01-.34.093c-.196.014-.284-.06-.324-.257a.9.9 0 01-.02-.204v-.694c0-.114.004-.228.01-.342.01-.116.033-.23.067-.343.072-.236.2-.44.384-.6.267-.225.567-.38.883-.504l.224-.084c.036-.013.073-.02.105-.028l.01-.002c.127-.032.254-.036.375.017.081.035.115.1.1.202a4.55 4.55 0 01-.155.614l-.01.042c-.003.014-.004.029-.01.042-.21.61-.52.82-1.003 1.087zm.21-3.283c-.094-.013-.188-.024-.28-.044a3.028 3.028 0 01-.476-.134c-.306-.11-.528-.32-.686-.616a1.73 1.73 0 01-.15-.49c-.04-.205-.076-.412-.06-.622.02-.36.134-.697.33-.995.156-.233.36-.416.61-.546.248-.13.515-.194.793-.21.138-.01.278.005.415.03.297.054.566.17.803.35.244.182.408.426.507.716.057.166.083.34.093.517.01.189-.003.377-.035.563a2.072 2.072 0 01-.335.833 1.555 1.555 0 01-.643.535 2.054 2.054 0 01-.886.113z"/>
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="mf-modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="mf-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="mf-modal-header">
                            <h3>🎵 Share a Song</h3>
                            <button className="mf-modal-close" onClick={() => setShowShareModal(false)}>×</button>
                        </div>
                        <div className="mf-modal-body">
                            <div className="mf-form-group">
                                <label>Song Title *</label>
                                <input type="text" placeholder="Song name" value={newTrack.songTitle}
                                    onChange={(e) => setNewTrack(t => ({ ...t, songTitle: e.target.value }))} />
                            </div>
                            <div className="mf-form-group">
                                <label>Artist *</label>
                                <input type="text" placeholder="Artist name" value={newTrack.artist}
                                    onChange={(e) => setNewTrack(t => ({ ...t, artist: e.target.value }))} />
                            </div>
                            <div className="mf-form-group">
                                <label>Album</label>
                                <input type="text" placeholder="Album name" value={newTrack.albumName}
                                    onChange={(e) => setNewTrack(t => ({ ...t, albumName: e.target.value }))} />
                            </div>
                            <div className="mf-form-row">
                                <div className="mf-form-group">
                                    <label>Spotify URL</label>
                                    <input type="url" placeholder="https://open.spotify.com/..." value={newTrack.spotifyUrl}
                                        onChange={(e) => setNewTrack(t => ({ ...t, spotifyUrl: e.target.value }))} />
                                </div>
                                <div className="mf-form-group">
                                    <label>Apple Music URL</label>
                                    <input type="url" placeholder="https://music.apple.com/..." value={newTrack.appleMusicUrl}
                                        onChange={(e) => setNewTrack(t => ({ ...t, appleMusicUrl: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                        <div className="mf-modal-footer">
                            <button className="mf-modal-cancel" onClick={() => setShowShareModal(false)}>Cancel</button>
                            <button className="mf-modal-submit" onClick={handleShare}>Share Song</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MusicFeed;
