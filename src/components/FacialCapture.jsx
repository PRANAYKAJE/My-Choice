import React, { useEffect, useRef, useState } from 'react';
import { FiCamera, FiX } from 'react-icons/fi';

const FacialCapture = ({ onCapture, onSkip }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    let currentStream = null;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        
        currentStream = mediaStream;
        
        if (mounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        if (mounted) {
          setError("Unable to access camera. Please allow camera permissions.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      currentStream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      const videoWidth = video.videoWidth || 640;
      const videoHeight = video.videoHeight || 480;
      
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      context.fillStyle = '#1F2937';
      context.fillRect(0, 0, canvas.width, canvas.height);

      const scale = Math.min(canvas.width / videoWidth, canvas.height / videoHeight);
      const x = (canvas.width - videoWidth * scale) / 2;
      const y = (canvas.height - videoHeight * scale) / 2;

      context.drawImage(video, x, y, videoWidth * scale, videoHeight * scale);

      const imageData = canvas.toDataURL('image/jpeg', 0.9);

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      onCapture(imageData);
    }
  };

  const handleSkip = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onSkip();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Facial Verification</h2>
        <p className="text-gray-500 text-xs">Position your face in the center of the frame.</p>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '25%' }} />
        </div>
      </div>

      <div className="relative bg-gray-900" style={{ aspectRatio: '4/3' }}>
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-sm">Starting camera...</span>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-400 text-center p-4 z-10">
            <span>{error}</span>
          </div>
        )}

        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-40 h-52 border-4 border-dashed border-white/50 rounded-3xl"></div>
        </div>
      </div>

      <div className="p-4 bg-white flex items-center justify-between">
        <button
          onClick={handleSkip}
          className="px-4 py-2 text-gray-500 font-medium hover:text-gray-800 transition-colors flex items-center gap-2 text-sm"
        >
          <FiX /> Cancel
        </button>
        
        <button
          onClick={handleCapture}
          disabled={isLoading || !!error}
          className="w-14 h-14 rounded-full bg-emerald-700 text-white flex items-center justify-center hover:bg-emerald-800 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          aria-label="Capture Photo"
        >
          <FiCamera className="text-xl" />
        </button>
        
        <div className="w-16"></div>
      </div>
    </div>
  );
};

export default FacialCapture;
