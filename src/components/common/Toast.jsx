import { createContext, useContext, useState, useCallback, useRef } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

/**
 * useToast hook — replaces all alert() calls.
 * Usage: const { showToast } = useToast();
 *        showToast('Profile saved!', 'success');
 */
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const idCounter = useRef(0);

    const showToast = useCallback((message, type = 'info', duration = 5000) => {
        const id = ++idCounter.current;
        const toast = { id, message, type, exiting: false };

        setToasts(prev => [...prev, toast]);

        // Start exit animation before removal
        setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        }, duration - 400);

        // Remove toast after animation completes
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);

        return id;
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 400);
    }, []);

    const ICONS = {
        success: (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
        ),
        error: (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
            </svg>
        ),
        info: (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
        ),
        warning: (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
        ),
    };

    return (
        <ToastContext.Provider value={{ showToast, dismissToast }}>
            {children}
            <div className="toast-container" aria-live="polite">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`toast toast-${toast.type} ${toast.exiting ? 'toast-exit' : 'toast-enter'}`}
                        role="alert"
                    >
                        <span className="toast-icon">{ICONS[toast.type]}</span>
                        <span className="toast-message">{toast.message}</span>
                        {/* Progress bar */}
                        <div className="toast-progress">
                            <div className="toast-progress-bar" style={{ animationDuration: '5s' }} />
                        </div>
                        <button
                            className="toast-dismiss"
                            onClick={() => dismissToast(toast.id)}
                            aria-label="Dismiss"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
