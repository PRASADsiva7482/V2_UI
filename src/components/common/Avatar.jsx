import { memo } from 'react';
import './Avatar.css';

const Avatar = memo(function Avatar({
    src,
    alt = 'User avatar',
    size = 'medium',
    onClick,
    className = ''
}) {
    const avatarClasses = [
        'avatar',
        `avatar-${size}`,
        onClick ? 'avatar-clickable' : '',
        className
    ].filter(Boolean).join(' ');

    const getMediaUrl = (fileUrl) => {
        if (!fileUrl) return '';
        if (fileUrl.startsWith('http')) return fileUrl;
        if (fileUrl.startsWith('blob:')) return fileUrl; // Needed for local preview URLs

        const cleanPath = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
        const baseUrl = window.config?.api?.mediaBaseUrl || 'http://localhost:2000';
        return `${baseUrl}/${cleanPath}`;
    };

    const resolvedSrc = getMediaUrl(src);

    return (
        <div className={avatarClasses} onClick={onClick}>
            {resolvedSrc ? (
                <img src={resolvedSrc} alt={alt} />
            ) : (
                <div className="avatar-placeholder">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                </div>
            )}
        </div>
    );
});

export default Avatar;

