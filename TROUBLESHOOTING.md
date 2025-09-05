# 🔧 SheetApps Template - Troubleshooting Guide

## 🚨 Common API Connection Issues

### ❌ "Cannot reach API" Error

**Symptoms:**
- Connection Status shows "API Reachability: FAIL"
- Error: "Cannot reach API: network error"

**Causes & Solutions:**

1. **Invalid API URL**
   ```bash
   # Check your .env file
   VITE_SHEETAPPS_API_URL=https://sheet-apps-nextjs.vercel.app/api/v1
   
   # ✅ Correct format: Must end with /api/v1
   # ❌ Wrong: http://localhost:3000 (missing /api/v1)
   # ❌ Wrong: https://sheet-apps-nextjs.vercel.app/ (trailing slash)
   ```

2. **Network/CORS Issues**
   - Check if the API server is running
   - Verify your network connection
   - Check browser console for CORS errors

3. **DNS/Domain Issues**
   - Try using IP address instead of domain
   - Check if domain is accessible in browser

**Quick Fix:**
```bash
# Test API manually in browser
curl https://sheet-apps-nextjs.vercel.app/api/v1/sheets/list
```

---

### 🔑 "Authentication Failed" Error

**Symptoms:**
- Connection Status shows "Authentication: FAIL" 
- Error: "Invalid API key or authentication failed"
- HTTP 401 Unauthorized

**Causes & Solutions:**

1. **Missing/Invalid API Key**
   ```bash
   # Check your .env file
   VITE_SHEETAPPS_API_KEY=sk_your_actual_api_key_here
   
   # ✅ Correct format: Must start with 'sk_'
   # ❌ Wrong: missing entirely
   # ❌ Wrong: 'your_api_key_here' (placeholder text)
   ```

2. **Expired API Key**
   - Generate a new API key from the SheetApps dashboard
   - Update your .env file with the new key

3. **Wrong Project API Key**
   - Ensure you're using the API key for the correct project
   - Check the project ID matches your sheet configuration

**Quick Fix:**
```bash
# Test authentication manually
curl -H "Authorization: Bearer sk_your_api_key" \
     https://sheet-apps-nextjs.vercel.app/api/v1/sheets/list
```

---

### 📄 "Sheet Not Found" Error

**Symptoms:**
- Connection Status shows "Sheet Access: FAIL"
- Error: "Sheet not found - check VITE_SHEET_ID"
- HTTP 404 Not Found

**Causes & Solutions:**

1. **Invalid Sheet ID**
   ```bash
   # Check your .env file
   VITE_SHEET_ID=1TkIgTxvyrDJNvvo_jBOaWxleHFpJd_8yjjrytw__XqA
   
   # ✅ Correct: Long alphanumeric string
   # ❌ Wrong: 'your_sheet_id_here' (placeholder)
   # ❌ Wrong: Full URL instead of just ID
   ```

2. **Sheet Permissions**
   - Ensure the sheet is shared with the service account
   - Check Google Sheets sharing settings
   - Verify the sheet is not private

3. **Sheet Deleted/Moved**
   - Verify the sheet still exists in Google Drive
   - Check if the sheet was moved to a different account

**How to Find Sheet ID:**
```
Google Sheets URL:
https://docs.google.com/spreadsheets/d/1TkIgTxvyrDJNvvo_jBOaWxleHFpJd_8yjjrytw__XqA/edit

Sheet ID is the long string between /d/ and /edit:
1TkIgTxvyrDJNvvo_jBOaWxleHFpJd_8yjjrytw__XqA
```

---

### 🚫 "Permission Denied" Error

**Symptoms:**
- Connection Status shows "Sheet Access: FAIL"
- Error: "No permission to access this sheet"
- HTTP 403 Forbidden

**Solutions:**

1. **Share Sheet with Service Account**
   - Open Google Sheets
   - Click "Share" button
   - Add the service account email as an Editor
   - Service account email looks like: `service@project.iam.gserviceaccount.com`

2. **API Key Permissions**
   - Check if API key has correct permissions
   - Regenerate API key if permissions were changed

3. **Google Workspace Restrictions**
   - Check organization policies for external sharing
   - Contact admin if in a corporate environment

---

### 📊 "No Data Found" Error

**Symptoms:**
- Connection succeeds but shows "No data found in sheet"
- Empty data array returned

**Causes & Solutions:**

1. **Empty Sheet**
   - Add some data to your Google Sheet
   - Ensure at least one header row exists
   - Check that data is in the correct range (A1:Z1000)

2. **Header Configuration Mismatch**
   ```bash
   # Check your .env file
   VITE_SHEET_HEADERS=["PatientName","Number","Visited","AppointedStaff"]
   
   # Must match exactly with your Google Sheet headers
   # Case-sensitive and order matters
   ```

3. **Sheet Tab Selection**
   - Ensure you're looking at the correct tab/worksheet
   - API reads from the first sheet by default

---

### ⚡ Rate Limiting Issues

**Symptoms:**
- HTTP 429 Too Many Requests
- "Rate limit exceeded" errors
- Slow response times

**Solutions:**

1. **Reduce Request Frequency**
   - Increase cache TTL in client
   - Batch multiple operations
   - Add delays between requests

2. **Check API Limits**
   - Read operations: 500 per hour
   - Write operations: 200 per hour
   - Monitor usage in connection diagnostics

3. **Optimize Data Access**
   - Use smaller ranges when possible
   - Cache data locally where appropriate
   - Avoid unnecessary API calls

---

## 🔍 Diagnostic Tools

### Built-in Connection Test

The template includes comprehensive diagnostic tools:

1. **Quick Connection Test**
   - Automatic on page load
   - Shows connection status and row count
   - Available in Connection Status component

2. **Full Diagnostics**
   - Click "Run Full Diagnostics" button
   - Tests all 5 connection aspects
   - Provides detailed error information
   - Shows configuration details

3. **Real-time Monitoring**
   - Response time tracking
   - Warning detection
   - Automatic retry mechanisms

### Manual Testing Commands

```bash
# Test API reachability
curl https://sheet-apps-nextjs.vercel.app/api/v1/sheets/list

# Test authentication
curl -H "Authorization: Bearer sk_your_api_key" \
     https://sheet-apps-nextjs.vercel.app/api/v1/sheets/list

# Test sheet access
curl -H "Authorization: Bearer sk_your_api_key" \
     "https://sheet-apps-nextjs.vercel.app/api/v1/sheets/YOUR_SHEET_ID/data?range=A1:Z10"

# Test data retrieval
curl -H "Authorization: Bearer sk_your_api_key" \
     "https://sheet-apps-nextjs.vercel.app/api/v1/sheets/YOUR_SHEET_ID/data"
```

---

## 🛠 Environment Configuration

### Required Variables

```bash
# .env file - All variables are required
VITE_SHEETAPPS_API_URL=https://sheet-apps-nextjs.vercel.app/api/v1
VITE_SHEETAPPS_API_KEY=sk_73a54e0da2b04b88b4621f7a769cfaf8
VITE_SHEET_ID=1TkIgTxvyrDJNvvo_jBOaWxleHFpJd_8yjjrytw__XqA
VITE_SHEET_HEADERS=["PatientName","Number","Visited","AppointedStaff"]
VITE_SHEET_DATA_TYPES={"PatientName":"text","Number":"text","Visited":"boolean","AppointedStaff":"text"}
VITE_APP_NAME=Your App Name
VITE_APP_DESCRIPTION=Your app description
VITE_PROJECT_ID=b25d7e40-421f-48bf-82bc-1cfdcb85e217
```

### Validation Checklist

- [ ] API URL ends with `/api/v1`
- [ ] API Key starts with `sk_`
- [ ] Sheet ID is valid Google Sheets ID
- [ ] Headers array matches sheet exactly
- [ ] Data types are properly formatted JSON
- [ ] No placeholder text remains
- [ ] All variables are set (no empty values)

---

## 🚨 Emergency Fixes

### Complete Reset

If nothing works, try a complete reset:

```bash
# 1. Stop development server
# 2. Clear all caches
rm -rf node_modules/.vite
npm run build  # Clear build cache

# 3. Verify environment
cat .env
# Check all values are correct

# 4. Test API manually
curl -H "Authorization: Bearer YOUR_API_KEY" \
     "YOUR_API_URL/sheets/YOUR_SHEET_ID/data?range=A1:B2"

# 5. Restart development
npm run dev
```

### Create New API Key

If API key issues persist:

1. Go to SheetApps dashboard
2. Navigate to your project
3. Generate new API key
4. Update `.env` file immediately
5. Test connection

### Sheet Permissions Reset

If permission issues persist:

1. Open Google Sheets
2. File > Share > Advanced
3. Remove all existing shares
4. Add service account as Editor
5. Ensure "Notify people" is unchecked
6. Test access

---

## 📞 Getting Help

### Error Information to Collect

When reporting issues, please include:

1. **Full Diagnostic Report**
   - Run "Full Diagnostics" in the app
   - Copy all test results and details

2. **Environment Details**
   - Operating System
   - Browser version
   - Node.js version
   - Template version

3. **Configuration (Sanitized)**
   - API URL (without sensitive info)
   - Sheet ID format validation
   - Header configuration

4. **Console Errors**
   - Browser developer console errors
   - Network tab requests and responses

### Support Resources

- **GitHub Issues**: Create detailed bug reports
- **Documentation**: Check AI_PROMPT_GUIDE.md
- **Community**: SheetApps community forums
- **Direct Support**: Contact SheetApps support team

---

## ✅ Success Indicators

Your connection is working correctly when:

- ✅ Connection Status shows all green checkmarks
- ✅ Real data appears in the sample interface
- ✅ Row count matches your Google Sheet
- ✅ Headers match your sheet exactly
- ✅ Add/edit operations work correctly
- ✅ No error messages in console
- ✅ Response times are reasonable (<2 seconds)

Remember: **This template never uses mock data**. If you see data, it's guaranteed to be from your real Google Sheets!