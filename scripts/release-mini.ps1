# 上传微信 + 抖音小程序（需先配置 .env.upload）
# 用法：在仓库根目录  .\scripts\release-mini.ps1

$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

if (-not (Test-Path ".env.upload")) {
    Write-Host "[X] 未找到 .env.upload" -ForegroundColor Red
    Write-Host "    请执行:  copy .env.upload.example .env.upload"
    Write-Host "    填写微信 AppID、私钥路径、抖音邮箱密码后重试。"
    exit 1
}

npm.cmd run upload:mini
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "[OK] 已完成 upload:mini" -ForegroundColor Green
