import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import './ImageCropper.css';

const ASPECT_RATIOS = [
    { label: 'Original', value: null },
    { label: '1:1', value: 1 / 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 },
    { label: '9:16', value: 9 / 16 },
    { label: '3:4', value: 3 / 4 },
];

function ImageCropper({ image, onCropComplete, onCancel }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [aspectRatio, setAspectRatio] = useState(null);
    const [rotation, setRotation] = useState(0);

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom) => {
        setZoom(zoom);
    };

    const onCropAreaChange = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleAspectRatioChange = (ratio) => {
        setAspectRatio(ratio);
    };

    const handleApply = () => {
        if (onCropComplete) {
            onCropComplete({
                croppedAreaPixels,
                aspectRatio,
                rotation,
                zoom
            });
        }
    };

    return (
        <div className="image-cropper-modal">
            <div className="image-cropper-overlay" onClick={onCancel}></div>
            <div className="image-cropper-container">
                <div className="image-cropper-header">
                    <h3>Edit Image</h3>
                    <button className="close-btn" onClick={onCancel}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M13.414 12l6.293-6.293a1 1 0 00-1.414-1.414L12 10.586 5.707 4.293a1 1 0 00-1.414 1.414L10.586 12l-6.293 6.293a1 1 0 101.414 1.414L12 13.414l6.293 6.293a1 1 0 001.414-1.414L13.414 12z" />
                        </svg>
                    </button>
                </div>

                <div className="image-cropper-content">
                    <div className="cropper-wrapper">
                        <Cropper
                            image={image}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspectRatio}
                            rotation={rotation}
                            onCropChange={onCropChange}
                            onZoomChange={onZoomChange}
                            onCropComplete={onCropAreaChange}
                            objectFit="contain"
                        />
                    </div>

                    <div className="cropper-controls">
                        {/* Aspect Ratio Selection */}
                        <div className="control-group">
                            <label>Aspect Ratio</label>
                            <div className="aspect-ratio-buttons">
                                {ASPECT_RATIOS.map((ratio) => (
                                    <button
                                        key={ratio.label}
                                        type="button"
                                        className={`aspect-btn ${aspectRatio === ratio.value ? 'active' : ''}`}
                                        onClick={() => handleAspectRatioChange(ratio.value)}
                                    >
                                        {ratio.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Zoom Control */}
                        <div className="control-group">
                            <label>
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                                </svg>
                                Zoom
                            </label>
                            <div className="zoom-control">
                                <button
                                    type="button"
                                    className="zoom-btn"
                                    onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                                >
                                    -
                                </button>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="zoom-slider"
                                />
                                <button
                                    type="button"
                                    className="zoom-btn"
                                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Rotation Control */}
                        <div className="control-group">
                            <label>
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45zM19.93 11c-.17-1.39-.72-2.73-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.48z" />
                                </svg>
                                Rotation
                            </label>
                            <div className="rotation-control">
                                <input
                                    type="range"
                                    min={0}
                                    max={360}
                                    step={1}
                                    value={rotation}
                                    onChange={(e) => setRotation(Number(e.target.value))}
                                    className="rotation-slider"
                                />
                                <span className="rotation-value">{rotation}°</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="image-cropper-footer">
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleApply}>
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ImageCropper;
