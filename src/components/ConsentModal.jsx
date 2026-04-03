import React from "react";
import { theme } from "../styles/theme";
const { colors } = theme;

const ConsentModal = ({ isOpen, onClose, onAgree, onConsentChange }) => {
  const [consents, setConsents] = React.useState({
    c1: false,
    c2: false,
    c3: false,
    c4: false,
    c5: false,
  });

  const [allAccepted, setAllAccepted] = React.useState(false);

  const consentItems = [
    {
      key: "c1",
      text: "I confirm that I am voluntarily requesting self-exclusion from gambling activities.",
    },
    {
      key: "c2",
      text: "I understand that this self-exclusion will prevent me from entering gambling venues.",
    },
    {
      key: "c3",
      text: "I acknowledge that my personal information may be shared with relevant gambling operators.",
    },
    {
      key: "c4",
      text: "I agree to the minimum self-exclusion period of the selected duration.",
    },
    {
      key: "c5",
      text: "I understand that I cannot reverse this decision during the exclusion period.",
    },
  ];

  React.useEffect(() => {
    if (onConsentChange) {
      onConsentChange(consents);
    }
  }, [consents, onConsentChange]);

  const handleChange = (key) => {
    const updated = { ...consents, [key]: !consents[key] };
    setConsents(updated);
    const allChecked = Object.values(updated).every(Boolean);
    setAllAccepted(allChecked);
  };

  const handleSelectAll = () => {
    const newState = !allAccepted;
    const updated = Object.keys(consents).reduce((acc, key) => {
      acc[key] = newState;
      return acc;
    }, {});
    setConsents(updated);
    setAllAccepted(newState);
  };

  const handleAgree = () => {
    const allChecked = Object.values(consents).every(Boolean);
    if (allChecked) {
      onAgree();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2" style={{ color: colors.textBlack }}>
            Exclusion Consents
          </h2>
          <p className="text-sm" style={{ color: colors.textGray }}>
            Please read and agree to all the following terms to proceed with your self-exclusion request.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {consentItems.map((item) => (
            <label
              key={item.key}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={consents[item.key]}
                onChange={() => handleChange(item.key)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm" style={{ color: colors.textBlack }}>
                {item.text}
              </span>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.borderGreen }}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allAccepted}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm font-medium" style={{ color: colors.textBlack }}>
              Select All
            </span>
          </label>

          <button
            onClick={handleAgree}
            disabled={!allAccepted}
            className="px-8 py-3 rounded-full text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: allAccepted ? colors.primary : "#9CA3AF" }}
          >
            Agree
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ConsentModal;
