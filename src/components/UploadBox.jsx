import React, { useState, useRef } from "react";
import { theme } from "../styles/theme";
const { colors } = theme;
import { FiUpload } from "react-icons/fi";
import { extractTextFromImage, parsePassportData, parseDrivingLicenseData } from "../services/ocrService";

const UploadBox = ({ label, onDataExtracted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = async (selectedFile) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setProgress(0);

    if (selectedFile.type.startsWith("image/")) {
      try {
        const text = await extractTextFromImage(selectedFile, (p) => setProgress(p));
        const isPassport = label?.toLowerCase().includes('passport');
        const data = isPassport 
          ? parsePassportData(text) 
          : parseDrivingLicenseData(text);
        
        console.log('=== OCR Extracted Data ===');
        console.log('Type:', isPassport ? 'Passport' : 'Driving License');
        console.log('Name:', data.name || 'Not detected');
        console.log('Document Number:', data.licenseNumber || data.passportNumber || 'Not detected');
        console.log('DOB:', data.dateOfBirth || 'Not detected');
        
        setExtractedData(data);
        
        if (onDataExtracted) {
          onDataExtracted(selectedFile, text, data);
        }
      } catch (error) {
        console.error("OCR Error:", error);
      }
    }

    setIsProcessing(false);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
          isDragging ? "border-green-600 bg-green-50" : "hover:bg-green-50"
        }`}
        style={{
          borderColor: colors.borderGreen,
          backgroundColor: colors.lightGreenBg,
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        {file ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M12 18v-6" />
              <path d="m9 15 3-3 3 3" />
            </svg>
            <p className="text-sm font-medium text-green-700">
              {file.name}
            </p>
            {isProcessing && (
              <div className="w-full">
                <p className="text-xs mb-1" style={{ color: colors.textGray }}>
                  Processing OCR... {progress}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full transition-all" 
                    style={{ width: `${progress}%`, backgroundColor: colors.primary }}
                  />
                </div>
              </div>
            )}
            {extractedData && !isProcessing && (
              <div className="w-full mt-2 p-2 bg-white rounded text-xs text-left space-y-1">
                {extractedData.name && <p>Name: <span className="font-medium">{extractedData.name}</span></p>}
                {(extractedData.licenseNumber || extractedData.passportNumber) && (
                  <p>Doc: <span className="font-medium">{extractedData.licenseNumber || extractedData.passportNumber}</span></p>
                )}
                {extractedData.dateOfBirth && <p>DOB: <span className="font-medium">{extractedData.dateOfBirth}</span></p>}
              </div>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseClick();
              }}
              className="text-xs text-green-600 underline"
            >
              Change File
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <FiUpload className="text-green-600 text-2xl" />
            <p className="text-green-700 font-medium">
              {label}
            </p>
            <p className="text-xs text-gray-500">
              Drag and drop or browse
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadBox;
