import { useState, useEffect } from 'react';
import ImageCropper from './ImageCropper';
import { getCroppedImg, getImageDimensions } from '../../services/utils/cropImage';
import './MediaUploader.css';

function MediaUploader({ onMediaSelect, selectedFiles = [], maxFiles = 4 }) {
    const [previews, setPreviews] = useState([]);
    const [showCropper, setShowCropper] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState(null);

    // Generate previews when selectedFiles changes
    useEffect(() => {
        if (!selectedFiles || selectedFiles.length === 0) {
            setPreviews([]);
            return;
        }

        const loadPreviews = async () => {
            const newPreviews = [];

            for (let index = 0; index < selectedFiles.length; index++) {
                const fileData = selectedFiles[index];
                const file = fileData.file || fileData;
                const isImage = file.type.startsWith('image/');
                const isVideo = file.type.startsWith('video/');

                const url = fileData.url || URL.createObjectURL(file);

                let aspectRatio = fileData.aspectRatio;
                let width = fileData.width;
                let height = fileData.height;

                // Get dimensions for images if not already set
                if (isImage && !aspectRatio) {
                    try {
                        const dimensions = await getImageDimensions(url);
                        aspectRatio = dimensions.aspectRatio;
                        width = dimensions.width;
                        height = dimensions.height;
                    } catch (error) {
                        console.error('Error getting image dimensions:', error);
                        aspectRatio = 16 / 9; // Default fallback
                    }
                }

                newPreviews[index] = {
                    file,
                    url,
                    type: isImage ? 'image' : 'video',
                    name: file.name,
                    size: file.size,
                    aspectRatio,
                    width,
                    height
                };
            }

            setPreviews(newPreviews);
        };

        loadPreviews();
    }, [selectedFiles]);

    const handleRemove = (index) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);

        if (onMediaSelect) {
            onMediaSelect(updatedFiles);
        }
    };

    const handleEdit = (index) => {
        const preview = previews[index];
        if (preview && preview.type === 'image') {
            setCurrentImageIndex(index);
            setCurrentImageUrl(preview.url);
            setShowCropper(true);
        }
    };

    const handleCropComplete = async (cropData) => {
        try {
            const croppedImage = await getCroppedImg(
                currentImageUrl,
                cropData.croppedAreaPixels,
                cropData.rotation
            );

            // Update the file in selectedFiles with cropped version
            const updatedFiles = [...selectedFiles];
            updatedFiles[currentImageIndex] = {
                file: croppedImage.file,
                url: croppedImage.url,
                aspectRatio: croppedImage.aspectRatio,
                width: croppedImage.width,
                height: croppedImage.height
            };

            if (onMediaSelect) {
                onMediaSelect(updatedFiles);
            }

            setShowCropper(false);
            setCurrentImageIndex(null);
            setCurrentImageUrl(null);
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setCurrentImageIndex(null);
        setCurrentImageUrl(null);
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
                        <div
                            key={index}
                            className="media-preview-item"
                            style={{
                                aspectRatio: preview.aspectRatio || 'auto'
                            }}
                        >
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

                            {/* Edit button for images */}
                            {preview.type === 'image' && (
                                <button
                                    type="button"
                                    className="media-edit-btn"
                                    onClick={() => handleEdit(index)}
                                    aria-label="Edit image"
                                    title="Edit image"
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                    </svg>
                                </button>
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
                                {preview.aspectRatio && (
                                    <span className="media-aspect-ratio">
                                        {preview.width}×{preview.height}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image Cropper Modal */}
            {showCropper && currentImageUrl && (
                <ImageCropper
                    image={currentImageUrl}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}
        </div>
    );
}

export default MediaUploader;
