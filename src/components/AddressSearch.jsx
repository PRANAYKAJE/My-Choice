import React, { useState } from "react";
import { theme } from "../styles/theme";
const { colors } = theme;

const AddressSearch = ({ onAddressSelect }) => {
  const [address, setAddress] = useState("");

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    if (onAddressSelect) {
      onAddressSelect(value ? { fullAddress: value } : null);
    }
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <label
        className="block text-xs sm:text-sm font-medium mb-2"
        style={{ color: colors.textGray }}
      >
        Address
      </label>
      <textarea
        value={address}
        onChange={handleAddressChange}
        placeholder="Enter your full address"
        rows="3"
        className="w-full border p-2 sm:p-3 rounded-lg text-sm resize-none"
        style={{ borderColor: colors.borderGreen }}
      />
    </div>
  );
};

export default AddressSearch;
