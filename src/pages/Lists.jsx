import React, { useState, useEffect, useCallback } from 'react';
import { createList, getMyLists, deleteList, getListMembers, addListMember, removeListMember } from '../services/api/lists';
import { searchUsers } from '../services/api/profile';
import Avatar from '../components/common/Avatar';
import { useToast } from '../components/common/Toast';
import './Lists.css';

function Lists() {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [newListDesc, setNewListDesc] = useState('');
    const [newListPrivate, setNewListPrivate] = useState(false);
    const [creating, setCreating] = useState(false);
    const { showToast } = useToast();

    // List detail view state
    const [selectedList, setSelectedList] = useState(null);
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [addingMember, setAddingMember] = useState(null);

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
            showToast('List created!', 'success');
        } catch (err) {
            console.error('Failed to create list:', err);
            showToast('Failed to create list', 'error');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (listId) => {
        if (!window.confirm('Delete this list?')) return;
        try {
            await deleteList(listId);
            loadLists();
            if (selectedList?.id === listId) setSelectedList(null);
            showToast('List deleted', 'success');
        } catch (err) {
            console.error('Failed to delete list:', err);
            showToast('Failed to delete list', 'error');
        }
    };

    // ─── List Detail / Members ───

    const openListDetail = async (list) => {
        setSelectedList(list);
        setMemberSearch('');
        setSearchResults([]);
        try {
            setLoadingMembers(true);
            const data = await getListMembers(list.id);
            setMembers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load members:', err);
            setMembers([]);
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleMemberSearch = async (query) => {
        setMemberSearch(query);
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            setSearching(true);
            const result = await searchUsers(query, { page: 0, size: 10 });
            const users = result?.content || result || [];
            // Filter out users already in the list
            const memberIds = new Set(members.map(m => m.userId || m.id));
            setSearchResults(users.filter(u => !memberIds.has(u.userId)));
        } catch (err) {
            console.error('Search failed:', err);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleAddMember = async (user) => {
        try {
            setAddingMember(user.userId);
            await addListMember(selectedList.id, user.userId);
            setMembers(prev => [...prev, user]);
            setSearchResults(prev => prev.filter(u => u.userId !== user.userId));
            // Update member count in lists
            setLists(prev => prev.map(l =>
                l.id === selectedList.id ? { ...l, memberCount: (l.memberCount || 0) + 1 } : l
            ));
            showToast(`Added ${user.displayName || user.username} to list`, 'success');
        } catch (err) {
            console.error('Failed to add member:', err);
            showToast('Failed to add member', 'error');
        } finally {
            setAddingMember(null);
        }
    };

    const handleRemoveMember = async (member) => {
        try {
            await removeListMember(selectedList.id, member.userId || member.id);
            setMembers(prev => prev.filter(m => (m.userId || m.id) !== (member.userId || member.id)));
            setLists(prev => prev.map(l =>
                l.id === selectedList.id ? { ...l, memberCount: Math.max(0, (l.memberCount || 1) - 1) } : l
            ));
            showToast(`Removed ${member.displayName || member.username} from list`, 'success');
        } catch (err) {
            console.error('Failed to remove member:', err);
            showToast('Failed to remove member', 'error');
        }
    };

    // ─── Render: List Detail View ───
    if (selectedList) {
        return (
            <div className="lists-page">
                <div className="lists-header">
                    <button className="lists-back-btn" onClick={() => setSelectedList(null)}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                        </svg>
                    </button>
                    <div>
                        <h2>{selectedList.name}</h2>
                        {selectedList.description && <p className="lists-subtitle">{selectedList.description}</p>}
                    </div>
                </div>

                {/* Add Member Search */}
                <div className="lists-add-member-section">
                    <h3>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        Add Members
                    </h3>
                    <div className="lists-member-search">
                        <input
                            type="text"
                            placeholder="Search users to add..."
                            value={memberSearch}
                            onChange={(e) => handleMemberSearch(e.target.value)}
                        />
                        {searching && <span className="lists-searching">Searching...</span>}
                    </div>
                    {searchResults.length > 0 && (
                        <div className="lists-search-results">
                            {searchResults.map(user => (
                                <div key={user.userId} className="lists-user-item">
                                    <Avatar src={user.profilePictureUrl} alt={user.displayName} size="small" />
                                    <div className="lists-user-info">
                                        <span className="lists-user-name">{user.displayName}</span>
                                        <span className="lists-user-handle">@{user.username}</span>
                                    </div>
                                    <button
                                        className="lists-add-btn"
                                        onClick={() => handleAddMember(user)}
                                        disabled={addingMember === user.userId}
                                    >
                                        {addingMember === user.userId ? '...' : '+ Add'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Current Members */}
                <div className="lists-members-section">
                    <h3>Members ({members.length})</h3>
                    {loadingMembers ? (
                        <div className="lists-loading">
                            <div className="lists-spinner"></div>
                            <span>Loading members...</span>
                        </div>
                    ) : members.length === 0 ? (
                        <div className="lists-empty-members">
                            <p>No members yet. Search and add users above.</p>
                        </div>
                    ) : (
                        <div className="lists-members-list">
                            {members.map(member => (
                                <div key={member.userId || member.id} className="lists-user-item">
                                    <Avatar src={member.profilePictureUrl} alt={member.displayName} size="small" />
                                    <div className="lists-user-info">
                                        <span className="lists-user-name">{member.displayName || member.username}</span>
                                        <span className="lists-user-handle">@{member.username}</span>
                                    </div>
                                    <button
                                        className="lists-remove-btn"
                                        onClick={() => handleRemoveMember(member)}
                                        title="Remove from list"
                                    >
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ─── Render: Lists Grid ───
    return (
        <div className="lists-page">
            <div className="lists-header">
                <h2>Your Lists</h2>
                <button className="lists-create-btn" onClick={() => setShowCreateModal(true)}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
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
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" opacity="0.3"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" /></svg>
                    <h3>No lists yet</h3>
                    <p>Create lists to curate your feed. Add users to organize them by interest, topic, or community.</p>
                    <button className="lists-create-btn" onClick={() => setShowCreateModal(true)}>Create your first list</button>
                </div>
            ) : (
                <div className="lists-grid">
                    {lists.map(list => (
                        <div key={list.id} className="list-card" onClick={() => openListDetail(list)}>
                            <div className="list-card-header">
                                <div className="list-card-icon">
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" /></svg>
                                </div>
                                <div className="list-card-actions">
                                    {list.isPrivate && <span className="list-badge-private">🔒 Private</span>}
                                    <button className="list-delete-btn" onClick={(e) => { e.stopPropagation(); handleDelete(list.id); }} title="Delete list">
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                                    </button>
                                </div>
                            </div>
                            <h3 className="list-card-name">{list.name}</h3>
                            {list.description && <p className="list-card-desc">{list.description}</p>}
                            <div className="list-card-footer">
                                <span className="list-member-count">{list.memberCount || 0} members</span>
                                <span className="list-card-arrow">→</span>
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
