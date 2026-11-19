$jdkRoot = Join-Path $env:LOCALAPPDATA 'Programs\Microsoft\jdk-21.0.13.1\jdk-21.0.13.1+2'
$java = Join-Path $jdkRoot 'bin\java.exe'
if (-not (Test-Path $java)) {
    throw 'JDK 21 is required. Install JDK 21 or update scripts/start-emulators.ps1 to point JAVA_HOME at it.'
}

$env:JAVA_HOME = $jdkRoot
$env:Path = "$jdkRoot\bin;$env:Path"
Set-Location (Join-Path $PSScriptRoot '..')
npx --yes firebase-tools emulators:start --project demo-landsphere
exit $LASTEXITCODE
