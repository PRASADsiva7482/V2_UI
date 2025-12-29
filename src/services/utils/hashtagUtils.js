/**
 * Utility functions for hashtag handling
 */

/**
 * Extract hashtags from text content
 * Returns array of hashtag objects with text and indices
 */
export const extractHashtags = (text) => {
    if (!text) return [];

    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    const hashtags = [];
    let match;

    while ((match = hashtagRegex.exec(text)) !== null) {
        hashtags.push({
            text: match[1].toLowerCase(),
            fullText: match[0],
            index: match.index,
            length: match[0].length
        });
    }

    return hashtags;
};

/**
 * Parse text and convert hashtags to clickable elements
 * Returns array of text segments and hashtag components
 */
export const parseHashtagsInText = (text, onHashtagClick) => {
    if (!text) return [];

    const hashtags = extractHashtags(text);
    if (hashtags.length === 0) return [{ type: 'text', content: text }];

    const segments = [];
    let lastIndex = 0;

    hashtags.forEach((hashtag) => {
        // Add text before hashtag
        if (hashtag.index > lastIndex) {
            segments.push({
                type: 'text',
                content: text.substring(lastIndex, hashtag.index)
            });
        }

        // Add hashtag
        segments.push({
            type: 'hashtag',
            content: hashtag.fullText,
            tagName: hashtag.text,
            onClick: onHashtagClick
        });

        lastIndex = hashtag.index + hashtag.length;
    });

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
 * Check if text contains hashtags
 */
export const hasHashtags = (text) => {
    if (!text) return false;
    return /#[a-zA-Z0-9_]+/.test(text);
};

/**
 * Get unique hashtag names from text
 */
export const getUniqueHashtags = (text) => {
    const hashtags = extractHashtags(text);
    return [...new Set(hashtags.map(h => h.text))];
};

/**
 * Format hashtag for display (add # if missing)
 */
export const formatHashtag = (tagName) => {
    if (!tagName) return '';
    return tagName.startsWith('#') ? tagName : `#${tagName}`;
};

/**
 * Clean hashtag (remove # if present)
 */
export const cleanHashtag = (tagName) => {
    if (!tagName) return '';
    return tagName.startsWith('#') ? tagName.substring(1) : tagName;
};

export default {
    extractHashtags,
    parseHashtagsInText,
    hasHashtags,
    getUniqueHashtags,
    formatHashtag,
    cleanHashtag
};
