import { useEffect, useRef } from 'react';

/**
 * Global media manager — ensures only one audio/video plays at a time
 * across the entire app (feed, chat, lightbox, etc.) and auto-pauses
 * media elements when they scroll out of view.
 *
 * Usage:
 *   const containerRef = useMediaAutoStop();
 *   <div ref={containerRef}> ... <video> or <audio> inside ... </div>
 *
 * It will:
 *  1. Pause any media that scrolls out of the viewport (IntersectionObserver)
 *  2. Pause all other playing media when a new one starts (only one at a time)
 */

// ── Singleton: track the currently playing element app-wide ──
let currentlyPlaying = null;

export function pauseAllMedia() {
    if (currentlyPlaying && !currentlyPlaying.paused) {
        currentlyPlaying.pause();
    }
    currentlyPlaying = null;
}

function handlePlay(e) {
    const el = e.target;
    // If something else is already playing, pause it first
    if (currentlyPlaying && currentlyPlaying !== el && !currentlyPlaying.paused) {
        currentlyPlaying.pause();
    }
    currentlyPlaying = el;
}

function handlePauseOrEnded(e) {
    if (currentlyPlaying === e.target) {
        currentlyPlaying = null;
    }
}

/**
 * Hook: attach to a container ref. All <video> and <audio> elements inside
 * will be automatically managed for scroll-based pause and single-playback.
 */
export default function useMediaAutoStop() {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Gather all media elements (now and in the future via MutationObserver)
        const observedElements = new Set();
        let observer;

        // ── IntersectionObserver: pause when out of view, auto-play when in view ──
        const intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const el = entry.target;
                    if (!entry.isIntersecting) {
                        if (!el.paused) {
                            el.pause();
                        }
                    } else {
                        // isIntersecting - play if auto-play is requested
                        if (el.dataset.autoplayOnScroll === 'true') {
                            if (el.paused || el.ended) {
                                const playPromise = el.play();
                                if (playPromise !== undefined) {
                                    playPromise.catch(err => console.warn('Autoplay prevented by browser:', err));
                                }
                            }
                        }
                    }
                });
            },
            { threshold: 0.6 } // Trigger when at least 60% visible
        );

        function attachMedia(el) {
            if (observedElements.has(el)) return;
            observedElements.add(el);
            intersectionObserver.observe(el);
            el.addEventListener('play', handlePlay);
            el.addEventListener('pause', handlePauseOrEnded);
            el.addEventListener('ended', handlePauseOrEnded);
        }

        function detachMedia(el) {
            if (!observedElements.has(el)) return;
            observedElements.delete(el);
            intersectionObserver.unobserve(el);
            el.removeEventListener('play', handlePlay);
            el.removeEventListener('pause', handlePauseOrEnded);
            el.removeEventListener('ended', handlePauseOrEnded);
        }

        // Scan existing media elements
        function scanContainer() {
            container.querySelectorAll('video, audio').forEach(attachMedia);
        }

        scanContainer();

        // ── MutationObserver: catch dynamically added/removed media ──
        observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType !== 1) return; // Element nodes only
                    if (node.tagName === 'VIDEO' || node.tagName === 'AUDIO') {
                        attachMedia(node);
                    }
                    // Also check children
                    node.querySelectorAll?.('video, audio')?.forEach(attachMedia);
                });
                mutation.removedNodes.forEach((node) => {
                    if (node.nodeType !== 1) return;
                    if (node.tagName === 'VIDEO' || node.tagName === 'AUDIO') {
                        detachMedia(node);
                    }
                    node.querySelectorAll?.('video, audio')?.forEach(detachMedia);
                });
            });
        });

        observer.observe(container, { childList: true, subtree: true });

        return () => {
            observedElements.forEach(detachMedia);
            intersectionObserver.disconnect();
            observer.disconnect();
        };
    }, []);

    return containerRef;
}
