import { useEffect, useRef } from 'react';
import Button from './Button';
import './InputModal.css';

/**
 * Reusable modal for replacing window.prompt() calls
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {string} props.title - Modal title
 * @param {string} props.message - Instruction text
 * @param {string} props.value - Controlled input value
 * @param {Function} props.onChange - Value change handler
 * @param {Function} props.onSubmit - Submit handler
 * @param {Function} props.onCancel - Cancel/close handler
 * @param {string} [props.placeholder] - Input placeholder
 * @param {string} [props.submitText] - Text for submit button
 * @param {boolean} [props.isTextarea] - If true, render a textarea instead of input
 */
function InputModal({
    isOpen,
    title,
    message,
    value,
    onChange,
    onSubmit,
    onCancel,
    placeholder = 'Type here...',
    submitText = 'Submit',
    isTextarea = false
}) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 50);
        }
    }, [isOpen]);

    // Close on escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onCancel();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div className="input-modal-overlay" onMouseDown={onCancel}>
            <div className="input-modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="input-modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close-btn" onClick={onCancel} aria-label="Close">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
                        </svg>
                    </button>
                </div>

                <form className="input-modal-body" onSubmit={handleSubmit}>
                    {message && <p className="input-modal-message">{message}</p>}
                    
                    {isTextarea ? (
                        <textarea
                            ref={inputRef}
                            className="input-modal-field textarea"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={placeholder}
                            rows={4}
                        />
                    ) : (
                        <input
                            ref={inputRef}
                            type="text"
                            className="input-modal-field"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={placeholder}
                        />
                    )}

                    <div className="input-modal-footer">
                        <Button variant="secondary" onClick={onCancel} type="button">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={!value.trim()}>
                            {submitText}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default InputModal;
