#!/bin/bash
# Vercel build script for Flutter Web
echo "Installing Flutter..."
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"

echo "Enabling Web..."
flutter config --enable-web

echo "Getting dependencies..."
flutter pub get

echo "Building Flutter Web..."
flutter build web --release --dart-define=BASE_URL=https://inventorymanagement-afhl.onrender.com/api
