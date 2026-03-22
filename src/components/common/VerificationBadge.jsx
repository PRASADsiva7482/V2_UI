import './VerificationBadge.css';

/**
 * VerificationBadge component - displays a tiered verification checkmark
 * 
 * Tiers:
 * - BLUE: Verified Creator / Notable Individual
 * - GOLD: Official Business / Brand
 * - GREY: Government / Official Organization
 * - NONE: No badge
 */
function VerificationBadge({ tier, size = 16, className = '' }) {
    if (!tier || tier === 'NONE') return null;

    const tierConfig = {
        BLUE: {
            color: '#1D9BF0',
            label: 'Verified',
        },
        GOLD: {
            color: '#E8A517',
            label: 'Official Business',
        },
        GREY: {
            color: '#829AAB',
            label: 'Government/Official',
        }
    };

    const config = tierConfig[tier];
    if (!config) return null;

    return (
        <span
            className={`verification-badge badge-${tier.toLowerCase()} ${className}`}
            title={config.label}
            aria-label={config.label}
        >
            <svg
                viewBox="0 0 22 22"
                width={size}
                height={size}
                fill={config.color}
                aria-hidden="true"
            >
                <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.855-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.143.271.586.702 1.084 1.24 1.438.54.354 1.167.551 1.813.568.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.225 1.261.272 1.893.143.636-.131 1.22-.437 1.69-.884.445-.47.75-1.055.88-1.69.131-.634.084-1.292-.139-1.9.584-.272 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
            </svg>
        </span>
    );
}

export default VerificationBadge;
