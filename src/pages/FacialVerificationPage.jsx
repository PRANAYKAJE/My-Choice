import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FacialCapture from '../components/FacialCapture';
import PhotoQualityCheck from '../components/PhotoQualityCheck';
import { theme } from '../styles/theme';
const { colors } = theme;

const FacialVerificationPage = () => {
  const navigate = useNavigate();
  const [capturedImage, setCapturedImage] = useState(null);
  const [showPhotoQualityCheck, setShowPhotoQualityCheck] = useState(false);

  const handleFacialCapture = useCallback((imageData) => {
    setCapturedImage(imageData);
    setShowPhotoQualityCheck(true);
  }, []);

  const handlePhotoQualityRetake = useCallback(() => {
    setCapturedImage(null);
    setShowPhotoQualityCheck(false);
  }, []);

  const handlePhotoQualityContinue = useCallback(() => {
    const verificationData = localStorage.getItem('userVerificationData');
    console.log('Facial verification completed:', verificationData ? JSON.parse(verificationData) : null);
    localStorage.setItem('facialVerified', 'true');
    navigate('/');
  }, [navigate]);

  const handleCancel = useCallback(() => {
    navigate('/');
  }, [navigate]);

  if (showPhotoQualityCheck && capturedImage) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: colors.backgroundGray }}
      >
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <PhotoQualityCheck
            capturedImage={capturedImage}
            onRetake={handlePhotoQualityRetake}
            onContinue={handlePhotoQualityContinue}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: colors.backgroundGray }}
    >
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <FacialCapture 
          onCapture={handleFacialCapture} 
          onSkip={handleCancel}
        />
      </div>
      <Footer />
    </div>
  );
};

export default FacialVerificationPage;
