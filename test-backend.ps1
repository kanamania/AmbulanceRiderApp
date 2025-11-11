# Backend API Test Script
# Tests connectivity and basic endpoints of the Global Express API

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Global Express API Test Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000/api"

# Test 1: Check if backend is running
Write-Host "Test 1: Checking backend connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "[OK] Backend is running!" -ForegroundColor Green
    Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "[OK] Backend is running (404 is OK for /health if not implemented)" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Backend is NOT running or not accessible" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please start the backend server first!" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""

# Test 2: Test Login Endpoint (without credentials)
Write-Host "Test 2: Testing login endpoint structure..." -ForegroundColor Yellow
try {
    $body = @{
        email = "test@example.com"
        password = "wrongpassword"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    Write-Host "[OK] Login endpoint is accessible" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "[OK] Login endpoint is working (401 Unauthorized is expected)" -ForegroundColor Green
    } elseif ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "[OK] Login endpoint is working (400 Bad Request is expected)" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Login endpoint error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Test Register Endpoint
Write-Host "Test 3: Testing register endpoint structure..." -ForegroundColor Yellow
try {
    $body = @{
        firstName = "Test"
        lastName = "User"
        email = "test_$(Get-Random)@example.com"
        password = "Test123!"
        phoneNumber = "1234567890"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    Write-Host "[OK] Register endpoint is accessible" -ForegroundColor Green
    Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "[OK] Register endpoint is working (validation active)" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Register endpoint: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Test 4: Test Protected Endpoint (should fail without token)
Write-Host "Test 4: Testing protected endpoint (users)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/users" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "[WARN] Users endpoint accessible without auth (security issue?)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "[OK] Users endpoint properly protected (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Users endpoint: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Test 5: Test Locations Endpoint
Write-Host "Test 5: Testing locations endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/locations" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "[OK] Locations endpoint is accessible" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "[OK] Locations endpoint exists (requires auth)" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Locations endpoint: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Test 6: Test Trip Types Endpoint
Write-Host "Test 6: Testing trip types endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/triptypes/active" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "[OK] Trip types endpoint is accessible" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "[OK] Trip types endpoint exists (requires auth)" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Trip types endpoint: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend URL: $baseUrl" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Ensure backend server is running on port 5000" -ForegroundColor White
Write-Host "2. Create test users with different roles" -ForegroundColor White
Write-Host "3. Test frontend login with real credentials" -ForegroundColor White
Write-Host "4. Test all admin panel features" -ForegroundColor White
Write-Host ""
Write-Host "For detailed testing, see: BACKEND_INTEGRATION_PLAN.md" -ForegroundColor Cyan
Write-Host ""
