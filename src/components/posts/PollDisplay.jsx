import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { voteOnPoll } from '../../services/api/polls';
import './PollDisplay.css';

/**
 * PollDisplay component - renders a poll within a post card
 * Shows voting options if user hasn't voted & poll is active
 * Shows results with percentage bars if user has voted or poll is closed
 */
function PollDisplay({ poll, onPollUpdate }) {
    const { t } = useTranslation();
    const [isVoting, setIsVoting] = useState(false);
    const [localPoll, setLocalPoll] = useState(poll);
    const [selectedOption, setSelectedOption] = useState(null);

    if (!localPoll) return null;

    const hasVoted = localPoll.votedOptionId != null;
    const isExpired = localPoll.isExpired;
    const isClosed = localPoll.isClosed;
    const showResults = hasVoted || isExpired || isClosed;

    const handleVote = useCallback(async (optionId, e) => {
        if (e) e.stopPropagation();
        if (isVoting || hasVoted || isExpired || isClosed) return;

        try {
            setIsVoting(true);
            setSelectedOption(optionId);
            const updatedPoll = await voteOnPoll(localPoll.id, optionId);
            setLocalPoll(updatedPoll);
            if (onPollUpdate) onPollUpdate(updatedPoll);
        } catch (error) {
            console.error('Error voting on poll:', error);
            setSelectedOption(null);
        } finally {
            setIsVoting(false);
        }
    }, [localPoll.id, isVoting, hasVoted, isExpired, isClosed, onPollUpdate]);

    const getTimeRemaining = () => {
        if (!localPoll.expiresAt) return '';
        const now = new Date();
        const expires = new Date(localPoll.expiresAt);
        const diff = expires - now;

        if (diff <= 0) return t('poll.ended', 'Poll ended');

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return t('poll.daysLeft', '{{count}} days left', { count: days });
        }
        if (hours > 0) {
            return t('poll.hoursLeft', '{{count}}h {{minutes}}m left', { count: hours, minutes });
        }
        return t('poll.minutesLeft', '{{count}}m left', { count: minutes });
    };

    return (
        <div className="poll-display" onClick={(e) => e.stopPropagation()}>
            {/* Poll Question */}
            {localPoll.question && (
                <div className="poll-question">{localPoll.question}</div>
            )}

            {/* Options */}
            <div className="poll-options">
                {localPoll.options.map((option) => {
                    const isVotedOption = localPoll.votedOptionId === option.id;
                    const isSelected = selectedOption === option.id;
                    const percentage = option.percentage || 0;

                    return (
                        <div key={option.id} className="poll-option-wrapper">
                            {showResults ? (
                                /* Results View */
                                <div className={`poll-option-result ${isVotedOption ? 'voted' : ''}`}>
                                    <div
                                        className="poll-option-bar"
                                        style={{ width: `${percentage}%` }}
                                    />
                                    <div className="poll-option-content">
                                        <span className="poll-option-text">
                                            {isVotedOption && (
                                                <svg className="poll-voted-check" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                </svg>
                                            )}
                                            {option.optionText}
                                        </span>
                                        <span className="poll-option-percentage">{percentage}%</span>
                                    </div>
                                </div>
                            ) : (
                                /* Voting View */
                                <button
                                    className={`poll-option-btn ${isSelected ? 'selected' : ''}`}
                                    onClick={(e) => handleVote(option.id, e)}
                                    disabled={isVoting}
                                >
                                    {option.optionText}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Poll Footer */}
            <div className="poll-footer">
                <span className="poll-votes-count">
                    {t('poll.votes', '{{count}} votes', { count: localPoll.totalVotes || 0 })}
                </span>
                <span className="poll-time-remaining">
                    {getTimeRemaining()}
                </span>
            </div>
        </div>
    );
}

export default PollDisplay;
