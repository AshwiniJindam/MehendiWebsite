import { demoStudents } from '../data/demoStudents.js';
import { fetchEnrollmentData } from '../services/googleSheets.js';

let cachedStudents = demoStudents;

function parseMessage(message) {
  const parsed = {};
  String(message || '')
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const [key, ...rest] = part.split(':');
      const value = rest.join(':').trim();
      if (!key) return;
      const normalized = key.trim().toLowerCase().replace(/\s+/g, '');
      if (normalized === 'dateofbirth') parsed.dob = value;
      else if (normalized === 'gender') parsed.gender = value;
      else if (normalized === 'whatsapp') parsed.whatsapp = value;
      else if (normalized === 'batch') parsed.batch = value;
      else if (normalized === 'mode') parsed.mode = value;
      else if (normalized === 'startdate') parsed.startdate = value;
      else if (normalized === 'experience') parsed.experience = value;
      else if (normalized === 'priortraining') parsed.priorTraining = value;
      else if (normalized === 'reason') parsed.reason = value;
      else if (normalized === 'source') parsed.source = value;
    });
  return parsed;
}

function mapEnrollmentRow(row) {
  const parsedMessage = parseMessage(row.Message || '');
  return {
    id: row.rowNumber ? `ENR-${String(row.rowNumber).padStart(4, '0')}` : row.Timestamp || '',
    rowNumber: row.rowNumber,
    name: row['Full Name'] || '',
    dob: parsedMessage.dob || '',
    gender: parsedMessage.gender || '',
    phone: row.Phone || '',
    whatsapp: parsedMessage.whatsapp || '',
    email: row.Email || '',
    address: row.City || '',
    type: row.Course || '',
    batch: parsedMessage.batch || '',
    mode: parsedMessage.mode || '',
    startdate: parsedMessage.startdate || '',
    experience: parsedMessage.experience || '',
    priorTraining: parsedMessage.priorTraining || '',
    reason: parsedMessage.reason || '',
    source: parsedMessage.source || '',
    submittedOn: row.Timestamp || '',
    status: row.Status || 'New',
  };
}

export function getCachedStudents() {
  return cachedStudents;
}

export async function fetchStudents() {
  try {
    const rows = await fetchEnrollmentData();
    cachedStudents = rows.map(mapEnrollmentRow);
  } catch (error) {
    console.error('Failed to fetch enrollment data, falling back to demo students:', error);
    cachedStudents = demoStudents;
  }
  return cachedStudents;
}
