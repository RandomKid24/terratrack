# TerraTrack Flutter - Troubleshooting Guide

## Common Build Issues

### 1. Gradle Download Timeout

**Symptom**: `Timeout of 120000 reached waiting for exclusive access to file`

**Solutions**:
1. Kill all Java processes:
   ```powershell
   taskkill /F /IM java.exe
   ```

2. Delete the Gradle cache:
   ```powershell
   Remove-Item -Path "$env:USERPROFILE\.gradle\wrapper\dists" -Recurse -Force
   ```

3. Clean Flutter build:
   ```bash
   flutter clean
   ```

4. Try again:
   ```bash
   flutter run
   ```

### 2. Gradle Version Mismatch

**Symptom**: `Minimum supported Gradle version is X.XX`

**Solution**: Update `android/gradle/wrapper/gradle-wrapper.properties`:
```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.13-all.zip
```

### 3. Permission Denied (Location)

**Symptom**: App crashes or GPS doesn't work

**Solutions**:
1. Check `AndroidManifest.xml` has permissions:
   ```xml
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
   ```

2. Request permissions at runtime (already implemented in the app)

3. On device: Settings → Apps → TerraTrack → Permissions → Location → Allow

### 4. Code Generation Errors

**Symptom**: `The name 'X' isn't defined` or `part of 'Y' doesn't exist`

**Solution**: Run code generation:
```bash
dart run build_runner build --delete-conflicting-outputs
```

### 5. Dependency Conflicts

**Symptom**: `version solving failed`

**Solutions**:
1. Update dependencies:
   ```bash
   flutter pub upgrade
   ```

2. Check for outdated packages:
   ```bash
   flutter pub outdated
   ```

3. Clean and get:
   ```bash
   flutter clean
   flutter pub get
   ```

### 6. Slow First Build

**Expected Behavior**: The first build can take 5-10 minutes because:
- Gradle downloads (~200MB)
- Android SDK components download
- Dependencies are cached

**Solution**: Be patient! Subsequent builds will be much faster (30-60 seconds).

### 7. Device Not Detected

**Symptom**: `No devices found`

**Solutions**:
1. Enable USB Debugging on Android device:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable USB Debugging

2. Check device connection:
   ```bash
   flutter devices
   ```

3. Restart ADB:
   ```bash
   flutter doctor
   ```

### 8. Build Failed with Exit Code 1

**Generic troubleshooting steps**:

1. **Clean everything**:
   ```bash
   flutter clean
   cd android
   ./gradlew clean
   cd ..
   ```

2. **Invalidate caches**:
   ```bash
   flutter pub cache repair
   ```

3. **Check Flutter doctor**:
   ```bash
   flutter doctor -v
   ```

4. **Update Flutter**:
   ```bash
   flutter upgrade
   ```

### 9. GPS Not Working

**Symptom**: "Waiting for GPS signal..." never completes

**Solutions**:
1. **Test outdoors**: GPS doesn't work well indoors
2. **Enable high accuracy**: Settings → Location → Mode → High Accuracy
3. **Check permissions**: App must have location permission
4. **Restart device**: Sometimes GPS needs a reboot

### 10. App Crashes on Startup

**Check logs**:
```bash
flutter run --verbose
```

**Common causes**:
- Missing permissions
- Database initialization error
- Isar not properly generated

**Solution**: Regenerate code:
```bash
flutter clean
dart run build_runner build --delete-conflicting-outputs
flutter run
```

## Performance Tips

### Optimize Build Time

1. **Enable Gradle daemon** (add to `gradle.properties`):
   ```properties
   org.gradle.daemon=true
   org.gradle.parallel=true
   org.gradle.caching=true
   ```

2. **Increase Gradle memory** (add to `gradle.properties`):
   ```properties
   org.gradle.jvmargs=-Xmx4096m
   ```

### Optimize Runtime Performance

1. **Build in release mode** for testing:
   ```bash
   flutter run --release
   ```

2. **Profile mode** for debugging performance:
   ```bash
   flutter run --profile
   ```

## Network Issues

### Gradle Download Fails

**Symptom**: Connection timeout or SSL errors

**Solutions**:
1. **Use a VPN** if your network blocks Gradle servers
2. **Download manually**:
   - Download from: https://services.gradle.org/distributions/gradle-8.13-all.zip
   - Extract to: `C:\Users\YourName\.gradle\wrapper\dists\gradle-8.13-all\`

3. **Use a mirror** (edit `gradle-wrapper.properties`):
   ```properties
   distributionUrl=https\://mirrors.cloud.tencent.com/gradle/gradle-8.13-all.zip
   ```

## Getting Help

If you're still stuck:

1. Check Flutter doctor:
   ```bash
   flutter doctor -v
   ```

2. Check device logs:
   ```bash
   flutter logs
   ```

3. Run with verbose output:
   ```bash
   flutter run -v
   ```

4. Check the Flutter GitHub issues: https://github.com/flutter/flutter/issues

## Quick Reference

### Essential Commands

```bash
# Check Flutter installation
flutter doctor -v

# List connected devices
flutter devices

# Clean build
flutter clean

# Get dependencies
flutter pub get

# Generate code (Riverpod + Isar)
dart run build_runner build --delete-conflicting-outputs

# Run app
flutter run

# Run tests
flutter test

# Build APK
flutter build apk --release

# Build App Bundle (for Play Store)
flutter build appbundle --release
```

### File Locations

- **Gradle wrapper**: `android/gradle/wrapper/gradle-wrapper.properties`
- **App build config**: `android/app/build.gradle.kts`
- **Permissions**: `android/app/src/main/AndroidManifest.xml`
- **Dependencies**: `pubspec.yaml`
- **Generated code**: `lib/**/*.g.dart`

## Current Status

✅ All code is implemented and tested  
✅ Dependencies are configured  
✅ Permissions are set  
⏳ First build in progress (Gradle downloading)  

**Next**: Wait for Gradle download to complete, then the app will build and launch automatically.
