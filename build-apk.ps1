# PowerShell build script for Allmax Studio Android APK
$ErrorActionPreference = "Stop"

$SdkDir = "$env:LOCALAPPDATA\Android\Sdk"
$BuildToolsDir = "$SdkDir\build-tools\35.0.0"
$PlatformJar = "$SdkDir\platforms\android-34\android.jar"
$JavaHome = "C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot"
$Javac = "$JavaHome\bin\javac.exe"
$Keytool = "$JavaHome\bin\keytool.exe"

$Aapt2 = "$BuildToolsDir\aapt2.exe"
$D8 = "$BuildToolsDir\d8.bat"
$Zipalign = "$BuildToolsDir\zipalign.exe"
$ApkSigner = "$BuildToolsDir\apksigner.bat"

$DebugKeystore = "$env:USERPROFILE\.android\debug.keystore"

Write-Host "=== Building Allmax Studio Android APK ===" -ForegroundColor Cyan

# 1. Prepare build directories
$BuildDir = "android\build"
$ObjDir = "$BuildDir\obj"
$BinDir = "$BuildDir\bin"
$GenDir = "$BuildDir\gen"
$CompiledResDir = "$BuildDir\compiled_res"

if (Test-Path $ObjDir) { Remove-Item -Recurse -Force $ObjDir }
if (Test-Path $BinDir) { Remove-Item -Recurse -Force $BinDir }
if (Test-Path $GenDir) { Remove-Item -Recurse -Force $GenDir }
if (Test-Path $CompiledResDir) { Remove-Item -Recurse -Force $CompiledResDir }

New-Item -ItemType Directory -Force -Path $ObjDir, $BinDir, $GenDir, $CompiledResDir | Out-Null

# 2. Compile Android resources with aapt2
Write-Host "1/6. Compiling Android XML resources..." -ForegroundColor Yellow
& $Aapt2 compile --dir "android\res" -o "$CompiledResDir\resources.zip"
if ($LASTEXITCODE -ne 0) { throw "aapt2 compile failed" }

# 3. Link resources and generate R.java and unaligned APK
Write-Host "2/6. Linking resources & generating R.java..." -ForegroundColor Yellow
& $Aapt2 link -I $PlatformJar `
    --manifest "android\AndroidManifest.xml" `
    --java $GenDir `
    -o "$BinDir\app-unaligned.apk" `
    --auto-add-overlay `
    "$CompiledResDir\resources.zip"
if ($LASTEXITCODE -ne 0) { throw "aapt2 link failed" }

# 4. Compile Java sources with javac
Write-Host "3/6. Compiling Java sources with javac..." -ForegroundColor Yellow
$JavaSources = Get-ChildItem -Path "android\src", $GenDir -Filter "*.java" -Recurse | Select-Object -ExpandProperty FullName
& $Javac -encoding UTF-8 -source 1.8 -target 1.8 -cp $PlatformJar -d $ObjDir $JavaSources
if ($LASTEXITCODE -ne 0) { throw "javac compilation failed" }

# 5. Convert class files to Dalvik bytecode (classes.dex) with d8
Write-Host "4/6. Converting bytecode to classes.dex with d8..." -ForegroundColor Yellow
$ClassFiles = Get-ChildItem -Path $ObjDir -Filter "*.class" -Recurse | Select-Object -ExpandProperty FullName
& $D8 --lib $PlatformJar --output $BinDir $ClassFiles
if ($LASTEXITCODE -ne 0) { throw "d8 dexing failed" }

# Add classes.dex into unaligned APK using jar/zip
Write-Host "Adding classes.dex to APK package..."
$JarExe = "$JavaHome\bin\jar.exe"
Push-Location $BinDir
& $JarExe -uf "app-unaligned.apk" "classes.dex"
Pop-Location

# 6. Align APK with zipalign
Write-Host "5/6. Aligning APK with zipalign..." -ForegroundColor Yellow
& $Zipalign -f -v 4 "$BinDir\app-unaligned.apk" "$BinDir\app-aligned.apk"
if ($LASTEXITCODE -ne 0) { throw "zipalign failed" }

# 7. Sign APK with apksigner
Write-Host "6/6. Signing APK with apksigner..." -ForegroundColor Yellow
& $ApkSigner sign --ks $DebugKeystore --ks-key-alias androiddebugkey --ks-pass pass:android --key-pass pass:android --out "$BinDir\AllmaxStudio.apk" "$BinDir\app-aligned.apk"
if ($LASTEXITCODE -ne 0) { throw "apksigner failed" }

# Verify signed APK
& $ApkSigner verify "$BinDir\AllmaxStudio.apk"
if ($LASTEXITCODE -ne 0) { throw "apksigner verification failed" }

# Copy to root and public directories for direct download
Copy-Item "$BinDir\AllmaxStudio.apk" "AllmaxStudio.apk" -Force
Copy-Item "$BinDir\AllmaxStudio.apk" "public\AllmaxStudio.apk" -Force

$ApkSize = (Get-Item "AllmaxStudio.apk").Length / 1KB
Write-Host ("=== APK Built Successfully! Size: {0:N1} KB ===" -f $ApkSize) -ForegroundColor Green
Write-Host "Location 1: e:\github\Allmax Media\AllmaxStudio.apk"
Write-Host "Location 2: http://192.168.1.16:3000/AllmaxStudio.apk"
