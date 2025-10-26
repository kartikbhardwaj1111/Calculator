# Running the Simple Calculator App on Expo Go

## Prerequisites
1. **Install Expo Go** on your mobile device:
   - iOS: Download from App Store
   - Android: Download from Google Play Store

2. **Ensure both devices are on the same WiFi network**

## Steps to Run the App

### 1. Start the Development Server
```bash
npm start
```
or
```bash
npx expo start
```

### 2. Connect Your Device

#### Option A: QR Code (Recommended)
1. After running `npm start`, a QR code will appear in your terminal
2. Open Expo Go app on your phone
3. Scan the QR code with your phone's camera (iOS) or within Expo Go app (Android)

#### Option B: Manual Connection
1. Note the IP address and port shown in the terminal (e.g., `exp://192.168.1.100:8081`)
2. Open Expo Go app
3. Tap "Enter URL manually"
4. Enter the URL shown in your terminal

### 3. Troubleshooting Connection Issues

#### If you see "Network response timed out" or "Could not connect":

1. **Check WiFi Connection**: Ensure both computer and phone are on the same WiFi network
2. **Try Tunnel Mode**: Run `npx expo start --tunnel`
3. **Check Firewall**: Temporarily disable firewall on your computer
4. **Use LAN Mode**: Run `npx expo start --lan`
5. **Clear Expo Cache**: Run `npx expo start -c`

#### If you see "There was a problem running the requested app":

1. **Clear Metro Cache**: 
   ```bash
   npx expo start --clear
   ```

2. **Reset Node Modules**:
   ```bash
   rm -rf node_modules
   npm install
   npx expo start
   ```

3. **Check App Configuration**: Ensure app.json is properly configured

### 4. Development Commands

- `npm start` - Start the development server
- `npm run android` - Open on Android emulator
- `npm run ios` - Open on iOS simulator
- `npm run web` - Open in web browser
- `npm test` - Run tests

### 5. Common Issues and Solutions

#### "Module not found" errors:
```bash
npm install
npx expo install --fix
```

#### "Metro bundler error":
```bash
npx expo start --clear
```

#### "Network error":
- Try using tunnel mode: `npx expo start --tunnel`
- Check if port 8081 is available
- Restart your router/WiFi

#### "App crashes on startup":
- Check the error logs in Expo Go
- Ensure all dependencies are properly installed
- Try clearing the cache

## App Features
- Basic arithmetic operations (+, -, ×, ÷)
- Decimal number support
- Percentage calculations
- Sign toggle (+/-)
- Error handling
- Responsive design for different screen sizes
- Haptic feedback (iOS) and vibration (Android)

## Testing
Run the test suite with:
```bash
npm test
```

The app includes comprehensive tests for:
- Core calculation functionality
- Cross-platform compatibility
- Performance optimization
- User flow integration
- Error handling scenarios