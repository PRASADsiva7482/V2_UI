import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hashtag.css';

/**
 * Clickable hashtag component
 */
function Hashtag({ tagName, size = 'medium', onClick }) {
    const navigate = useNavigate();

    const handleClick = (e) => {
        e.stopPropagation();

        if (onClick) {
            onClick(tagName);
        } else {
            // Default behavior: navigate to hashtag page
            navigate(`/hashtag/${tagName}`);
        }
    };

    return (
        <span
            className={`hashtag hashtag-${size}`}
            onClick={handleClick}
        >
            #{tagName}
        </span>
    );
}

export default Hashtag;
