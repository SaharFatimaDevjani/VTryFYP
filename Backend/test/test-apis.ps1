# API Testing Script
$baseUrl = "http://localhost:5000"
$token = $null
$testResults = @()

function Test-API {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    $url = "$baseUrl$Endpoint"
    $result = @{
        Method = $Method
        Endpoint = $Endpoint
        Status = "Failed"
        Response = ""
        Error = ""
    }
    
    try {
        $params = @{
            Uri = $url
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        $result.Status = "Success"
        $result.Response = ($response | ConvertTo-Json -Depth 5 -Compress)
    }
    catch {
        $result.Status = "Error"
        $result.Error = $_.Exception.Message
        if ($_.ErrorDetails.Message) {
            $result.Error += " - " + $_.ErrorDetails.Message
            try {
                $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
                $result.Response = ($errorResponse | ConvertTo-Json -Depth 5 -Compress)
            }
            catch {
                $result.Response = $_.ErrorDetails.Message
            }
        }
    }
    
    return $result
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API Testing Started" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Root endpoint
Write-Host "1. Testing Root Endpoint (GET /)" -ForegroundColor Yellow
$result = Test-API -Method "GET" -Endpoint "/"
$testResults += $result
Write-Host "   Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "Success") { "Green" } else { "Red" })
if ($result.Response) { Write-Host "   Response: $($result.Response)" }
Write-Host ""

# Test 2: Auth - Register
Write-Host "2. Testing Auth - Register (POST /api/auth/register)" -ForegroundColor Yellow
$registerData = @{
    first_name = "Test"
    last_name = "User"
    email = "test$(Get-Random)@example.com"
    password = "Test123456"
    dob = "1990-01-01"
    gender = "Male"
}
$result = Test-API -Method "POST" -Endpoint "/api/auth/register" -Body $registerData
$testResults += $result
Write-Host "   Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "Success") { "Green" } else { "Red" })
if ($result.Response) { Write-Host "   Response: $($result.Response)" }
if ($result.Status -eq "Success") {
    try {
        $responseObj = $result.Response | ConvertFrom-Json
        if ($responseObj.token) {
            $token = $responseObj.token
            Write-Host "   Token received: $($token.Substring(0, [Math]::Min(50, $token.Length)))..." -ForegroundColor Green
        }
    }
    catch {}
}
Write-Host ""

# Test 3: Auth - Login (if register failed, try with existing user)
if (-not $token) {
    Write-Host "3. Testing Auth - Login (POST /api/auth/login)" -ForegroundColor Yellow
    $loginData = @{
        email = $registerData.email
        password = $registerData.password
    }
    $result = Test-API -Method "POST" -Endpoint "/api/auth/login" -Body $loginData
    $testResults += $result
    Write-Host "   Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "Success") { "Green" } else { "Red" })
    if ($result.Response) { Write-Host "   Response: $($result.Response)" }
    if ($result.Status -eq "Success") {
        try {
            $responseObj = $result.Response | ConvertFrom-Json
            if ($responseObj.token) {
                $token = $responseObj.token
                Write-Host "   Token received: $($token.Substring(0, [Math]::Min(50, $token.Length)))..." -ForegroundColor Green
            }
        }
        catch {}
    }
    Write-Host ""
}

# Test 4: Get Categories
Write-Host "4. Testing Get Categories (GET /api/categories)" -ForegroundColor Yellow
$result = Test-API -Method "GET" -Endpoint "/api/categories"
$testResults += $result
Write-Host "   Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "Success") { "Green" } else { "Red" })
Write-Host ""

# Test 5: Get Products
Write-Host "5. Testing Get Products (GET /api/products)" -ForegroundColor Yellow
$result = Test-API -Method "GET" -Endpoint "/api/products"
$testResults += $result
Write-Host "   Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "Success") { "Green" } else { "Red" })
Write-Host ""

# Test 6: Get Product Counters
Write-Host "6. Testing Get Product Counters (GET /api/products/counters)" -ForegroundColor Yellow
$result = Test-API -Method "GET" -Endpoint "/api/products/counters"
$testResults += $result
Write-Host "   Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "Success") { "Green" } else { "Red" })
Write-Host ""

# Test 7: Get Users
Write-Host "7. Testing Get Users (GET /api/users)" -ForegroundColor Yellow
$result = Test-API -Method "GET" -Endpoint "/api/users"
$testResults += $result
Write-Host "   Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "Success") { "Green" } else { "Red" })
Write-Host ""

# Test 8: Get Bids
Write-Host "8. Testing Get Bids (GET /api/bids)" -ForegroundColor Yellow
$result = Test-API -Method "GET" -Endpoint "/api/bids"
$testResults += $result
Write-Host "   Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "Success") { "Green" } else { "Red" })
Write-Host ""

# Test 9: Get Grouped Bids
Write-Host "9. Testing Get Grouped Bids (GET /api/bids/grouped)" -ForegroundColor Yellow
$result = Test-API -Method "GET" -Endpoint "/api/bids/grouped"
$testResults += $result
Write-Host "   Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "Success") { "Green" } else { "Red" })
Write-Host ""

# Test 10: Get Top Bidders
Write-Host "10. Testing Get Top Bidders (GET /api/bids/top-bidders)" -ForegroundColor Yellow
$result = Test-API -Method "GET" -Endpoint "/api/bids/top-bidders"
$testResults += $result
Write-Host "   Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "Success") { "Green" } else { "Red" })
Write-Host ""

# Protected Routes (require authentication)
if ($token) {
    $authHeaders = @{ "Authorization" = "Bearer $token" }
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Testing Protected Routes" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Test 11: Create Category (Protected)
    Write-Host "11. Testing Create Category (POST /api/categories) [Protected]" -ForegroundColor Yellow
    $categoryData = @{
        title = "Test Category $(Get-Random)"
        description = "Test Description"
    }
    $result = Test-API -Method "POST" -Endpoint "/api/categories" -Body $categoryData -Headers $authHeaders
    $testResults += $result
    Write-Host "   Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "Success") { "Green" } else { "Red" })
    $categoryId = $null
    if ($result.Status -eq "Success") {
        try {
            $responseObj = $result.Response | ConvertFrom-Json
            if ($responseObj._id) { $categoryId = $responseObj._id }
        }
        catch {}
    }
    Write-Host ""
    
    # Test 12: Create Product (Protected)
    Write-Host "12. Testing Create Product (POST /api/products) [Protected]" -ForegroundColor Yellow
    $productData = @{
        title = "Test Product $(Get-Random)"
        description = "Test Product Description"
        price = 1000
        category = if ($categoryId) { $categoryId } else { "test-category-id" }
        endDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
        endHour = "23"
        endMinute = "59"
    }
    $result = Test-API -Method "POST" -Endpoint "/api/products" -Body $productData -Headers $authHeaders
    $testResults += $result
    Write-Host "   Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "Success") { "Green" } else { "Red" })
    $productId = $null
    if ($result.Status -eq "Success") {
        try {
            $responseObj = $result.Response | ConvertFrom-Json
            if ($responseObj._id) { $productId = $responseObj._id }
        }
        catch {}
    }
    Write-Host ""
    
    # Test 13: Create Bid (Protected)
    if ($productId) {
        Write-Host "13. Testing Create Bid (POST /api/bids) [Protected]" -ForegroundColor Yellow
        # Get user info from token (decode or use registered user data)
        $bidData = @{
            name = "Test User"
            email = $registerData.email
            product = $productId
            bidAmount = 1500
        }
        $result = Test-API -Method "POST" -Endpoint "/api/bids" -Body $bidData -Headers $authHeaders
        $testResults += $result
        Write-Host "   Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "Success") { "Green" } else { "Red" })
        Write-Host ""
    }
    
    # Test 14: Create Wishlist (Protected)
    if ($productId) {
        Write-Host "14. Testing Create Wishlist (POST /api/bids/wishlist) [Protected]" -ForegroundColor Yellow
        $wishlistData = @{
            email = $registerData.email
            product = $productId
        }
        $result = Test-API -Method "POST" -Endpoint "/api/bids/wishlist" -Body $wishlistData -Headers $authHeaders
        $testResults += $result
        Write-Host "   Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "Success") { "Green" } else { "Red" })
        Write-Host ""
    }
    
    # Test 15: Get Product by ID
    if ($productId) {
        Write-Host "15. Testing Get Product by ID (GET /api/products/:id)" -ForegroundColor Yellow
        $result = Test-API -Method "GET" -Endpoint "/api/products/$productId"
        $testResults += $result
        Write-Host "   Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "Success") { "Green" } else { "Red" })
        Write-Host ""
    }
    
    # Test 16: Get Bids by Product
    if ($productId) {
        Write-Host "16. Testing Get Bids by Product (GET /api/bids/product/:product)" -ForegroundColor Yellow
        $result = Test-API -Method "GET" -Endpoint "/api/bids/product/$productId"
        $testResults += $result
        Write-Host "   Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "Success") { "Green" } else { "Red" })
        Write-Host ""
    }
}
else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Skipping Protected Routes - No Token" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$total = $testResults.Count
$success = ($testResults | Where-Object { $_.Status -eq "Success" }).Count
$failed = ($testResults | Where-Object { $_.Status -ne "Success" }).Count

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Passed: $success" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -gt 0) {
    Write-Host "Failed Tests:" -ForegroundColor Red
    foreach ($test in $testResults | Where-Object { $_.Status -ne "Success" }) {
        Write-Host "  - $($test.Method) $($test.Endpoint): $($test.Error)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
