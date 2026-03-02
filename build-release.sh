#!/bin/bash

# Clean previous build
if [ -d "build-rel" ]; then
    rm -rf build-rel
fi

# Build in release mode
echo -e "\n\033[1;33mCompiling server (release mode)...\033[0m"
cargo build --release --manifest-path=server/Cargo.toml

if [ $? -ne 0 ]; then
    echo -e "\n\033[1;31mBuild failed!\033[0m"
    exit 1
fi

echo -e "\n\033[1;33mCreating release package...\033[0m"
mkdir build-rel
cp server/target/release/webmsnp build-rel
cp -r server/static build-rel/static
chmod +x build-rel/webmsnp

echo Build completed successfully! Release package created at: build-rel/
