import React, { useState, useEffect, useCallback, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { Upload, Download, Image as ImageIcon, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const ImageCompressor = () => {
  // State for Images
  const [originalFile, setOriginalFile] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);
  const [previewUrls, setPreviewUrls] = useState({ original: '', compressed: '' });

  // State for Controls
  const [targetSizeKB, setTargetSizeKB] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionStats, setCompressionStats] = useState({ originalSize: 0, currentSize: 0 });

  const debounceTimer = useRef(null);

  // Handle File Upload
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset state for new image
    if (previewUrls.original) URL.revokeObjectURL(previewUrls.original);
    if (previewUrls.compressed) URL.revokeObjectURL(previewUrls.compressed);

    const sizeKB = Math.round(file.size / 1024);
    setOriginalFile(file);
    setTargetSizeKB(Math.min(sizeKB, 200)); // Default to 200KB or original
    setCompressionStats({ originalSize: sizeKB, currentSize: 0 });
    setPreviewUrls({
      original: URL.createObjectURL(file),
      compressed: ''
    });
    setCompressedFile(null);
  };

  // Compression Logic (Always from original)
  const compressImage = useCallback(async (targetKB) => {
    if (!originalFile) return;

    setIsProcessing(true);
    try {
      const options = {
        maxSizeMB: targetKB / 1024, // Convert KB to MB
        maxWidthOrHeight: 1920,      // Reasonable limit for web
        useWebWorker: true,
        initialQuality: 0.8,
      };

      // Always compress from the originalFile to allow quality recovery
      const blob = await imageCompression(originalFile, options);

      const compressed = new File([blob], originalFile.name, {
        type: originalFile.type,
      });

      if (previewUrls.compressed) URL.revokeObjectURL(previewUrls.compressed);

      setCompressedFile(compressed);
      setPreviewUrls(prev => ({
        ...prev,
        compressed: URL.createObjectURL(compressed)
      }));
      setCompressionStats(prev => ({
        ...prev,
        currentSize: Math.round(compressed.size / 1024)
      }));
    } catch (error) {
      console.error("Compression Error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [originalFile]);

  // Debounced Effect: Trigger compression when targetSizeKB changes
  useEffect(() => {
    if (!originalFile) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      compressImage(targetSizeKB);
    }, 450); // 450ms debounce

    return () => clearTimeout(debounceTimer.current);
  }, [targetSizeKB, originalFile, compressImage]);

  // Download Handler
  const handleDownload = () => {
    if (!compressedFile) return;
    const link = document.createElement('a');
    link.href = previewUrls.compressed;
    link.download = `compressed_${originalFile.name}`;
    link.click();
  };

  const reductionPercent = compressionStats.originalSize
    ? Math.round(((compressionStats.originalSize - compressionStats.currentSize) / compressionStats.originalSize) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-2">
            <ImageIcon className="text-blue-600" /> Professional Image Optimizer
          </h1>
          <p className="text-slate-500 mt-2">Browser-based. Private. Real-time.</p>
        </header>

        {!originalFile ? (
          /* Upload Zone */
          <div className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-2xl p-12 text-center hover:border-blue-400 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="mx-auto mb-4 text-blue-500" size={48} />
            <h3 className="text-lg font-semibold">Click or Drag & Drop</h3>
            <p className="text-sm text-slate-500">Supports JPG, PNG, WebP (Max 10MB recommended)</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Controls Panel */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg">Target Size</h2>
                <button
                  onClick={() => setOriginalFile(null)}
                  className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Reset
                </button>
              </div>

              {/* Slider */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{targetSizeKB} KB</span>
                    <span className="text-xs text-slate-400">Max: {compressionStats.originalSize} KB</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max={compressionStats.originalSize}
                    value={targetSizeKB}
                    onChange={(e) => setTargetSizeKB(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Presets */}
                <div className="grid grid-cols-3 gap-2">
                  {[20, 50, 100].map(val => (
                    <button
                      key={val}
                      onClick={() => setTargetSizeKB(Math.min(val, compressionStats.originalSize))}
                      className="py-2 text-sm border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all"
                    >
                      {val}KB
                    </button>
                  ))}
                </div>

                {/* Warning */}
                {targetSizeKB < 20 && (
                  <div className="flex gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100 text-amber-700 text-xs">
                    <AlertCircle size={16} className="shrink-0" />
                    <p>Very low target sizes may result in significant pixelation.</p>
                  </div>
                )}

                {/* Stats Card */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Original:</span>
                    <span className="font-mono">{compressionStats.originalSize} KB</span>
                  </div>

                  <div>
                    
                  </div>
                
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Compressed:</span>
                    <span className={`font-mono font-bold ${isProcessing ? 'animate-pulse' : 'text-green-600'}`}>
                      {compressionStats.currentSize} KB
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Reduction</span>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm font-bold">
                      {reductionPercent > 0 ? reductionPercent : 0}%
                    </span>
                  </div>
                </div>

                <button
                  disabled={isProcessing || !compressedFile}
                  onClick={handleDownload}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-100"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : <Download size={20} />}
                  Download Result
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative min-h-100 flex flex-col">
                <div className="flex border-b border-slate-100">
                  <div className="px-4 py-2 text-xs font-bold text-slate-400 border-r border-slate-100 uppercase">Live Preview</div>
                  {isProcessing && (
                    <div className="px-4 py-2 text-xs font-bold text-blue-500 flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin" /> Processing...
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50">
                  {/* Original */}
                  <div className="flex-1 p-4 flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest">Original</span>
                    <div className="relative flex-1 flex items-center justify-center">
                      <img
                        src={previewUrls.original}
                        alt="Original"
                        className="max-h-75 object-contain rounded shadow-sm bg-white"
                      />
                    </div>
                  </div>

                  {/* Compressed */}
                  <div className="flex-1 p-4 flex flex-col items-center bg-white">
                    <span className="text-[10px] uppercase font-bold text-blue-500 mb-2 tracking-widest">Compressed</span>
                    <div className="relative flex-1 flex items-center justify-center">
                      {previewUrls.compressed ? (
                        <img
                          src={previewUrls.compressed}
                          alt="Compressed"
                          className={`max-h-75 object-contain rounded shadow-md transition-opacity duration-300 ${isProcessing ? 'opacity-50' : 'opacity-100'}`}
                        />
                      ) : (
                        <div className="h-48 w-full flex items-center justify-center text-slate-300">
                          <Loader2 className="animate-spin" size={32} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-slate-400 italic">
                Images are processed entirely in your browser. No data ever leaves your device.
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCompressor;