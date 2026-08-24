$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$GameUrl     = 'https://kaalflash12.github.io/naruto-unison-v23-online/'
$AdminUrl    = 'https://kaalflash12.github.io/naruto-unison-v23-online/admin.html'
$RecoveryUrl = 'https://kaalflash12.github.io/naruto-unison-v23-online/recovery.html'
$ZipName     = 'NARUTO-UNISON-ONLINE-FINAL.zip'
$Here        = Split-Path -Parent $MyInvocation.MyCommand.Path
$ZipPath     = Join-Path $Here $ZipName
$InstallDir  = Join-Path $env:LOCALAPPDATA 'NarutoUnisonOnline'
$Desktop     = [Environment]::GetFolderPath('Desktop')

function Test-Web([string]$Url) {
    try {
        $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 20
        if ([int]$r.StatusCode -ne 200) { throw "HTTP $($r.StatusCode)" }
        return $true
    } catch {
        throw "Falha ao validar $Url : $($_.Exception.Message)"
    }
}

function New-InternetShortcut([string]$Path,[string]$Url) {
    $text = "[InternetShortcut]`r`nURL=$Url`r`n"
    [IO.File]::WriteAllText($Path,$text,[Text.Encoding]::ASCII)
}

Write-Host 'Naruto Unison Online - instalacao/validacao' -ForegroundColor Cyan
if (-not (Test-Path -LiteralPath $ZipPath)) {
    throw "ZIP nao encontrado ao lado deste instalador: $ZipPath"
}

Write-Host 'Validando jogo online...'
Test-Web $GameUrl | Out-Null
Test-Web $AdminUrl | Out-Null
Test-Web $RecoveryUrl | Out-Null

Write-Host 'Extraindo copia local de seguranca...'
if (Test-Path -LiteralPath $InstallDir) {
    Remove-Item -LiteralPath $InstallDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
Expand-Archive -LiteralPath $ZipPath -DestinationPath $InstallDir -Force

New-InternetShortcut (Join-Path $Desktop 'Naruto Unison Online.url') $GameUrl
New-InternetShortcut (Join-Path $Desktop 'Naruto Unison Admin.url') $AdminUrl
New-InternetShortcut (Join-Path $Desktop 'Naruto Unison Recuperacao.url') $RecoveryUrl

$Info = @"
Naruto Unison Online instalado/validado.

JOGO:       $GameUrl
ADMIN:      $AdminUrl
RECUPERACAO:$RecoveryUrl
BACKUP:     $InstallDir

A senha administrativa nao e gravada pelo instalador.
"@
[IO.File]::WriteAllText((Join-Path $InstallDir 'ATALHOS-E-ENDERECOS.txt'),$Info,[Text.Encoding]::UTF8)

Write-Host ''
Write-Host 'OK - jogo, admin e recuperacao responderam HTTP 200.' -ForegroundColor Green
Write-Host "Backup local: $InstallDir"
Write-Host 'Atalhos criados na Area de Trabalho.'
Start-Process $GameUrl
