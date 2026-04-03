import { useState, useRef, useEffect, useCallback, memo } from 'react';
import * as faceapi from 'face-api.js';
import { FiCheck, FiX, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const calculateEyeOpenRatio = (eyeLandmarks) => {
  const top = eyeLandmarks.slice(1, 4);
  const bottom = eyeLandmarks.slice(4, 7);
  const topAvg = top.reduce((acc, pt) => acc + pt.y, 0) / 3;
  const bottomAvg = bottom.reduce((acc, pt) => acc + pt.y, 0) / 3;
  const eyeHeight = Math.abs(topAvg - bottomAvg);
  const left = eyeLandmarks[0];
  const right = eyeLandmarks[3];
  const eyeWidth = Math.sqrt(Math.pow(right.x - left.x, 2) + Math.pow(right.y - left.y, 2));
  return eyeHeight / eyeWidth;
};

const initialRequirements = {
  clearPhoto: null,
  faceLookingDirectly: null,
  eyesOpen: null,
  neutralExpression: null,
  plainBackground: null,
};

const RequirementItem = memo(({ label, status }) => {
  if (status === null) {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="w-5 h-5 rounded-full border-2 border-gray-300 animate-pulse" />
        <span className="text-gray-600 text-sm">{label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${status ? 'bg-emerald-500' : 'bg-red-500'}`}>
        {status ? <FiCheck className="text-white text-xs" /> : <FiX className="text-white text-xs" />}
      </div>
      <span className={`text-sm ${status ? 'text-gray-800' : 'text-gray-500'}`}>{label}</span>
    </div>
  );
});

export default function PhotoQualityCheck({ onRetake, onContinue, capturedImage }) {
  const [requirements, setRequirements] = useState(initialRequirements);
  const [isValidating, setIsValidating] = useState(true);
  const [allPassed, setAllPassed] = useState(false);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const loadModels = useCallback(async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      return true;
    } catch (error) {
      console.error('Error loading face-api models:', error);
      return false;
    }
  }, []);

  const validatePhoto = useCallback(async (imageElement) => {
    const results = {
      clearPhoto: false,
      faceLookingDirectly: false,
      eyesOpen: false,
      neutralExpression: false,
      plainBackground: false,
    };

    try {
      const detection = await faceapi
        .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
        .withFaceLandmarks(true)
        .withFaceExpressions();

      if (!detection) return results;

      const { score, alignedRect } = detection.detection;
      const landmarks = detection.landmarks;
      const expressions = detection.expressions;

      results.clearPhoto = score > 0.8;

      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const leftEyeCenter = leftEye.reduce((acc, pt) => ({ x: acc.x + pt.x / 6, y: acc.y + pt.y / 6 }), { x: 0, y: 0 });
      const rightEyeCenter = rightEye.reduce((acc, pt) => ({ x: acc.x + pt.x / 6, y: acc.y + pt.y / 6 }), { x: 0, y: 0 });
      const eyeLevelDiff = Math.abs(leftEyeCenter.y - rightEyeCenter.y);
      const eyeDistance = Math.abs(leftEyeCenter.x - rightEyeCenter.x);
      const symmetryThreshold = eyeDistance * 0.05;
      results.faceLookingDirectly = eyeLevelDiff < symmetryThreshold;

      const leftEyeOpen = calculateEyeOpenRatio(leftEye);
      const rightEyeOpen = calculateEyeOpenRatio(rightEye);
      results.eyesOpen = leftEyeOpen > 0.2 && rightEyeOpen > 0.2;

      results.neutralExpression = expressions.neutral > 0.6;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = imageElement.width;
      canvas.height = imageElement.height;
      ctx.drawImage(imageElement, 0, 0);

      const faceBox = {
        x: Math.max(0, alignedRect.x - 20),
        y: Math.max(0, alignedRect.y - 20),
        width: Math.min(canvas.width - alignedRect.x + 20, alignedRect.width + 40),
        height: Math.min(canvas.height - alignedRect.y + 20, alignedRect.height + 40),
      };

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const bgPixels = [];

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const inFace = x >= faceBox.x && x <= faceBox.x + faceBox.width && y >= faceBox.y && y <= faceBox.y + faceBox.height;
          if (!inFace) {
            const idx = (y * canvas.width + x) * 4;
            bgPixels.push(imageData.data[idx], imageData.data[idx + 1], imageData.data[idx + 2]);
          }
        }
      }

      if (bgPixels.length > 0) {
        const bgSample = [];
        for (let i = 0; i < Math.min(bgPixels.length, 1000); i += 3) {
          bgSample.push((bgPixels[i] + bgPixels[i + 1] + bgPixels[i + 2]) / 3);
        }
        const mean = bgSample.reduce((a, b) => a + b, 0) / bgSample.length;
        const variance = bgSample.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / bgSample.length;
        results.plainBackground = variance < 1000;
      }

      return results;
    } catch (error) {
      console.error('Validation error:', error);
      return results;
    }
  }, []);

  useEffect(() => {
    const runValidation = async () => {
      setIsValidating(true);
      const modelsLoaded = await loadModels();
      if (!modelsLoaded) {
        setIsValidating(false);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = capturedImage;
      img.onload = async () => {
        imageRef.current = img;
        const results = await validatePhoto(img);
        setRequirements(results);
        setIsValidating(false);
        setAllPassed(Object.values(results).every(Boolean));
      };
      img.onerror = () => {
        setIsValidating(false);
      };
    };

    if (capturedImage) {
      runValidation();
    }
  }, [capturedImage, loadModels, validatePhoto]);

  const handleRetake = useCallback(() => {
    setRequirements(initialRequirements);
    setAllPassed(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    onRetake();
  }, [onRetake]);

  const handleContinue = useCallback(async () => {
    if (!allPassed) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    const maxSize = 400;
    const scale = Math.min(maxSize / img.width, maxSize / img.height);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL('image/jpeg', 0.8);

    const verificationData = {
      timestamp: Date.now(),
      imageBase64: base64Image,
      validationResults: { ...requirements },
      status: 'verified',
    };

    localStorage.setItem('userVerificationData', JSON.stringify(verificationData));
    onContinue();
  }, [allPassed, requirements, onContinue]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-3xl w-full overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Photo Quality Check</h2>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: '75%' }} />
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-3">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3]">
                {capturedImage && (
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                )}
                {isValidating && (
                  <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                    <FiRefreshCw className="text-emerald-600 text-3xl animate-spin mb-3" />
                    <span className="text-gray-700 font-medium">Analyzing photo quality...</span>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Photo Requirements</h3>
              <div className="space-y-1">
                <RequirementItem label="Clear Photo" status={requirements.clearPhoto} />
                <RequirementItem label="Face Looking Directly" status={requirements.faceLookingDirectly} />
                <RequirementItem label="Eyes Open" status={requirements.eyesOpen} />
                <RequirementItem label="Neutral Expression" status={requirements.neutralExpression} />
                <RequirementItem label="Plain Background" status={requirements.plainBackground} />
              </div>

              {!isValidating && !allPassed && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-start gap-2">
                  <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">
                    Some requirements are not met. Please retake your photo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex items-center justify-end gap-4">
          <button
            onClick={handleRetake}
            className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-800 font-semibold rounded-full hover:bg-gray-50 transition-colors"
          >
            Retake
          </button>
          <button
            onClick={handleContinue}
            disabled={!allPassed || isValidating}
            className={`px-8 py-3 font-semibold rounded-full transition-colors ${
              allPassed && !isValidating
                ? 'bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
