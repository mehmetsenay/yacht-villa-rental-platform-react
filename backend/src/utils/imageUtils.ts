
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export const removeWhiteBackground = async (inputPath: string): Promise<string> => {
    const outputPath = inputPath.replace(path.extname(inputPath), '.png');

    // If input is already png and we want to process it, we might need a temp file, 
    // but for now let's assume we are converting jpg/jpeg or overwriting.
    // If input == output, sharp will error on same file.

    const tempOutput = outputPath + '.tmp.png';

    try {
        await sharp(inputPath)
            .toFormat('png')
            .ensureAlpha() // Ensure alpha channel exists
            // Simple threshold-based transparency: 
            // In a real scenario, this is complex. Sharp doesn't have a direct "make white transparent" filter 
            // without pixel manipulation (which is slow in JS) or using bandbool operations.
            // A common trick is to use the image brightness as an alpha mask, but that's for black/white logos.

            // For a general "remove white background", we can use a linear operation or simply hope the user 
            // is okay with a rough cut. 
            // However, a robust way is to check pixel values.
            // Since sharp is fast, we can try a simple boolean operation if the logo is black on white.
            // But if the logo has colors, this is hard.

            // ALTERNATIVE: Let's trust the user's "mix-blend-mode" request wasn't working because of image format.
            // Converting to transparent PNG based on white Threshold.

            // Let's use a simpler approach: Just convert to PNG. 
            // AND use a threshold to make near-white transparent.
            // limitInputPixels: false
            .threshold(250, { grayscale: false }) // This turns non-white to black and white to white? No.
            // Sharp doesn't have a built-in "magic wand".

            // Better approach for stability: 
            // We can't easily auto-remove background perfectly without complex logic.
            // BUT, we can try to make the image consistent.

            // Wait, I promised "png olarak yapsın".
            // If I just convert to PNG, it still has white background.
            // I need to use `linear` or `boolean` operations to mask it.

            // Let's try a safe bet: Convert to PNG. 
            // And if possible, apply a level operation.

            // Actually, the user's issue might be that he wants transparency.
            // Writing a perfect "remove background" in 5 mins with sharp is risky.
            // Reverting to: Making sure the image is served as PNG might help some browsers? No.

            // Let's use `trim()`? 
            .trim({ threshold: 10 }) // Removes surrounding white space.
            .toFile(tempOutput);

        // If simple trim isn't enough, we might need to rely on the CSS fix I made earlier being cached.
        // But I will proceed with converting to PNG.

        // Let's try to simulate "Multiply" by making white transparent.
        // This is hard with just Sharp api without raw buffer access.

        // Strategy: Process raw buffer.
        const { data, info } = await sharp(inputPath)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const pixelArray = new Uint8ClampedArray(data);
        const threshold = 250;

        for (let i = 0; i < pixelArray.length; i += 4) {
            const r = pixelArray[i];
            const g = pixelArray[i + 1];
            const b = pixelArray[i + 2];

            // If pixel is near white
            if (r > threshold && g > threshold && b > threshold) {
                pixelArray[i + 3] = 0; // Set alpha to 0
            }
        }

        await sharp(pixelArray, { raw: { width: info.width, height: info.height, channels: 4 } })
            .png()
            .toFile(tempOutput);

        // Replace original or update path
        // We will return the new path.
        // If input was jpg, we keep the jpg file? No, better delete old.

        // Rename temp to final
        fs.renameSync(tempOutput, outputPath);

        // If input extension was not .png, remove old file
        if (inputPath !== outputPath) {
            fs.unlinkSync(inputPath);
        }

        return outputPath;
    } catch (error) {
        console.error('Background removal failed:', error);
        // Fallback to original
        return inputPath;
    }
};
