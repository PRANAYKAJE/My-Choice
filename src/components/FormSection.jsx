import React from "react";
import { theme } from "../styles/theme";
const { colors } = theme;

const DrivingLicenseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2"/>
    <line x1="2" x2="22" y1="10" y2="10"/>
  </svg>
);

const PassportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
  </svg>
);

const FormSection = ({ formData, setFormData, errors = {} }) => {
  const venues = [
    { name: "Prego Restaurant", address: "123 Queen Street, Auckland" },
    { name: "SkyCity Auckland", address: "Victoria Street West, Auckland" },
    { name: "The Casino", address: "45 Harbour Street, Auckland" },
    { name: "Gold Star Pub", address: "78 Queen Street, Auckland" },
  ];

  const ethnicities = [
    "NZ European",
    "Māori",
    "Pacific Islander",
    "Asian",
    "Other European",
    "Other",
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectEthnicity = (eth) => {
    if (eth === "Other") {
      handleChange("ethnicity", ["Other"]);
      handleChange("ethnicityOther", "");
    } else {
      handleChange("ethnicity", [eth]);
      handleChange("ethnicityOther", "");
    }
  };

  const fieldBase = "w-full border p-2 sm:p-3 rounded-md text-sm";
  const inputStyle = `${fieldBase} bg-white`;
  const staticStyle = `${fieldBase} bg-gray-50 text-gray-600`;

  const selectedVenue = venues.find(v => v.name === formData.venue);

  return (
    <div className="space-y-4 sm:space-y-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
          <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: colors.textGray }}>
            Select Venue
          </label>
          <select
            value={formData.venue || ""}
            onChange={(e) => handleChange("venue", e.target.value)}
            className={`${inputStyle} cursor-pointer`}
            style={{ borderColor: errors.venue ? '#DC2626' : colors.borderGreen }}
          >
            <option value="">Select a venue...</option>
            {venues.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
          {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue}</p>}
          
          {selectedVenue && (
            <div 
              className="mt-3 p-3 rounded-lg border-2"
              style={{ backgroundColor: colors.lightGreenBg, borderColor: colors.primary }}
            >
              <p className="font-medium text-sm" style={{ color: colors.textBlack }}>{selectedVenue.name}</p>
              <p className="text-xs text-gray-500 mt-1">{selectedVenue.address}</p>
              <p className="text-xs font-bold text-green-600 mb-1">Full Venue Exclusion</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:col-span-2">
            <div>
            <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: colors.textGray }}>
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.dateOfBirth || ""}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              className={inputStyle}
              style={{ borderColor: errors.dateOfBirth ? '#DC2626' : colors.borderGreen }}
            />
            {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
          </div>

            <div>
            <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: colors.textGray }}>
              Gender <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1 sm:gap-2">
              {["Male", "Female", "Other"].map((g) => (
                <button
                  key={g}
                  onClick={() => handleChange("gender", g)}
                  className="flex-1 border px-2 sm:px-3 py-2 sm:py-3 rounded-md text-xs sm:text-sm transition-colors"
                  style={{
                    backgroundColor: formData.gender === g ? colors.primary : 'white',
                    borderColor: errors.gender ? '#DC2626' : colors.borderGreen,
                    color: formData.gender === g ? "white" : colors.textBlack,
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: colors.textGray }}>
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter your full name"
            className={inputStyle}
            style={{ borderColor: errors.name ? '#DC2626' : colors.borderGreen }}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: colors.textGray }}>
            Mobile Number
          </label>
          <input
            type="tel"
            value={formData.mobile || ""}
            onChange={(e) => handleChange("mobile", e.target.value)}
            placeholder="Enter your mobile number"
            className={inputStyle}
            style={{ borderColor: errors.mobile ? '#DC2626' : colors.borderGreen }}
          />
          {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: colors.textGray }}>
          Ethnicity
        </label>
        <div className="flex flex-wrap gap-2">
          {ethnicities.map((eth) => (
            <button
              key={eth}
              onClick={() => selectEthnicity(eth)}
              className="border px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm transition-colors"
              style={{
                backgroundColor: (formData.ethnicity || []).includes(eth) ? colors.primary : 'white',
                borderColor: errors.ethnicity ? '#DC2626' : colors.borderGreen,
                color: (formData.ethnicity || []).includes(eth) ? "white" : colors.textBlack,
              }}
            >
              {eth}
            </button>
          ))}
        </div>
        {errors.ethnicity && <p className="text-red-500 text-xs mt-1">{errors.ethnicity}</p>}
        
        {(formData.ethnicity || []).includes("Other") && (
          <div className="mt-3">
            <input
              type="text"
              value={formData.ethnicityOther || ""}
              onChange={(e) => handleChange("ethnicityOther", e.target.value)}
              placeholder="Please specify your ethnicity"
              className={inputStyle}
              style={{ borderColor: colors.borderGreen }}
            />
          </div>
        )}
      </div>

      <div className="hidden sm:block">
        <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: colors.textGray }}>
          Document Type
        </label>
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div>
            <div className={staticStyle} style={{ borderColor: colors.borderGreen }}>
              <div className="flex items-center gap-2">
                <DrivingLicenseIcon />
                <span className="text-sm">Driving Licence</span>
              </div>
            </div>
          </div>

          <div>
            <div className={staticStyle} style={{ borderColor: colors.borderGreen }}>
              <div className="flex items-center gap-2">
                <PassportIcon />
                <span className="text-sm">Passport</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: colors.textGray }}>
            Driving Licence Number
          </label>
          <input
            type="text"
            value={formData.licenseNumber || ""}
            onChange={(e) => handleChange("licenseNumber", e.target.value)}
            placeholder="Enter licence number"
            className={inputStyle}
            style={{ borderColor: colors.borderGreen }}
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: colors.textGray }}>
            Passport Number
          </label>
          <input
            type="text"
            value={formData.passportNumber || ""}
            onChange={(e) => handleChange("passportNumber", e.target.value)}
            placeholder="Enter passport number"
            className={inputStyle}
            style={{ borderColor: colors.borderGreen }}
          />
        </div>
      </div>
    </div>
  );
};

export default FormSection;
