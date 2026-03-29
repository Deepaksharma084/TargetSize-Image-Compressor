# TargetSize Image Compressor

A frontend-only React app to compress images to a target size (KB) with real-time preview for compressing images to a specific target size (KB) using client-side processing. This tool allows users to interactively adjust image quality with real-time feedback, ensuring the desired file size is met without ever uploading data to a server.

## Features

- **Local Processing:** 100% frontend-only. Images are processed in the browser; no data is ever uploaded to a backend.
- **Dynamic Target Sizing:** Use a slider to define a target file size (from 10KB up to the original size).
- **Target Size Control:** Compress images to a specific size (e.g., 20KB, 50KB) required by forms.
- **Quality Recovery:** Compression is always calculated from the original source to prevent generational quality loss when increasing size.
- **Real-Time Preview:** Side-by-side comparison of original and compressed images with live size statistics.
- **Smart Debouncing:** Implements a ~450ms delay to prevent UI freezing during rapid slider adjustments.
- **Performance Optimized:** Utilizes Web Workers to handle image processing off the main thread.
- **Preset Buttons:** Quick-select targets for common requirements (20KB, 50KB, 100KB).
- **Format Support:** Handles JPG, PNG, and WebP files.

## Tech Stack

- **Framework:** React 18 (Hooks)
- **Styling:** Tailwind CSS
- **Core Library:** `browser-image-compression`
- **Icons:** Lucide React
- **Build Tool:** Vite / Create React App

## Why This Tool

Many government and job portals require strict image size limits (20KB–100KB). This tool solves that problem directly in the browser without uploading files.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Deepaksharma084/TargetSize-Image-Compressor.git
   cd TargetSize-Image-Compressor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Usage

1. **Upload:** Drag and drop or click to upload an image (JPG, PNG, WebP).
2. **Adjust:** Move the slider to your desired target size in KB. The app will automatically begin compression after you stop moving the slider.
3. **Compare:** View the compressed result instantly. The "Reduction" badge shows how much space you've saved.
4. **Download:** Click the "Download Result" button to save the optimized image to your device.
5. **Reset:** Use the reset option to clear the current session and upload a different image.

## Demo

[Live Demo](#)  
()

## How It Works

### Compression Strategy
Unlike standard compressors that might chain compressions (causing rapid quality degradation), this app stores the **Original File** in memory. Every time the target size is changed, the app re-runs the compression algorithm against the original file. This allows the user to "recover" quality by moving the slider back toward the original size.

### Technical Implementation
- **Debounced Execution:** A `useEffect` hook combined with `useRef` manages a timer that triggers the compression function only after the user stops interacting with the slider for 450ms.
- **Memory Management:** The app utilizes `URL.createObjectURL` for fast image rendering. To prevent memory leaks, these URLs are explicitly revoked via `URL.revokeObjectURL` whenever a new image is processed or the component resets.
- **Non-Blocking UI:** By enabling `useWebWorker: true` in the compression options, the heavy mathematical operations are offloaded from the UI thread, keeping the interface responsive.

## Limitations

- **Browser Memory:** Very large images (e.g., >10MB or high-resolution DSLR photos) may hit browser memory limits or cause temporary latency depending on client hardware.
- **Extreme Compression:** Setting a target size below 20KB for high-resolution images will significantly impact visual fidelity (pixelation/artifacts).
- **Format Conversion:** The output format is generally preserved, but certain PNGs with high transparency may be converted to optimized formats to meet aggressive size targets.

## Future Improvements

- **Bulk Processing:** Ability to queue multiple images for the same target size.
- **Custom Dimensions:** Manual override for width/height resizing.
- **Format Switching:** Option to force convert to WebP for better compression ratios.
- **Exif Toggle:** Option to preserve or strip image metadata (EXIF data).
