# Pincode API Troubleshooting Guide

## Why API Verification Might Be Unavailable

### Common Reasons:

### 1. **External API Down** ⚠️
The India Post API (`https://api.postalpincode.in`) might be:
- Temporarily down
- Under maintenance
- Experiencing high traffic

**How to Check:**
```bash
# Test the API directly
curl https://api.postalpincode.in/pincode/400001
```

**Expected Response:**
```json
[{
  "Status": "Success",
  "PostOffice": [{
    "Name": "Mumbai GPO",
    "State": "Maharashtra",
    "District": "Mumbai"
  }]
}]
```

### 2. **Network Issues** 🌐
- Server cannot reach the internet
- Firewall blocking outbound requests
- DNS resolution issues

**How to Check:**
```bash
# From backend server
ping api.postalpincode.in

# Or test with curl
curl -I https://api.postalpincode.in
```

### 3. **Timeout (5 seconds)** ⏱️
The API is slow to respond and exceeds the 5-second timeout.

**Solution:**
Increase timeout in `indianAddressService.js`:
```javascript
const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`, {
  timeout: 10000 // Increase to 10 seconds
});
```

### 4. **Backend Server Not Running** 🔴
Your Node.js backend isn't running.

**How to Check:**
```bash
cd Backend
npm start
```

**Look for:**
```
Server running on port 3000
```

### 5. **Rate Limiting** 🚦
The API might have rate limits and is rejecting requests.

**Solution:** 
The fallback to regex validation handles this automatically.

## Checking Backend Logs

With the improved logging, check your backend console for messages:

### Success:
```
[Pincode API] Validating pincode: 400001
[Pincode API] Response status: Success
[Pincode API] Verified: Mumbai City, Maharashtra
```

### API Down:
```
[Pincode API] Validating pincode: 400001
[Pincode API] Network error: Cannot reach api.postalpincode.in
```

### Timeout:
```
[Pincode API] Validating pincode: 400001
[Pincode API] Timeout: Request took longer than 5 seconds
```

### Invalid Pincode:
```
[Pincode API] Validating pincode: 000001
[Pincode API] Pincode not found in database
```

## Testing the API

### 1. Test Backend Endpoint
```bash
# Test states endpoint
curl http://localhost:3000/api/user/address/states

# Test districts endpoint
curl http://localhost:3000/api/user/address/districts?state=Maharashtra

# Test pincode validation
curl http://localhost:3000/api/user/address/validate-pincode?pincode=400001
```

### 2. Test External API Directly
```bash
# Valid pincode
curl https://api.postalpincode.in/pincode/400001

# Invalid pincode
curl https://api.postalpincode.in/pincode/000001
```

### 3. Check from Browser DevTools
1. Open browser DevTools (F12)
2. Go to Network tab
3. Enter a pincode in the form
4. Look for request to `/api/user/address/validate-pincode`
5. Check response

## What Happens When API Fails?

**Don't worry!** The system has a fallback:

1. ✅ **Regex validation still works**
   - Checks format: 6 digits, not starting with 0
   - Accepts valid format

2. ✅ **User can proceed**
   - Form submission works
   - Backend validates with regex
   - Address is saved

3. ✅ **No blocking issues**
   - Users aren't stuck
   - Service continues

## Expected Behavior

### When API Works:
```
User enters: 400001
↓
Frontend: Validates format (regex)
↓
Frontend: Calls backend API
↓
Backend: Calls India Post API
↓
Backend: Returns location data
↓
Frontend: Shows "Verified: Mumbai City, Maharashtra"
↓
Auto-fills state and district dropdowns
```

### When API Fails:
```
User enters: 400001
↓
Frontend: Validates format (regex)
↓
Frontend: Calls backend API
↓
Backend: Tries India Post API → FAILS
↓
Backend: Falls back to regex validation
↓
Backend: Returns success with verifiedBy: 'regex'
↓
Frontend: Shows "Valid pincode format ✓"
↓
User manually selects state and district
```

## Fixing Common Issues

### Issue: "Cannot reach api.postalpincode.in"

**Causes:**
- No internet connection on server
- Firewall blocking
- DNS issues

**Solutions:**
1. Check server internet:
   ```bash
   ping 8.8.8.8
   ```

2. Check DNS:
   ```bash
   nslookup api.postalpincode.in
   ```

3. Check firewall rules (allow outbound HTTPS)

### Issue: Consistent Timeouts

**Causes:**
- Slow network
- API is slow
- 5-second timeout too short

**Solutions:**
1. Increase timeout in code (see above)
2. Check network speed
3. Consider caching pincode data

### Issue: Backend Not Logging

**Causes:**
- Backend not restarted after code changes
- Console output redirected

**Solutions:**
1. Restart backend:
   ```bash
   # Stop with Ctrl+C
   # Start again
   npm start
   ```

2. Check console output

## Monitoring API Health

### Create a Simple Test Script
```javascript
// test-pincode-api.js
const axios = require('axios');

async function testAPI() {
  const testPincodes = ['400001', '560001', '110001', '600001'];
  
  for (const pincode of testPincodes) {
    try {
      const start = Date.now();
      const response = await axios.get(
        `https://api.postalpincode.in/pincode/${pincode}`,
        { timeout: 5000 }
      );
      const time = Date.now() - start;
      
      console.log(`✓ ${pincode}: ${time}ms - ${response.data[0].Status}`);
    } catch (error) {
      console.log(`✗ ${pincode}: ${error.message}`);
    }
  }
}

testAPI();
```

**Run:**
```bash
node test-pincode-api.js
```

## Alternative Solutions

### 1. Increase Timeout
```javascript
// In indianAddressService.js
timeout: 10000 // 10 seconds instead of 5
```

### 2. Add Retry Logic
```javascript
const maxRetries = 2;
let retries = 0;

while (retries < maxRetries) {
  try {
    const response = await axios.get(...);
    return response;
  } catch (error) {
    retries++;
    if (retries === maxRetries) throw error;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
  }
}
```

### 3. Cache Pincode Data
Store frequently used pincodes in database to reduce API calls.

### 4. Use Different API
Consider alternative pincode APIs:
- India Post (current)
- Zipcodebase.com
- Postalpincode.net
- Your own database

## Summary

**API unavailable is NOT a problem!**

✅ System continues to work
✅ Regex validation ensures format is correct
✅ Backend still validates state/district/pincode
✅ Users can proceed with address entry
✅ No blocking issues

The dual validation system (API + Regex) ensures reliability even when external services fail.

---

**Need more help?** Check backend console logs for detailed error messages with the improved logging!
