import './Avatar.css';

function Avatar({
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

    return (
        <div className={avatarClasses} onClick={onClick}>
            {src ? (
                <img src={src} alt={alt} />
            ) : (
                <div className="avatar-placeholder">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                </div>
            )}
        </div>
    );
}

export default Avatar;
