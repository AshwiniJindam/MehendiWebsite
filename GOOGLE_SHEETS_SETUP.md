# Google Sheets Enrollment Setup

## Google Sheet Columns

Create a Google Sheet with this header row:

```text
Timestamp,Full Name,Phone,Email,Course,City,Message,Status
```

This is also the admin export-ready CSV format used by the dashboard.

## Google Apps Script Code

Open the Google Sheet, go to Extensions > Apps Script, paste this code, and deploy it as a Web App.

```javascript
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
```

## Deployment Steps

1. In Apps Script, click Deploy > New deployment.
2. Select type: Web app.
3. Execute as: Me.
4. Who has access: Anyone.
5. Click Deploy and copy the Web App URL ending in `/exec`.
6. In `.env`, set:

```text
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

7. Restart the frontend dev server after changing `.env`.
8. Submit a test enrollment and confirm a new row appears in the `Enrollments` sheet.

> Important: if the admin dashboard still shows demo data or `?action=fetch` returns `Google Sheet API Ready`, your deployed Apps Script is outdated. Reopen Apps Script and replace the code with the version in this file or `google-sheets-webapp.js`, then redeploy.

> Optional: a local copy of the same Apps Script is available in `google-sheets-webapp.js`.

## Verify deployment

After deployment, verify the endpoint with:

```text
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=fetch
```

You should get a response like:

```json
{"success":true,"data":[... ]}
```

If you instead see `Google Sheet API Ready`, the Apps Script deployed is still the old version.
