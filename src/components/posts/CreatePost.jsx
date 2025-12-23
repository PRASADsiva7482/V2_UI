import { useState } from 'react';
import { createPost } from '../../services/api/posts';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import './CreatePost.css';

function CreatePost({ onPostCreated }) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim()) return;

        try {
            setLoading(true);
            setError(null);

            console.log('Creating post with content:', content);
            const newPost = await createPost(content);

            console.log('Post created successfully:', newPost);
            setContent('');

            if (onPostCreated) {
                onPostCreated(newPost);
            }
        } catch (error) {
            console.error('Error creating post:', error);
            setError(error.response?.data?.message || 'Failed to create post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const charCount = content.length;
    const maxChars = 280;
    const isOverLimit = charCount > maxChars;
    const isNearLimit = charCount > 260;

    return (
        <div className="create-post">
            <div className="create-post-avatar">
                <Avatar size="medium" />
            </div>

            <form className="create-post-form" onSubmit={handleSubmit}>
                <textarea
                    className="create-post-textarea"
                    placeholder="What's happening?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={maxChars}
                    rows={3}
                    disabled={loading}
                />

                {error && (
                    <div className="create-post-error">
                        {error}
                    </div>
                )}

                <div className="create-post-footer">
                    <div className={`char-count ${isNearLimit ? 'warning' : ''} ${isOverLimit ? 'error' : ''}`}>
                        <span>{charCount}/{maxChars}</span>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="medium"
                        disabled={!content.trim() || isOverLimit}
                        loading={loading}
                    >
                        Post
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default CreatePost;
