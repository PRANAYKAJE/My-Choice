import Tesseract from 'tesseract.js';

// --- 1. Normalization Utilities ---

export const normalize = (str) => {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const exactMatch = (a, b) => {
  if (!a || !b) return false;
  return normalize(a) === normalize(b);
};

export const fuzzyMatch = (a, b) => {
  if (!a || !b) return false;
  const normA = normalize(a);
  const normB = normalize(b);
  if (normA === normB) return true;
  if (normA.includes(normB) || normB.includes(normA)) return true;
  return false;
};

// --- Smart Date Normalizer ---
// Converts any date format to YYYYMMDD for comparison
// Supports: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY (NZ/AU format)
export const normalizeDate = (dateStr) => {
  if (!dateStr) return '';
  
  const clean = dateStr.trim();
  
  // Extract all numbers from the string
  const numbers = clean.match(/\d+/g);
  if (!numbers || numbers.length < 3) return clean;
  
  // Get parts and pad them
  let parts = numbers.map(n => n.length <= 2 ? n.padStart(2, '0') : n);
  
  let year, month, day;
  
  // Check if first part is a year (4 digits)
  if (parts[0].length === 4) {
    // YYYY-MM-DD format
    year = parts[0];
    month = parts[1];
    day = parts[2] || '01';
  } else {
    // DD-MM-YYYY or DD/MM/YYYY format (NZ/AU standard)
    day = parts[0];
    month = parts[1];
    year = parts[2];
    
    // Handle 2-digit year
    if (year.length === 2) {
      const yearNum = parseInt(year);
      year = yearNum <= 30 ? '20' + year : '19' + year;
    }
  }
  
  // Validate values
  const monthNum = parseInt(month);
  const dayNum = parseInt(day);
  
  // If month > 12, it's likely swapped (US format MM/DD/YYYY)
  if (monthNum > 12 && dayNum <= 12) {
    [month, day] = [day, month];
  }
  
  // Validate month range
  if (monthNum < 1 || monthNum > 12) {
    return clean;
  }
  
  // Validate day range (basic check)
  if (dayNum < 1 || dayNum > 31) {
    return clean;
  }
  
  return `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`;
};

// --- 2. OCR Extraction ---

export const extractTextFromImage = async (file, onProgress = () => {}) => {
  const result = await Tesseract.recognize(
    file,
    'eng',
    {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          onProgress(Math.round(m.progress * 100));
        }
      },
    }
  );
  return result.data.text;
};

// --- 3. MRZ Parser (Passport) ---
const parseMRZ = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  let mrzLines = [];
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i];
    if (line.length > 28 && (line.includes('<') || /^[A-Z0-9<]+$/.test(line))) {
      const nextLine = lines[i+1];
      if (nextLine && nextLine.length > 28 && (nextLine.includes('<') || /^[A-Z0-9<]+$/.test(nextLine))) {
        mrzLines = [line, nextLine];
        break;
      }
    }
  }

  if (mrzLines.length < 2) return null;

  const line1 = mrzLines[0]; 
  const line2 = mrzLines[1]; 

  // Parse Name
  let name = '';
  if (line1.startsWith('P<')) {
    const namePart = line1.substring(2);
    const parts = namePart.split('<<');
    const surname = parts[0].replace(/</g, ' ').trim();
    const givenNames = parts[1] ? parts[1].replace(/</g, ' ').trim() : '';
    name = `${surname} ${givenNames}`.trim();
  }

  // Parse Passport Number
  const rawPassport = line2.substring(0, 9).replace(/</g, '');

  // Parse DOB
  let dob = '';
  if (line2.length >= 19) {
    const dobRaw = line2.substring(13, 19);
    if (/^\d{6}$/.test(dobRaw)) {
      const year = dobRaw.substring(0, 2);
      const month = dobRaw.substring(2, 4);
      const day = dobRaw.substring(4, 6);
      const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
      dob = `${month}/${day}/${fullYear}`;
    }
  }

  return { name, passportNumber: rawPassport, dateOfBirth: dob };
};

// --- 4. Passport Parser ---
export const parsePassportData = (text) => {
  const mrzData = parseMRZ(text);
  if (mrzData && mrzData.name && mrzData.passportNumber) {
    return { ...mrzData, rawText: text };
  }

  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  let extractedName = '';
  let passportNumber = '';
  let dateOfBirth = '';

  const namePatterns = [
    /name\s*[:]?\s*([A-Z\s]+)/i,
    /^([A-Z]{2,}\s+[A-Z]{2,})/,
    /surname\s*[:]?\s*([A-Z\s]+)/i,
    /given\s*names?\s*[:]?\s*([A-Z\s]+)/i,
  ];

  for (const line of lines) {
    if (line.length > 30 && /^[A-Z0-9<]+$/.test(line)) continue;
    for (const pattern of namePatterns) {
      const match = line.match(pattern);
      if (match) {
        let rawName = (match[1] || match[0]).trim();
        rawName = rawName.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ');
        if (rawName.split(' ').length >= 2 && rawName.length > 3) {
          extractedName = rawName;
          break;
        }
      }
    }
    if (extractedName) break;
  }

  const passportPatterns = [
    /No\s*\.?\s*([A-Z0-9<]{6,9})/i,
    /Passport\s*No\s*\.?\s*[:]*\s*([A-Z0-9<]+)/i,
    /([A-Z0-9<]{9})/,
  ];

  for (const line of lines) {
    for (const pattern of passportPatterns) {
      const match = line.match(pattern);
      if (match) {
        passportNumber = match[1] || match[0];
        if (passportNumber.length >= 6) break;
      }
    }
    if (passportNumber) break;
  }

  // --- DOB Extraction ---
  // Extract any date-like pattern from the text
  const dobPatterns = [
    /(\d{1,2}[\s/.-]\d{1,2}[\s/.-]\d{2,4})/,
    /(\d{8,})/,
  ];

  for (const line of lines) {
    for (const pattern of dobPatterns) {
      const match = line.match(pattern);
      if (match) {
        dateOfBirth = match[1];
        break;
      }
    }
    if (dateOfBirth) break;
  }

  return {
    name: extractedName || '',
    passportNumber: passportNumber || '',
    dateOfBirth: dateOfBirth || '',
    rawText: text,
  };
};

// --- 5. Driving License Parser (Enhanced) ---
export const parseDrivingLicenseData = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  let extractedName = '';
  let licenseNumber = '';
  let dateOfBirth = '';

  // --- Name Extraction ---
  const namePatterns = [
    /(?:name|driver|holder)\s*[:]\s*([A-Z\s]+)/i,
    /1\.?\s*([A-Z]{3,}\s+[A-Z]{3,})/,
    /^([A-Z]{3,}\s+[A-Z]{3,})/,
  ];
  
  for (const line of lines) {
    if (/^[0-9<]+$/.test(line) || line.length > 35) continue; // Skip obvious non-name lines

    for (const pattern of namePatterns) {
      const match = line.match(pattern);
      if (match) {
        let rawName = (match[1] || match[0]).trim();
        rawName = rawName.replace(/\d+/g, '').replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ');
        if (rawName.split(' ').length >= 2 && rawName.length > 5 && rawName.length < 40) {
          extractedName = rawName;
          break;
        }
      }
    }
    if (extractedName) break;
  }
  
  // --- License Number Extraction ---
  const licensePatterns = [
    /(?:dl|lic|license)\s*(?:no|num|#)?\s*[:.]?\s*([A-Z0-9]+)/i,
    /No\s*\.?\s*([A-Z0-9]{8,15})/, 
    /([A-Z]{1,2}[0-9]{6,14})/,
  ];
  
  for (const line of lines) {
    for (const pattern of licensePatterns) {
      const match = line.match(pattern);
      if (match) {
        let potentialNum = (match[1] || match[0]).trim();
        if (!potentialNum.match(/\/|\\|-/) && potentialNum.length > 5) { 
            licenseNumber = potentialNum;
            break;
        }
      }
    }
    if (licenseNumber) break;
  }
  

  const dobPatterns = [
    /(\d{1,2}[\s/.-]\d{1,2}[\s/.-]\d{2,4})/,
    /(\d{8,})/,
  ];

  for (const line of lines) {
    for (const pattern of dobPatterns) {
      const match = line.match(pattern);
      if (match) {
        dateOfBirth = match[1];
        break;
      }
    }
    if (dateOfBirth) break;
  }
  
  return {
    name: extractedName || '',
    licenseNumber: licenseNumber || '',
    dateOfBirth: dateOfBirth || '',
    rawText: text,
  };
};

// --- 6. Validation Logic (Name + ID only) ---

export const validateData = (formData, ocrData) => {
  const results = {
    nameMatch: false,
    dobMatch: true,
    passportMatch: false,
    licenseMatch: false,
    idMatch: false,
    allMatch: false,
  };

  const hasLicense = !!ocrData.licenseNumber;
  const hasPassport = !!ocrData.passportNumber;
  const hasDocument = hasLicense || hasPassport;

  if (!hasDocument) return results;

  // 1. Name Matching
  if (formData.name && ocrData.name) {
    results.nameMatch = exactMatch(formData.name, ocrData.name) || fuzzyMatch(formData.name, ocrData.name);
    console.log('=== Name Comparison ===');
    console.log('Input:', formData.name);
    console.log('OCR:', ocrData.name);
    console.log('Match:', results.nameMatch);
  }

  // 2. ID Matching
  if (hasLicense && ocrData.licenseNumber) {
    results.licenseMatch = exactMatch(formData.licenseNumber, ocrData.licenseNumber);
    console.log('=== License Comparison ===');
    console.log('Input:', formData.licenseNumber);
    console.log('OCR:', ocrData.licenseNumber);
    console.log('Match:', results.licenseMatch);
  }

  if (hasPassport && ocrData.passportNumber) {
    results.passportMatch = exactMatch(formData.passportNumber, ocrData.passportNumber);
    console.log('=== Passport Comparison ===');
    console.log('Input:', formData.passportNumber);
    console.log('OCR:', ocrData.passportNumber);
    console.log('Match:', results.passportMatch);
  }

  results.idMatch = (hasLicense && results.licenseMatch) || (hasPassport && results.passportMatch);

  // 3. Final Logic - Only Name + ID (no DOB)
  if (hasLicense && hasPassport) {
    results.allMatch = results.licenseMatch && results.passportMatch && results.nameMatch;
  } else {
    const hasId = hasLicense ? results.licenseMatch : results.passportMatch;
    results.allMatch = hasId && results.nameMatch;
  }

  console.log('=== Final Result ===');
  console.log('All Match:', results.allMatch);

  return results;
};