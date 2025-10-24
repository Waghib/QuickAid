# API Base URL Testing

## URLs to test in emulator browser:

### Basic connectivity (should show: {"message":"Welcome to QuickAid API!"}):
1. http://10.0.2.2:3001/
2. http://localhost:3001/
3. http://127.0.0.1:3001/
4. http://192.168.100.218:3001/

### Test POST endpoints (may show method not allowed, but should respond):
1. http://10.0.2.2:3001/api/emergency-requests
2. http://localhost:3001/api/emergency-requests
3. http://127.0.0.1:3001/api/emergency-requests
4. http://192.168.100.218:3001/api/emergency-requests

### Test GET endpoints (should show data or empty array):
1. http://10.0.2.2:3001/api/first-responders/+923181111111/requests
2. http://localhost:3001/api/first-responders/+923181111111/requests
3. http://127.0.0.1:3001/api/first-responders/+923181111111/requests
4. http://192.168.100.218:3001/api/first-responders/+923181111111/requests

## Instructions:
1. Test each URL in emulator browser
2. Note which ones respond (not timeout)
3. Update API_BASE_URL in src/config/api.js with working URL
