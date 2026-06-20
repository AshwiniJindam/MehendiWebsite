// Copy of the Google Sheets Apps Script for local reference.
// Paste this entire file into the Google Sheets Apps Script editor and deploy as a Web App.

const SHEET_NAME = 'Enrollments';
const HEADERS = [
  'Timestamp',
  'Full Name',
  'Phone',
  'Email',
  'Course',
  'City',
  'Message',
  'Status',
];

function doPost(e) {
  try {
    const payload = JSON.parse((e.postData && e.postData.contents) || '{}');
    const requiredFields = ['fullName', 'phone', 'course'];
    const missing = requiredFields.filter(function (field) {
      return !String(payload[field] || '').trim();
    });

    if (missing.length) {
      throw new Error('Missing required field(s): ' + missing.join(', '));
    }

    const sheet = getEnrollmentSheet_();
    const row = [
      payload.timestamp || new Date().toISOString(),
      payload.fullName || '',
      payload.phone || '',
      payload.email || '',
      payload.course || '',
      payload.city || '',
      payload.message || '',
      payload.status || 'New',
    ];

    sheet.appendRow(row);
    SpreadsheetApp.flush();

    return json_({
      success: true,
      rowNumber: sheet.getLastRow(),
      message: 'Enrollment row added',
    });
  } catch (error) {
    return json_({
      success: false,
      error: error && error.message ? error.message : String(error),
    });
  }
}

function doGet(e) {
  try {
    const action = (e.parameter && e.parameter.action || '').toString().toLowerCase();
    if (action !== 'fetch') {
      return json_({ success: false, error: 'Missing or invalid action parameter' });
    }

    const sheet = getEnrollmentSheet_();
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0] || [];
    const data = rows.slice(1).map(function (row, index) {
      const item = { rowNumber: index + 2 };
      headers.forEach(function (header, columnIndex) {
        item[header] = row[columnIndex] || '';
      });
      return item;
    });

    return json_({ success: true, data });
  } catch (error) {
    return json_({
      success: false,
      error: error && error.message ? error.message : String(error),
    });
  }
}

function getEnrollmentSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = HEADERS.every(function (header, index) {
    return firstRow[index] === header;
  });

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.getRange('C:C').setNumberFormat('@');
  }

  return sheet;
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
