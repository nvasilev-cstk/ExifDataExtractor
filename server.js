const express = require('express');
const ExifReader = require('exifreader');

const app = express();
const PORT = 3000;

app.get('/extract-exif', async (req, res) => {
    const imageUrl = req.query.url;

    if (!imageUrl) {
        return res.status(400).json({ error: 'Please provide a url parameter.' });
    }

    try {
        // Fetch the image as an ArrayBuffer
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        
        const buffer = await response.arrayBuffer();

        // Load metadata
        const tags = ExifReader.load(buffer);

        // Extract and format the specific fields you requested
        const result = {
            copyright: {
                artist: tags['Artist']?.description || tags['By-line']?.description || "Unknown",
                studio: tags['Copyright']?.description || "Unknown"
            },
            camera: {
                brand: tags['Make']?.description || "Unknown",
                model: tags['Model']?.description || "Unknown",
                lens: tags['LensModel']?.description || tags['Lens']?.description || "Unknown",
                aperture: tags['FNumber']?.description || "Unknown",
                shutterSpeed: tags['ExposureTime']?.description || "Unknown",
                iso: tags['ISOSpeedRatings']?.description || "Unknown"
            }
        };

        // Check if we actually found any real data (if brand and model are both unknown, it's likely stripped)
        if (result.camera.brand === "Unknown" && result.camera.model === "Unknown") {
            return res.json({
                success: false,
                message: "No metadata found. The image may have been stripped of EXIF data by the CDN.",
                url: imageUrl
            });
        }

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: 'Failed to process image.', 
            details: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});