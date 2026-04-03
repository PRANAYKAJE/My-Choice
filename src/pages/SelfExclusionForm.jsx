import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PersonalDetailsCard from "../components/PersonalDetailsCard";
import FormSection from "../components/FormSection";
import UploadBox from "../components/UploadBox";
import AddressSearch from "../components/AddressSearch";
import DurationSelector from "../components/DurationSelector";
import Footer from "../components/Footer";
import ConsentModal from "../components/ConsentModal";
import { theme } from "../styles/theme";
const { colors } = theme;
import { validateData } from "../services/ocrService";

const SelfExclusionForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    venue: "",
    dateOfBirth: "",
    gender: "",
    ethnicity: [],
    identityType: "driving",
    licenseNumber: "",
    passportNumber: "",
    duration: 3,
    name: "",
    email: "",
    mobile: "",
  });

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [ocrData, setOcrData] = useState({
    name: "",
    licenseNumber: "",
    licenseDateOfBirth: "",
    passportNumber: "",
    passportDateOfBirth: "",
    hasDrivingLicense: false,
    hasPassport: false,
  });
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allAccepted, setAllAccepted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleFormChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const handleDurationChange = (duration) => {
    setFormData((prev) => ({ ...prev, duration }));
  };

  const handleLicenseUpload = (file, extractedText, extractedData) => {
    setOcrData((prev) => ({
      ...prev,
      name: extractedData.name || prev.name,
      licenseNumber: extractedData.licenseNumber || prev.licenseNumber,
      licenseDateOfBirth: extractedData.dateOfBirth || prev.licenseDateOfBirth,
      hasDrivingLicense: true,
    }));
  };

  const handlePassportUpload = (file, extractedText, extractedData) => {
    setOcrData((prev) => ({
      ...prev,
      name: extractedData.name || prev.name,
      passportNumber: extractedData.passportNumber || prev.passportNumber,
      passportDateOfBirth: extractedData.dateOfBirth || prev.passportDateOfBirth,
      hasPassport: true,
    }));
  };

  const computedVerification = useMemo(() => {
    const hasOcrData = ocrData.hasDrivingLicense || ocrData.hasPassport;
    if (hasOcrData) {
      const result = validateData(formData, ocrData);
      return { ...result, isVerified: result.allMatch };
    }
    return { allMatch: false, isVerified: false };
  }, [formData, ocrData]);

  useEffect(() => {
    setVerificationStatus(computedVerification);
    setIsVerified(computedVerification.isVerified);
  }, [computedVerification]);

  const handleViewConsents = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = "Please enter your full name";
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Please enter your date of birth";
    }
    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    const hasDocument = ocrData.hasDrivingLicense || ocrData.hasPassport;
    if (!hasDocument) {
      newErrors.document = "Please upload your Driving Licence or Passport";
    }

    if (hasDocument && !isVerified) {
      newErrors.document = "Entered details do not match uploaded document";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsModalOpen(true);
  };

  const handleAgree = () => {
    if (allAccepted) {
      setIsModalOpen(false);
      navigate('/facial-verification');
    }
  };

  const handleConsentChange = (consents) => {
    const allChecked = Object.values(consents).every(Boolean);
    setAllAccepted(allChecked);
  };

  const handleFormSubmit = () => {
    const facialVerified = localStorage.getItem('facialVerified') === 'true';
    console.log("Form submitted:", { ...formData, selectedAddress, facialVerified });
    alert("Self-exclusion request submitted successfully!");
    localStorage.removeItem('facialVerified');
  };

  const hasAnyDocument = ocrData.hasDrivingLicense || ocrData.hasPassport;

  const getEthnicityDisplay = () => {
    const eth = formData.ethnicity?.[0];
    if (eth === "Other") {
      return formData.ethnicityOther || "Other";
    }
    return eth || "";
  };

  const userData = {
    name: formData.name,
    email: formData.email,
    mobile: formData.mobile,
    dob: formData.dateOfBirth,
    identityType: ocrData.hasPassport && ocrData.hasDrivingLicense 
      ? "Passport / Driving Licence" 
      : ocrData.hasPassport 
        ? "Passport" 
        : ocrData.hasDrivingLicense 
          ? "Driving Licence" 
          : "",
    idNumber: ocrData.hasPassport && ocrData.hasDrivingLicense 
      ? `${ocrData.passportNumber} / ${ocrData.licenseNumber}`
      : ocrData.passportNumber || ocrData.licenseNumber || "",
    hasDrivingLicense: ocrData.hasDrivingLicense,
    hasPassport: ocrData.hasPassport,
    drivingLicenseNumber: ocrData.licenseNumber,
    passportNumberDisplay: ocrData.passportNumber,
    gender: formData.gender,
    ethnicity: getEthnicityDisplay(),
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: colors.backgroundGray }}
    >
      <Navbar />

      <main className="flex-1 p-4 md:p-10">
        <div className="max-w-4xl mx-auto">
          <div
            className="bg-white rounded-xl shadow-lg p-6 md:p-10"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <div className="text-left mb-6 sm:mb-8">
              <h1
                className="text-xl sm:text-2xl md:text-3xl font-bold mb-2"
                style={{ color: colors.textBlack }}
              >
                Free Online Self-Exclusion
              </h1>
              <p className="text-sm sm:text-base" style={{ color: colors.textGray }}>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt quasi sit dolorum sint dolores necessitatibus suscipit fugit sed blanditiis numquam, reprehenderit eius unde voluptatum rem cumque nulla at distinctio porro!
              </p>
            </div>

            <div className="mb-6 sm:mb-8">
              <PersonalDetailsCard userData={userData} onChange={handleFormChange} />
            </div>

            <div className="mb-6 sm:mb-8">
              <h2
                className="text-lg sm:text-xl font-bold mb-4 sm:mb-6"
                style={{ color: colors.textBlack }}
              >
                Form Details
              </h2>
              <FormSection formData={formData} setFormData={setFormData} onFormChange={handleFormChange} errors={errors} />
            </div>

            <div className="mb-6 sm:mb-8">
              <h2
                className="text-lg sm:text-xl font-bold mb-3 sm:mb-4"
                style={{ color: colors.textBlack }}
              >
                Document Upload <span className="text-red-500">*</span>
              </h2>
              <p className="text-xs sm:text-sm mb-3 sm:mb-4" style={{ color: colors.textGray }}>
                Upload either your Driving Licence or Passport to verify your identity
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <UploadBox
                  label="Upload Driving Licence"
                  onDataExtracted={handleLicenseUpload}
                />
                <UploadBox
                  label="Upload Passport"
                  onDataExtracted={handlePassportUpload}
                />
              </div>
              {errors.document && (
                <p className="text-red-500 text-xs sm:text-sm mt-2">{errors.document}</p>
              )}

              {hasAnyDocument && verificationStatus && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg" style={{ backgroundColor: isVerified ? colors.lightGreenBg : '#FEE2E2' }}>
                  <div className="flex items-start gap-2 sm:gap-3">
                    {isVerified ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base" style={{ color: isVerified ? colors.primary : '#DC2626' }}>
                        {isVerified ? 'Identity Verified' : 'Entered details do not match uploaded document'}
                      </p>
                      <div className="mt-1 sm:mt-2 space-y-1">
                        {ocrData.hasDrivingLicense && (
                          <p className="text-xs sm:text-sm flex items-center gap-2">
                            <span style={{ color: verificationStatus.licenseMatch ? colors.primary : '#DC2626' }}>
                              {verificationStatus.licenseMatch ? '✓' : '✗'}
                            </span>
                            Driving Licence: {ocrData.licenseNumber || 'Not detected'}
                          </p>
                        )}
                        {ocrData.hasPassport && (
                          <p className="text-xs sm:text-sm flex items-center gap-2">
                            <span style={{ color: verificationStatus.passportMatch ? colors.primary : '#DC2626' }}>
                              {verificationStatus.passportMatch ? '✓' : '✗'}
                            </span>
                            Passport: {ocrData.passportNumber || 'Not detected'}
                          </p>
                        )}
                        {formData.name && (
                          <p className="text-xs sm:text-sm flex items-center gap-2">
                            <span style={{ color: verificationStatus.nameMatch ? colors.primary : '#DC2626' }}>
                              {verificationStatus.nameMatch ? '✓' : '✗'}
                            </span>
                            Name: {formData.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6 sm:mb-8">
              {/* <h2
                className="text-lg sm:text-xl font-bold mb-3 sm:mb-6"
                style={{ color: colors.textBlack }}
              >
                Address <span className="text-red-500">*</span>
              </h2> */}
              <AddressSearch onAddressSelect={setSelectedAddress} selectedAddress={selectedAddress} />
              {errors.address && (
                <p className="text-red-500 text-xs sm:text-sm mt-2">{errors.address}</p>
              )}
            </div>

            <div className="mb-6 sm:mb-8">
              <h2
                className="text-lg sm:text-xl font-bold mb-3 sm:mb-6"
                style={{ color: colors.textBlack }}
              >
                Duration
              </h2>
              <DurationSelector
                selectedDuration={formData.duration}
                onDurationChange={handleDurationChange}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleViewConsents}
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-semibold text-sm sm:text-lg transition-all hover:opacity-90 hover:shadow-lg"
                style={{ backgroundColor: colors.primary }}
              >
                View Consents
              </button>
            </div>

            {localStorage.getItem('facialVerified') === 'true' && (
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 text-center">
                <button
                  onClick={handleFormSubmit}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-semibold text-sm sm:text-lg transition-all hover:opacity-90 hover:shadow-lg"
                  style={{ backgroundColor: colors.primary }}
                >
                  Submit Form
                </button>
                <p className="text-xs sm:text-sm mt-2" style={{ color: colors.primary }}>
                  Facial verification completed!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <ConsentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAgree={handleAgree}
        onConsentChange={handleConsentChange}
      />
    </div>
  );
};

export default SelfExclusionForm;
