#!/usr/bin/env bash
set -euo pipefail

VERSION="8.18.4"
OS="$(uname | tr '[:upper:]' '[:lower:]')"
ARCH="x64"

URL="https://github.com/gitleaks/gitleaks/releases/download/v${VERSION}/gitleaks_${VERSION}_${OS}_${ARCH}.tar.gz"

echo "⬇️ Installing Gitleaks v${VERSION}..."
curl -L "$URL" -o /tmp/gitleaks.tar.gz
tar -xzf /tmp/gitleaks.tar.gz -C /tmp
mkdir -p tools
mv /tmp/gitleaks tools/gitleaks
chmod +x tools/gitleaks
rm /tmp/gitleaks.tar.gz

./tools/gitleaks version
