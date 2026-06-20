# 🚀 Google Apps Script Deployment Guide

## Step-by-Step Setup Instructions

### **Step 1: Create Google Sheet**
1. Go to [Google Sheets](https://sheets.google.com)
2. Click **+ New Sheet**
3. Name it: **"Mehndi Enrollments"** (or any name you prefer)
4. You'll use this sheet for storing enrollment data

---

### **Step 2: Create Google Apps Script**
1. In your Google Sheet, click **Extensions** → **Apps Script**
2. A new tab will open with the script editor
3. **Delete the default code** (the `function myFunction()` part)
4. **Copy ALL the code** from the file: [`google-sheets-webapp.js`](./google-sheets-webapp.js)
5. **Paste it** into the Apps Script editor
6. Press **Ctrl+S** to save

Your script editor should look like this:
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
// ... rest of the code
```

---

### **Step 3: Deploy as Web App**
1. In Apps Script editor, click **Deploy** button (top right)
2. Click **New deployment**
3. Choose the settings:
   - **Type:** Select "Web app" from dropdown
   - **Execute as:** Select your Google account (Me)
   - **Who has access:** Select "Anyone"
4. Click **Deploy**
5. A dialog will appear - click **Authorize access**
   - You may see a warning "Google hasn't verified this app" - click **Advanced** → **Go to MehndiArtist (unsafe)**
6. **Copy the deployment URL** from the dialog that appears

Your deployment URL looks like:
```
https://script.google.com/macros/s/AKfycbw_xxxxx_xxxxx_xxxxx/exec
```

---

### **Step 4: Extract Deployment ID**
Your URL has this format:
```
https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec
                                  ↑ Copy this part only ↑
```

For example, if your URL is:
```
https://script.google.com/macros/s/AKfycbw_1234567890_aBcDefGhIjKlMnOp/exec
```

Your **DEPLOYMENT_ID** is:
```
AKfycbw_1234567890_aBcDefGhIjKlMnOp
```

---

### **Step 5: Update .env File**
1. Open the file: [`d:\Website\MehendiArtist\frontend\.env`](./.env)
2. Replace `YOUR_DEPLOYMENT_ID` with your actual deployment ID
3. The file should now look like:
```
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbw_1234567890_aBcDefGhIjKlMnOp/exec
```
4. **Save the file** (Ctrl+S)

---

### **Step 6: Restart Development Server**
1. Stop your Vite dev server (Press **Ctrl+C** in terminal)
2. Run again:
```bash
npm run dev
```

The app will rebuild with the new environment variable.

---

### **Step 7: Test the Deployment**
#### **Method 1: Quick URL Test**
1. Copy your deployment URL and add `?action=fetch` to the end:
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=fetch
```
2. Open it in browser
3. You should see:
```json
{"success":true,"data":[]}
```

If you see `Google Sheet API Ready` instead, your old script is still deployed. Go back to Apps Script and redeploy.

#### **Method 2: Test the Form**
1. Go to your website's enrollment page
2. Fill in the form completely
3. Click **Submit ✓** button
4. You should see: **"Application Submitted!"** message with admission number
5. Go to your Google Sheet and check the **Enrollments** sheet
6. **New row should appear** with your enrollment data

---

### **✅ Verification Checklist**

- [ ] Google Sheet created and accessible
- [ ] Google Apps Script code pasted and saved
- [ ] Web App deployed successfully
- [ ] Deployment ID extracted correctly
- [ ] `.env` file updated with correct URL
- [ ] Dev server restarted
- [ ] Test URL returns `{"success":true,"data":[]}`
- [ ] Form submission creates new row in Google Sheet
- [ ] Admin Dashboard shows new enrollments

---

### **🔧 Troubleshooting**

#### **Issue: "Missing VITE_GOOGLE_SCRIPT_URL" error**
- Make sure `.env` file exists in project root
- Make sure dev server was restarted after creating `.env`
- Check browser console for the exact error

#### **Issue: "Google Sheets save failed"**
- Verify the URL in `.env` is correct
- Check that Web App deployment is still active in Google Apps Script
- Try the `?action=fetch` test URL above

#### **Issue: "Google Sheet API Ready" message**
- Your old script is still deployed
- Go to Apps Script > Deploy > View deployments
- Delete the old deployment and create a new one

#### **Issue: Data not appearing in Google Sheet**
- Check that the **Enrollments** sheet was created automatically
- Verify all required fields (name, phone, course) are filled in the form
- Check Google Sheet permissions - make sure your account can edit it

---

### **📝 Notes**

- The Google Apps Script will automatically create an **"Enrollments"** sheet if it doesn't exist
- Headers will be frozen and bolded for easy reading
- Phone numbers are stored as text (not numbers) to preserve formatting
- Each submission gets a timestamp automatically
- Status is set to "New" by default

---

### **Next Steps**

Once deployment is complete:
1. Admin Dashboard will display enrollments from Google Sheets
2. Data persists even after page refresh
3. Test with multiple enrollments to verify everything works
4. Share the public website link for students to enroll

