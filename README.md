# exif-extractor

A lightweight Node.js HTTP server that accepts an image URL and returns its EXIF metadata as a JSON object.

## How It Works

The server exposes a single GET endpoint. When called with an image URL, it:

1. Fetches the image from the provided URL as a binary buffer
2. Parses the EXIF metadata using the [ExifReader](https://github.com/mattiasw/ExifReader) library
3. Returns a structured JSON object containing copyright and camera data

If the image has had its EXIF data stripped (common with CDN-served images), the endpoint returns a `success: false` response indicating no metadata was found.

## Endpoint

```
GET /extract-exif?url={imageUrl}
```

### Parameters

| Parameter | Type   | Required | Description                        |
|-----------|--------|----------|------------------------------------|
| `url`     | string | Yes      | Publicly accessible URL of the image |

### Response — Success

```json
{
  "success": true,
  "data": {
    "copyright": {
      "artist": "Jane Doe",
      "studio": "© Acme Photography 2024"
    },
    "camera": {
      "brand": "Canon",
      "model": "EOS R5",
      "lens": "RF 24-70mm F2.8 L IS USM",
      "aperture": "f/2.8",
      "shutterSpeed": "1/500",
      "iso": "400"
    }
  }
}
```

### Response — No EXIF Data Found

```json
{
  "success": false,
  "message": "No metadata found. The image may have been stripped of EXIF data by the CDN.",
  "url": "https://example.com/image.jpg"
}
```

### Response — Error

```json
{
  "error": "Failed to process image.",
  "details": "..."
}
```

## Setup

### Prerequisites

- Node.js 20+ (native `fetch` is required)

### Install

```bash
git clone <repo-url>
cd exif-extractor
npm install
```

### Run

```bash
node server.js
```

The server starts on `http://localhost:3000`.

### Example Request

```bash
curl "http://localhost:3000/extract-exif?url=https://example.com/photo.jpg"
```

## Dependencies

| Package       | Version  | Purpose                          |
|---------------|----------|----------------------------------|
| express       | ^5.2.1   | HTTP server framework            |
| exifreader    | ^4.38.1  | EXIF metadata parser (active)    |
| exifr         | ^7.1.3   | Alternative EXIF parser (unused) |

## Configuration

The port defaults to `3000` locally. In production (e.g. Contentstack Launch), the `PORT` environment variable is set automatically and the server respects it:

```js
const PORT = process.env.PORT || 3000;
```

## Deploying to Contentstack Launch

1. Push this repo to GitHub.
2. In Contentstack Launch, create a new project and connect your GitHub repository.
3. When prompted for framework settings, use the following:

   | Setting          | Value           |
   |------------------|-----------------|
   | Framework Preset | Other           |
   | Build Command    | `npm install`   |
   | Output Directory | `.`             |
   | Server Command   | `npm start`     |

4. Click **Deploy**. Launch will install dependencies, start the server with `npm start`, and assign it a public URL.

The server reads `PORT` from the environment automatically — no code changes are needed.
