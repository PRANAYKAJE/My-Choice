import React from "react";
import { theme } from "../styles/theme";
const { colors } = theme;

const PersonalDetailsCard = ({ userData, onChange }) => {
  const {
    name,
    email,
    mobile,
    dob,
    identityType,
    idNumber,
    hasDrivingLicense,
    hasPassport,
    drivingLicenseNumber,
    passportNumberDisplay,
    gender,
    ethnicity,
  } = userData || {};

  const handleChange = (field, value) => {
    if (onChange) {
      onChange(field, value);
    }
  };

  const icons = {
    phone: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    calendar: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
        <line x1="16" x2="16" y1="2" y2="6"/>
        <line x1="8" x2="8" y1="2" y2="6"/>
        <line x1="3" x2="21" y1="10" y2="10"/>
      </svg>
    ),
    id: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2"/>
        <line x1="2" x2="22" y1="10" y2="10"/>
      </svg>
    ),
    document: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
    user: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    globe: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
        <path d="M2 12h20"/>
      </svg>
    ),
  };

  return (
    <div
      className="bg-[#E7F5EC] border border-[#A7D7C5] rounded-lg p-3 sm:p-4 md:p-6"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <h2 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4" style={{ color: colors.textBlack }}>
        Personal Details
      </h2>
      
      <div className="flex items-center gap-3 sm:gap-4">
        <div 
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: colors.primary }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 truncate">{name || '-'}</h3>
          <p className="text-xs sm:text-sm text-gray-600 truncate">{email || '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mt-4">
        <div className="flex items-start gap-1 sm:gap-2">
          <span className="flex-shrink-0 mt-0.5" style={{ color: colors.primary }}>{icons.phone}</span>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-gray-500 block">Mobile:</span>
            <input
              type="text"
              value={mobile || ""}
              onChange={(e) => handleChange("mobile", e.target.value)}
              placeholder="Mobile"
              className="text-xs sm:text-sm bg-transparent border-b border-gray-300 focus:border-green-500 outline-none py-1 w-full"
            />
          </div>
        </div>

        <div className="flex items-start gap-1 sm:gap-2">
          <span className="flex-shrink-0 mt-0.5" style={{ color: colors.primary }}>{icons.calendar}</span>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-gray-500 block">DOB:</span>
            <span className="text-xs sm:text-sm text-gray-900 truncate block">{dob || '-'}</span>
          </div>
        </div>

        <div className="flex items-start gap-1 sm:gap-2">
          <span className="flex-shrink-0 mt-0.5" style={{ color: colors.primary }}>{icons.user}</span>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-gray-500 block">Gender:</span>
            <span className="text-xs sm:text-sm text-gray-900 truncate block">{gender || '-'}</span>
          </div>
        </div>

        <div className="flex items-start gap-1 sm:gap-2">
          <span className="flex-shrink-0 mt-0.5" style={{ color: colors.primary }}>{icons.globe}</span>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-gray-500 block">Ethnicity:</span>
            <span className="text-xs sm:text-sm text-gray-900 truncate block">{ethnicity || '-'}</span>
          </div>
        </div>

        <div className="flex items-start gap-1 sm:gap-2">
          <span className="flex-shrink-0 mt-0.5" style={{ color: colors.primary }}>{icons.id}</span>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-gray-500 block">ID Type:</span>
            <span className="text-xs sm:text-sm text-gray-900 truncate block">{identityType || '-'}</span>
          </div>
        </div>

        <div className="flex items-start gap-1 sm:gap-2">
          <span className="flex-shrink-0 mt-0.5" style={{ color: colors.primary }}>{icons.document}</span>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-gray-500 block">ID No:</span>
            {hasDrivingLicense && hasPassport ? (
              <div className="text-xs sm:text-sm">
                <span className="text-gray-900">{passportNumberDisplay}</span>
                <span className="text-gray-400 mx-1">/</span>
                <span className="text-gray-900">{drivingLicenseNumber}</span>
              </div>
            ) : (
              <span className="text-xs sm:text-sm text-gray-900 truncate block">{idNumber || '-'}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsCard;
