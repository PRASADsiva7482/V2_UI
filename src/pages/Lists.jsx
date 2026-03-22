import React, { useState, useEffect, useCallback } from 'react';
import { createList, getMyLists, deleteList } from '../services/api/lists';
import './Lists.css';

function Lists() {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [newListDesc, setNewListDesc] = useState('');
    const [newListPrivate, setNewListPrivate] = useState(false);
    const [creating, setCreating] = useState(false);

    const loadLists = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getMyLists();
            setLists(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load lists:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadLists(); }, [loadLists]);

    const handleCreate = async () => {
        if (!newListName.trim()) return;
        try {
            setCreating(true);
            await createList(newListName, newListDesc, newListPrivate);
            setShowCreateModal(false);
            setNewListName('');
            setNewListDesc('');
            setNewListPrivate(false);
            loadLists();
        } catch (err) {
            console.error('Failed to create list:', err);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (listId) => {
        if (!window.confirm('Delete this list?')) return;
        try {
            await deleteList(listId);
            loadLists();
        } catch (err) {
            console.error('Failed to delete list:', err);
        }
    };

    return (
        <div className="lists-page">
            <div className="lists-header">
                <h2>Your Lists</h2>
                <button className="lists-create-btn" onClick={() => setShowCreateModal(true)}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    New List
                </button>
            </div>

            {loading ? (
                <div className="lists-loading">
                    <div className="lists-spinner"></div>
                    <span>Loading lists...</span>
                </div>
            ) : lists.length === 0 ? (
                <div className="lists-empty">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" opacity="0.3"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
                    <h3>No lists yet</h3>
                    <p>Create lists to curate your feed. Add users to organize them by interest, topic, or community.</p>
                    <button className="lists-create-btn" onClick={() => setShowCreateModal(true)}>Create your first list</button>
                </div>
            ) : (
                <div className="lists-grid">
                    {lists.map(list => (
                        <div key={list.id} className="list-card">
                            <div className="list-card-header">
                                <div className="list-card-icon">
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
                                </div>
                                <div className="list-card-actions">
                                    {list.isPrivate && <span className="list-badge-private">🔒 Private</span>}
                                    <button className="list-delete-btn" onClick={() => handleDelete(list.id)} title="Delete list">
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                    </button>
                                </div>
                            </div>
                            <h3 className="list-card-name">{list.name}</h3>
                            {list.description && <p className="list-card-desc">{list.description}</p>}
                            <div className="list-card-footer">
                                <span className="list-member-count">{list.memberCount || 0} members</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="lists-modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="lists-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="lists-modal-header">
                            <h3>Create a new List</h3>
                            <button onClick={() => setShowCreateModal(false)} className="lists-modal-close">✕</button>
                        </div>
                        <div className="lists-modal-body">
                            <div className="lists-modal-field">
                                <label>Name</label>
                                <input
                                    type="text" placeholder="My List"
                                    value={newListName} onChange={(e) => setNewListName(e.target.value)}
                                    maxLength={100} autoFocus
                                />
                            </div>
                            <div className="lists-modal-field">
                                <label>Description</label>
                                <textarea
                                    placeholder="What is this list about?"
                                    value={newListDesc} onChange={(e) => setNewListDesc(e.target.value)}
                                    maxLength={500} rows={3}
                                />
                            </div>
                            <div className="lists-modal-field lists-modal-toggle">
                                <label>Make private</label>
                                <input type="checkbox" checked={newListPrivate} onChange={(e) => setNewListPrivate(e.target.checked)} />
                            </div>
                        </div>
                        <div className="lists-modal-footer">
                            <button className="lists-save-btn" onClick={handleCreate} disabled={!newListName.trim() || creating}>
                                {creating ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Lists;
