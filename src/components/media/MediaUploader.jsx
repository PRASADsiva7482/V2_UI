import { useState, useEffect } from 'react';
import './MediaUploader.css';

function MediaUploader({ onMediaSelect, selectedFiles = [], maxFiles = 4 }) {
    const [previews, setPreviews] = useState([]);

    // Generate previews when selectedFiles changes
    useEffect(() => {
        if (!selectedFiles || selectedFiles.length === 0) {
            setPreviews([]);
            return;
        }

        const newPreviews = [];
        let loadedCount = 0;

        selectedFiles.forEach((file, index) => {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            const reader = new FileReader();
            reader.onload = (e) => {
                newPreviews[index] = {
                    file,
                    url: e.target.result,
                    type: isImage ? 'image' : 'video',
                    name: file.name,
                    size: file.size
                };

                loadedCount++;
                if (loadedCount === selectedFiles.length) {
                    setPreviews(newPreviews);
                }
            };
            reader.readAsDataURL(file);
        });
    }, [selectedFiles]);

    const handleRemove = (index) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);

        if (onMediaSelect) {
            onMediaSelect(updatedFiles);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="media-uploader">
            {/* Only show previews when files are selected */}
            {previews.length > 0 && (
                <div className={`media-preview-grid media-count-${Math.min(previews.length, 4)}`}>
                    {previews.map((preview, index) => (
                        <div key={index} className="media-preview-item">
                            {preview.type === 'image' ? (
                                <img src={preview.url} alt={preview.name} className="preview-image" />
                            ) : (
                                <div className="video-preview">
                                    <video src={preview.url} className="preview-video" />
                                    <div className="video-overlay">
                                        <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                            <button
                                type="button"
                                className="media-remove-btn"
                                onClick={() => handleRemove(index)}
                                aria-label="Remove media"
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                    <path d="M13.414 12l6.293-6.293a1 1 0 00-1.414-1.414L12 10.586 5.707 4.293a1 1 0 00-1.414 1.414L10.586 12l-6.293 6.293a1 1 0 101.414 1.414L12 13.414l6.293 6.293a1 1 0 001.414-1.414L13.414 12z" />
                                </svg>
                            </button>
                            <div className="media-info">
                                <span className="media-file-size">{formatFileSize(preview.size)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MediaUploader;
