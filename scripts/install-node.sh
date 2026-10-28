#!/bin/sh
# Installs the official Node.js binary into /opt/node during the Nixpacks
# setup phase. Version and checksums come from nixpacks.toml [variables];
# /opt/node/bin is put on PATH via the setup phase `paths`.
set -eu

case "$(uname -m)" in
  x86_64) arch=x64; sum="$NODE_SHA256_X64" ;;
  aarch64) arch=arm64; sum="$NODE_SHA256_ARM64" ;;
  *) echo "install-node: unsupported architecture $(uname -m)" >&2; exit 1 ;;
esac

tarball="node-v${NODE_VERSION}-linux-${arch}.tar.xz"
curl -fsSL --retry 3 -o "/tmp/$tarball" "https://nodejs.org/dist/v${NODE_VERSION}/$tarball"
echo "$sum  /tmp/$tarball" | sha256sum -c -
mkdir -p /opt/node
tar -xJf "/tmp/$tarball" -C /opt/node --strip-components=1 --no-same-owner
rm "/tmp/$tarball"

installed="$(/opt/node/bin/node --version)"
if [ "$installed" != "v${NODE_VERSION}" ]; then
  echo "install-node: expected v${NODE_VERSION}, got $installed" >&2
  exit 1
fi
echo "install-node: Node.js $installed installed"
