#!/bin/bash

# Script to install the necessary dependencies for QuickAid profile image feature

echo "Installing dependencies for QuickAid profile image feature..."

# Install npm packages with legacy-peer-deps to bypass version constraints
echo "Installing @react-native-firebase/storage with matching version..."
npm install @react-native-firebase/storage@21.6.1 --save --legacy-peer-deps

echo "Installing react-native-image-picker..."
npm install react-native-image-picker --save --legacy-peer-deps

# Install pods for iOS
cd ios
pod install
cd ..

echo "Cleaning build folders..."
# Clean Android build
cd android
./gradlew clean
cd ..

echo "Dependencies installed successfully!"
echo "You can now run 'npm run android' or 'npm run ios' to start the app." 