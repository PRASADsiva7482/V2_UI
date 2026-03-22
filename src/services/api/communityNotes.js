import apiCaller from './apiCaller';
import { URLS } from './Urls';

/** Add a community note to a post */
export const addCommunityNote = async (postId, content) => {
    return apiCaller.post(URLS.COMMUNITY_NOTES.BY_POST(postId), { content });
};

/** Get all notes for a post */
export const getNotesForPost = async (postId) => {
    return apiCaller.get(URLS.COMMUNITY_NOTES.BY_POST(postId));
};

/** Get approved notes for a post */
export const getApprovedNotes = async (postId) => {
    return apiCaller.get(URLS.COMMUNITY_NOTES.APPROVED(postId));
};

/** Vote on a community note (UP or DOWN) */
export const voteOnNote = async (noteId, voteType) => {
    return apiCaller.post(URLS.COMMUNITY_NOTES.VOTE(noteId), { voteType });
};
