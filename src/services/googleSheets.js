const WEB_APP_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

console.log('[Enrollment Debug] VITE_GOOGLE_SCRIPT_URL:', WEB_APP_URL || '(missing)');

export const SHEET_COLUMNS = [
  'Timestamp',
  'Full Name',
  'Phone',
  'Email',
  'Course',
  'City',
  'Message',
  'Status',
];

function value(getFieldValue, id) {
  return String(getFieldValue(id) || '').trim();
}

export function createEnrollmentPayload(getFieldValue) {
  const dob = value(getFieldValue, 'f-dob');
  const gender = value(getFieldValue, 'f-gender');
  const fullName = value(getFieldValue, 'f-name');
  const phone = value(getFieldValue, 'f-phone');
  const whatsapp = value(getFieldValue, 'f-whatsapp');
  const email = value(getFieldValue, 'f-email');
  const course = value(getFieldValue, 'f-type');
  const city = value(getFieldValue, 'f-address');
  const batch = value(getFieldValue, 'f-batch');
  const mode = value(getFieldValue, 'f-mode');
  const startDate = value(getFieldValue, 'f-startdate');
  const experience = value(getFieldValue, 'f-experience');
  const priorTraining = value(getFieldValue, 'f-prior-training');
  const reason = value(getFieldValue, 'f-reason');
  const source = value(getFieldValue, 'f-source');
  const messageParts = [
    ['Date of Birth', dob],
    ['Gender', gender],
    ['WhatsApp', whatsapp],
    ['Batch', batch],
    ['Mode', mode],
    ['Start Date', startDate],
    ['Experience', experience],
    ['Prior Training', priorTraining],
    ['Reason', reason],
    ['Source', source],
  ];

  return {
    timestamp: new Date().toISOString(),
    fullName,
    phone,
    email,
    course,
    city,
    message: messageParts
      .filter(([, fieldValue]) => fieldValue)
      .map(([label, fieldValue]) => `${label}: ${fieldValue}`)
      .join(' | '),
    status: 'New',
  };
}

function getErrorMessage(error) {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  return error.message || error.error || JSON.stringify(error);
}

export async function submitEnrollmentToGoogleSheets(payload) {
  if (!WEB_APP_URL) {
    throw new Error('Missing VITE_GOOGLE_SCRIPT_URL');
  }

  console.log('[Enrollment Debug] request URL:', WEB_APP_URL);
  console.log('[Enrollment Debug] payload:', payload);

  const response = await fetch(WEB_APP_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  console.log('[Enrollment Debug] response status:', response.status);
  console.log('[Enrollment Debug] response body:', text);

  let result;
  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Google Sheets save failed with HTTP ${response.status}: ${text || 'Empty response body'}`);
  }

  if (!response.ok || result.success !== true) {
    throw new Error(getErrorMessage(result) || `Google Sheets save failed with HTTP ${response.status}: ${text || 'Empty response body'}`);
  }

  return result;
}

export async function fetchEnrollmentData() {
  if (!WEB_APP_URL) {
    throw new Error('Missing VITE_GOOGLE_SCRIPT_URL');
  }

  const url = new URL(WEB_APP_URL);
  url.searchParams.set('action', 'fetch');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const text = await response.text();
  let result;

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    const message = text.includes('Google Sheet API Ready')
      ? 'Google Apps Script deploy is outdated: expected JSON from ?action=fetch'
      : `Unexpected response from Google Sheets fetch: ${text || 'Empty response body'}`;
    throw new Error(message);
  }

  if (!response.ok || result.success !== true) {
    throw new Error(getErrorMessage(result) || `Google Sheets fetch failed with HTTP ${response.status}: ${text || 'Empty response body'}`);
  }

  return Array.isArray(result.data) ? result.data : [];
}

export async function updateEnrollmentStatus(rowNumber, status) {
  if (!WEB_APP_URL) {
    throw new Error('Missing VITE_GOOGLE_SCRIPT_URL');
  }

  const payload = {
    action: 'updateStatus',
    rowNumber: rowNumber,
    status: status,
  };

  console.log('[Enrollment Debug] update request URL:', WEB_APP_URL);
  console.log('[Enrollment Debug] update payload:', payload);

  const response = await fetch(WEB_APP_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  console.log('[Enrollment Debug] update response status:', response.status);
  console.log('[Enrollment Debug] update response body:', text);

  let result;
  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Google Sheets status update failed with HTTP ${response.status}: ${text || 'Empty response body'}`);
  }

  if (!response.ok || result.success !== true) {
    throw new Error(getErrorMessage(result) || `Google Sheets status update failed with HTTP ${response.status}: ${text || 'Empty response body'}`);
  }

  return result;
}
