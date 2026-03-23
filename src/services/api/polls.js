import apiCaller from './apiCaller';
import { URLS } from './Urls';

/**
 * Vote on a poll
 */
export const voteOnPoll = async (pollId, optionId) => {
    return apiCaller.post(URLS.POLLS.VOTE(pollId), null, {
        params: { optionId }
    });
};

/**
 * Get poll for a post
 */
export const getPollForPost = async (postId) => {
    return apiCaller.get(URLS.POLLS.BY_POST(postId));
};

/**
 * Get poll by ID
 */
export const getPollById = async (pollId) => {
    return apiCaller.get(URLS.POLLS.BY_ID(pollId));
};

export default {
    voteOnPoll,
    getPollForPost,
    getPollById
};
