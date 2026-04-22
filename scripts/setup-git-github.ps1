# SudokuTaro: 在 Windows 上安装 Git 与 GitHub CLI，并提示后续授权步骤。
# 建议：右键 PowerShell -> 以管理员身份运行，再执行：
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
#   cd 本仓库根目录
#   .\scripts\setup-git-github.ps1

$ErrorActionPreference = "Stop"

function Test-Cmd($name) {
    $null -ne (Get-Command $name -ErrorAction SilentlyContinue)
}

Write-Host "== SudokuTaro: Git / GitHub CLI 安装脚本 ==" -ForegroundColor Cyan

if (-not (Test-Cmd "winget")) {
    Write-Host "[X] 未找到 winget。请从 Microsoft Store 安装「应用安装程序」或更新 Windows 10/11，然后重试。" -ForegroundColor Red
    Write-Host "    也可手动安装: https://git-scm.com/download/win 与 https://cli.github.com/"
    exit 1
}

if (-not (Test-Cmd "git")) {
    Write-Host "[*] 正在安装 Git for Windows (winget)..." -ForegroundColor Yellow
    winget install --id Git.Git -e --accept-package-agreements --accept-source-agreements
} else {
    Write-Host "[OK] 已检测到 git: $(git --version)" -ForegroundColor Green
}

if (-not (Test-Cmd "gh")) {
    Write-Host "[*] 正在安装 GitHub CLI (winget)..." -ForegroundColor Yellow
    winget install --id GitHub.cli -e --accept-package-agreements --accept-source-agreements
} else {
    Write-Host "[OK] 已检测到 gh: $(gh --version | Select-Object -First 1)" -ForegroundColor Green
}

Write-Host ""
Write-Host "请关闭本窗口，重新打开终端，然后依次执行：" -ForegroundColor Cyan
Write-Host "  gh auth login" -ForegroundColor White
Write-Host "  cd 你的SudokuTaro目录" -ForegroundColor White
Write-Host "  git init" -ForegroundColor White
Write-Host "  git add ." -ForegroundColor White
Write-Host "  git commit -m \"chore: initial commit\"" -ForegroundColor White
Write-Host "  git branch -M main" -ForegroundColor White
Write-Host "  gh repo create SudokuTaro --public --source=. --remote=origin --push" -ForegroundColor White
Write-Host ""
Write-Host "（若仓库名已存在，请换一个名字替换 SudokuTaro）" -ForegroundColor DarkGray
