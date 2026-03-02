Write-Host "Building WebMSNP Server..." -ForegroundColor Cyan

# Clean previous build
if (Test-Path "build-rel") {
    Remove-Item -Recurse -Force "build-rel"
}

# Build in release mode
Write-Host "`nCompiling server (release mode)..." -ForegroundColor Yellow
cargo build --release --manifest-path=server/Cargo.toml

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nBuild failed!" -ForegroundColor Red
    exit 1
}

# Create distribution directory
Write-Host "`nCreating release package..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "build-rel" | Out-Null
Copy-Item "server/target/release/webmsnp.exe" "build-rel/webmsnp.exe"
Copy-Item -Recurse "server/static" "build-rel/static"

Write-Host "Build Complete!" -ForegroundColor Green