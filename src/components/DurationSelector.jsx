import React from "react";
import { theme } from "../styles/theme";
const { colors } = theme;

const DurationSelector = ({ selectedDuration, onDurationChange }) => {
  const durations = [
    { value: 3, label: "3 Months" },
    { value: 6, label: "6 Months" },
    { value: 12, label: "12 Months" },
    { value: 24, label: "24 Months" },
  ];

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <label
        className="block text-xs sm:text-sm font-medium mb-2 sm:mb-3"
        style={{ color: colors.textBlack }}
      >
        Self-Exclusion Duration
      </label>
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4">
        {durations.map((duration) => (
          <button
            key={duration.value}
            onClick={() => onDurationChange(duration.value)}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full border-2 font-medium transition-all text-sm sm:text-base ${
              selectedDuration === duration.value
                ? "text-white"
                : "hover:border-green-500"
            }`}
            style={{
              backgroundColor:
                selectedDuration === duration.value
                  ? colors.primary
                  : "transparent",
              borderColor:
                selectedDuration === duration.value
                  ? colors.primary
                  : colors.borderGreen,
              color:
                selectedDuration === duration.value
                  ? "white"
                  : colors.textBlack,
            }}
          >
            {duration.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs sm:text-sm" style={{ color: colors.textGray }}>
        You can change your mind within 24 hours of making the request.
      </p>
    </div>
  );
};

export default DurationSelector;
