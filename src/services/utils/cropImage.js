/**
 * Creates a cropped image from the source image
 * @param {string} imageSrc - Source image URL
 * @param {Object} pixelCrop - Crop area in pixels
 * @param {number} rotation - Rotation in degrees
 * @returns {Promise<{file: File, url: string, width: number, height: number, aspectRatio: number}>}
 */
export async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not get canvas context');
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    // Set canvas size to safe area
    canvas.width = safeArea;
    canvas.height = safeArea;

    // Translate canvas context to center
    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    // Draw rotated image
    ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    // Set canvas width to final desired crop size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Paste generated rotate image with correct offset
    ctx.putImageData(
        data,
        Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
        Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }

            const file = new File([blob], 'cropped-image.jpg', {
                type: 'image/jpeg',
                lastModified: Date.now(),
            });

            const url = URL.createObjectURL(blob);

            resolve({
                file,
                url,
                width: pixelCrop.width,
                height: pixelCrop.height,
                aspectRatio: pixelCrop.width / pixelCrop.height
            });
        }, 'image/jpeg', 0.95);
    });
}

/**
 * Creates an image element from source
 * @param {string} url - Image URL
 * @returns {Promise<HTMLImageElement>}
 */
function createImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });
}

/**
 * Gets the natural aspect ratio of an image
 * @param {string} url - Image URL
 * @returns {Promise<number>}
 */
export async function getImageAspectRatio(url) {
    const image = await createImage(url);
    return image.width / image.height;
}

/**
 * Gets image dimensions
 * @param {string} url - Image URL
 * @returns {Promise<{width: number, height: number, aspectRatio: number}>}
 */
export async function getImageDimensions(url) {
    const image = await createImage(url);
    return {
        width: image.width,
        height: image.height,
        aspectRatio: image.width / image.height
    };
}
