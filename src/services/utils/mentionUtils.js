/**
 * Utility functions for @mention handling
 */

/**
 * Extract @mentions from text content
 * Returns array of mention objects with text and indices
 */
export const extractMentions = (text) => {
    if (!text) return [];

    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
        mentions.push({
            username: match[1],
            fullText: match[0],
            index: match.index,
            length: match[0].length
        });
    }

    return mentions;
};

/**
 * Get unique mentioned usernames from text
 */
export const getUniqueMentions = (text) => {
    const mentions = extractMentions(text);
    return [...new Set(mentions.map(m => m.username.toLowerCase()))];
};

/**
 * Parse text and convert both @mentions and #hashtags to segments
 * Returns array of text segments with type info for rendering
 */
export const parseContentSegments = (text, onMentionClick, onHashtagClick) => {
    if (!text) return [];

    // Combined regex for both @mentions and #hashtags
    const combinedRegex = /(@[a-zA-Z0-9_]+)|(#[a-zA-Z0-9_]+)/g;
    const segments = [];
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            segments.push({
                type: 'text',
                content: text.substring(lastIndex, match.index)
            });
        }

        if (match[1]) {
            // It's an @mention
            const username = match[1].substring(1); // Remove @
            segments.push({
                type: 'mention',
                content: match[1],
                username: username,
                onClick: onMentionClick
            });
        } else if (match[2]) {
            // It's a #hashtag
            const tagName = match[2].substring(1).toLowerCase(); // Remove #
            segments.push({
                type: 'hashtag',
                content: match[2],
                tagName: tagName,
                onClick: onHashtagClick
            });
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        segments.push({
            type: 'text',
            content: text.substring(lastIndex)
        });
    }

    return segments;
};

/**
 * Check if text contains mentions
 */
export const hasMentions = (text) => {
    if (!text) return false;
    return /@[a-zA-Z0-9_]+/.test(text);
};

/**
 * Get the current @mention being typed at cursor position
 * Returns { query, startIndex } or null if not currently typing a mention
 */
export const getCurrentMentionQuery = (text, cursorPosition) => {
    if (!text || cursorPosition === 0) return null;

    // Get text before cursor
    const textBeforeCursor = text.substring(0, cursorPosition);

    // Find the last @ before cursor
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    if (lastAtIndex === -1) return null;

    // Check if the @ is at the start of a word (preceded by space, newline, or start of text)
    if (lastAtIndex > 0) {
        const charBefore = textBeforeCursor[lastAtIndex - 1];
        if (charBefore !== ' ' && charBefore !== '\n' && charBefore !== '\r') {
            return null;
        }
    }

    // Get the text after @ (the query)
    const query = textBeforeCursor.substring(lastAtIndex + 1);

    // Make sure the query doesn't contain spaces (would mean user finished typing)
    if (/\s/.test(query)) return null;

    // Must be a valid username pattern
    if (!/^[a-zA-Z0-9_]*$/.test(query)) return null;

    return {
        query,
        startIndex: lastAtIndex,
        endIndex: cursorPosition
    };
};

export default {
    extractMentions,
    getUniqueMentions,
    parseContentSegments,
    hasMentions,
    getCurrentMentionQuery
};
