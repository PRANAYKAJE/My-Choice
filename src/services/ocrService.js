import Tesseract from 'tesseract.js';

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

export const normalizeDate = (dateStr) => {
  if (!dateStr) return '';
  
  const clean = dateStr.trim();
  
  const numbers = clean.match(/\d+/g);
  if (!numbers || numbers.length < 3) return clean;
  
  let parts = numbers.map(n => n.length <= 2 ? n.padStart(2, '0') : n);
  
  let year, month, day;
  
  if (parts[0].length === 4) {
    year = parts[0];
    month = parts[1];
    day = parts[2] || '01';
  } else {
    day = parts[0];
    month = parts[1];
    year = parts[2];
    
    if (year.length === 2) {
      const yearNum = parseInt(year);
      year = yearNum <= 30 ? '20' + year : '19' + year;
    }
  }
  
  const monthNum = parseInt(month);
  const dayNum = parseInt(day);
  
  if (monthNum > 12 && dayNum <= 12) {
    [month, day] = [day, month];
  }
  
  if (monthNum < 1 || monthNum > 12) {
    return clean;
  }
  
  if (dayNum < 1 || dayNum > 31) {
    return clean;
  }
  
  return `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`;
};

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

  let name = '';
  if (line1.startsWith('P<')) {
    const namePart = line1.substring(2);
    const parts = namePart.split('<<');
    const surname = parts[0].replace(/</g, ' ').trim();
    const givenNames = parts[1] ? parts[1].replace(/</g, ' ').trim() : '';
    name = `${surname} ${givenNames}`.trim();
  }

  const rawPassport = line2.substring(0, 9).replace(/</g, '');

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

export const parseDrivingLicenseData = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  let extractedName = '';
  let licenseNumber = '';
  let dateOfBirth = '';

  const namePatterns = [
    /(?:name|driver|holder)\s*[:]\s*([A-Z\s]+)/i,
    /1\.?\s*([A-Z]{3,}\s+[A-Z]{3,})/,
    /^([A-Z]{3,}\s+[A-Z]{3,})/,
  ];
  
  for (const line of lines) {
    if (/^[0-9<]+$/.test(line) || line.length > 35) continue;

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

  results.nameMatch = false;
  results.licenseMatch = false;
  results.passportMatch = false;

  if (formData.name && ocrData.name && formData.name.trim() && ocrData.name.trim()) {
    const normalizedFormName = normalize(formData.name);
    const normalizedOcrName = normalize(ocrData.name);
    results.nameMatch = normalizedFormName === normalizedOcrName || 
                        normalizedFormName.includes(normalizedOcrName) || 
                        normalizedOcrName.includes(normalizedFormName);
  }

  if (hasLicense && ocrData.licenseNumber && formData.licenseNumber) {
    results.licenseMatch = exactMatch(formData.licenseNumber, ocrData.licenseNumber);
  }

  if (hasPassport && ocrData.passportNumber && formData.passportNumber) {
    results.passportMatch = exactMatch(formData.passportNumber, ocrData.passportNumber);
  }

  if (hasLicense && hasPassport) {
    results.allMatch = results.licenseMatch && results.passportMatch && results.nameMatch;
  } else if (hasLicense) {
    results.allMatch = results.licenseMatch && results.nameMatch;
  } else if (hasPassport) {
    results.allMatch = results.passportMatch && results.nameMatch;
  }

  return results;
};
