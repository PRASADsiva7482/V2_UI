import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './PollCreator.css';

/**
 * PollCreator component - allows users to create a poll with 2-4 options
 */
function PollCreator({ pollData, onChange, onRemove, disabled = false }) {
    const { t } = useTranslation();
    const maxOptions = 4;
    const minOptions = 2;

    const handleQuestionChange = (e) => {
        onChange({ ...pollData, question: e.target.value });
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...pollData.options];
        newOptions[index] = value;
        onChange({ ...pollData, options: newOptions });
    };

    const addOption = () => {
        if (pollData.options.length < maxOptions) {
            onChange({
                ...pollData,
                options: [...pollData.options, '']
            });
        }
    };

    const removeOption = (index) => {
        if (pollData.options.length > minOptions) {
            const newOptions = pollData.options.filter((_, i) => i !== index);
            onChange({ ...pollData, options: newOptions });
        }
    };

    const handleDurationChange = (e) => {
        onChange({ ...pollData, durationHours: parseInt(e.target.value, 10) });
    };

    return (
        <div className="poll-creator">
            <div className="poll-creator-header">
                <button
                    type="button"
                    className="poll-creator-remove-btn"
                    onClick={onRemove}
                    title={t('common.cancel')}
                    disabled={disabled}
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
                    </svg>
                </button>
            </div>

            <div className="poll-field">
                <input
                    type="text"
                    className="poll-input question-input"
                    placeholder={t('poll.question', 'Ask a question...')}
                    value={pollData.question}
                    onChange={handleQuestionChange}
                    maxLength={500}
                    disabled={disabled}
                    autoFocus
                />
            </div>

            <div className="poll-options-list">
                {pollData.options.map((option, index) => (
                    <div key={index} className="poll-field option-field">
                        <input
                            type="text"
                            className="poll-input"
                            placeholder={`${t('poll.option', 'Choice')} ${index + 1}`}
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            maxLength={200}
                            disabled={disabled}
                        />
                        {pollData.options.length > minOptions && (
                            <button
                                type="button"
                                className="poll-option-remove"
                                onClick={() => removeOption(index)}
                                title={t('poll.removeOption', 'Remove option')}
                                disabled={disabled}
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))}

                {pollData.options.length < maxOptions && (
                    <button
                        type="button"
                        className="poll-add-option-btn"
                        onClick={addOption}
                        disabled={disabled}
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                        {t('poll.addOption', 'Add option')}
                    </button>
                )}
            </div>

            <div className="poll-duration-selector">
                <label className="poll-duration-label">{t('poll.duration', 'Poll length')}</label>
                <div className="poll-duration-controls">
                    <select
                        className="poll-select"
                        value={pollData.durationHours}
                        onChange={handleDurationChange}
                        disabled={disabled}
                    >
                        <option value={1}>1 {t('poll.hours', 'Hour')}</option>
                        <option value={24}>24 {t('poll.hours', 'Hours')} (1 Day)</option>
                        <option value={72}>72 {t('poll.hours', 'Hours')} (3 Days)</option>
                        <option value={168}>168 {t('poll.hours', 'Hours')} (7 Days)</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

export default PollCreator;
