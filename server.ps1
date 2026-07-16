# Start a simple HTTP server using built-in Windows .NET features.
$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
    Write-Host "--------------------------------------------------------" -ForegroundColor Green
    Write-Host "  7 Brew Coffee Inspired Website is running locally!" -ForegroundColor Green
    Write-Host "  Open your browser and visit: http://localhost:$port" -ForegroundColor Cyan
    Write-Host "  To stop the server, close this window or press Ctrl+C." -ForegroundColor Yellow
    Write-Host "--------------------------------------------------------" -ForegroundColor Green
    
    # Auto-open in default browser
    Start-Process "http://localhost:$port"

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response
        
        # Determine file path
        $urlPath = $req.Url.LocalPath
        if ($urlPath -eq "/" -or $urlPath -eq "") { $urlPath = "/index.html" }
        $filePath = Join-Path $PSScriptRoot $urlPath.TrimStart('/')
        
        if (Test-Path $filePath -PathType Leaf) {
            # Determine content type
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "text/html"
            if ($ext -eq ".css") { $contentType = "text/css" }
            elseif ($ext -eq ".js") { $contentType = "application/javascript" }
            elseif ($ext -eq ".json") { $contentType = "application/json" }
            elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $contentType = "image/jpeg" }
            elseif ($ext -eq ".png") { $contentType = "image/png" }
            elseif ($ext -eq ".webp") { $contentType = "image/webp" }
            elseif ($ext -eq ".xml") { $contentType = "application/xml" }
            
            $res.ContentType = $contentType
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $res.StatusCode = 404
            $errorBytes = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found")
            $res.OutputStream.Write($errorBytes, 0, $errorBytes.Length)
        }
        $res.Close()
    }
} catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
} finally {
    $listener.Close()
}
