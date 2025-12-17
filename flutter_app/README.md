# TerraTrack Flutter - Native Android Field Mapping App

A production-ready native Android application for agricultural field mapping and coverage path planning, converted from the React PWA version.

## Features

- 🌍 **High-Accuracy GPS Tracking**: Real-time position streaming with Geolocator
- 📐 **Field Polygon Capture**: Walk the perimeter and capture corner points
- 🤖 **Smart Path Planning**: Multi-angle scanline optimization for efficient coverage
- 💾 **Offline Storage**: Isar database for persistent field data
- 🎨 **Material 3 Design**: Modern, beautiful UI with green color scheme
- 📱 **Native Performance**: Built with Flutter for smooth 60fps rendering
- 🗺️ **Offline Maps**: CustomPainter-based rendering (no internet required)

## Quick Start

### Prerequisites
- Flutter SDK (latest stable)
- Android Studio or VS Code
- Android device or emulator

### Installation

1. **Navigate to the Flutter app directory**:
   ```bash
   cd flutter_app
   ```

2. **Install dependencies**:
   ```bash
   flutter pub get
   ```

3. **Generate code** (for Riverpod & Isar):
   ```bash
   dart run build_runner build --delete-conflicting-outputs
   ```

4. **Run the app**:
   ```bash
   flutter run
   ```

5. **Build APK** (for distribution):
   ```bash
   flutter build apk --release
   ```
   The APK will be in `build/app/outputs/flutter-apk/app-release.apk`

## Usage

### 1. Capture Mode
- Tap **"Start Survey"** to begin GPS tracking
- Walk to each corner of your field
- Tap **"Add Corner"** at each corner point
- Tap **"Finish Shape"** when done (minimum 3 corners)

### 2. Setup Mode
- Review field area and perimeter
- Configure equipment name and work width
- Tap **"Generate Plan"** to create coverage path

### 3. Plan Mode
- View the optimized scanline coverage path
- Tap **"Start Run"** to begin execution

### 4. Run Mode
- Follow the path visualization
- Track progress in real-time

## Architecture

### State Management
- **Riverpod 2.x** with code generation for type-safe state management
- Reactive UI updates with `AsyncValue` for GPS stream

### Database
- **Isar 3.x** for high-performance offline storage
- Embedded GPS points in field records
- Equipment settings persistence

### Core Logic
- **GeoUtils**: Ported from TypeScript with identical algorithms
  - Haversine distance calculation
  - Shoelace polygon area formula
  - Multi-angle scanline path optimization
  - GPS point simplification

### UI
- **CustomPainter** for map rendering (no external map SDKs)
- Cartesian projection of GPS coordinates
- Real-time position tracking with pulse animation
- Material 3 design system

## Testing

Run all tests:
```bash
flutter test
```

Run static analysis:
```bash
flutter analyze
```

## Permissions

The app requires the following Android permissions (configured in `AndroidManifest.xml`):
- `ACCESS_FINE_LOCATION`: High-accuracy GPS
- `ACCESS_COARSE_LOCATION`: Fallback location
- `INTERNET`: For Gemini AI (optional)

## Dependencies

### Production
- `flutter_riverpod: ^2.5.1` - State management
- `isar: ^3.1.0+1` - Database
- `geolocator: ^11.0.0` - GPS tracking
- `google_generative_ai: ^0.4.0` - AI insights
- `permission_handler: ^11.3.0` - Runtime permissions

### Development
- `build_runner: ^2.4.8` - Code generation
- `riverpod_generator: ^2.4.0` - Riverpod codegen
- `isar_generator: ^3.1.0+1` - Isar codegen

## Project Structure

```
lib/
├── core/
│   └── geo_utils.dart          # Geometry & path planning algorithms
├── data/
│   └── database.dart           # Isar schema & database service
├── providers/
│   └── app_state.dart          # Riverpod state providers
├── ui/
│   └── main_screen.dart        # Main UI with CustomPainter
└── main.dart                   # App entry point

test/
├── geo_utils_test.dart         # Unit tests for geometry
└── widget_test.dart            # Widget tests
```

## Performance

- **60 FPS** rendering with CustomPainter
- **< 100ms** path generation for typical fields
- **Offline-first** architecture (no network required for core features)
- **Battery-optimized** GPS streaming

## Troubleshooting

### GPS not working
- Ensure location permissions are granted
- Enable high-accuracy mode in device settings
- Test outdoors for best signal

### Build errors
- Run `flutter clean` then `flutter pub get`
- Regenerate code: `dart run build_runner build --delete-conflicting-outputs`
- Check Flutter version: `flutter doctor`

## License

Same as the original TerraTrack project.

## Credits

Converted from the TerraTrack React PWA by following the original architecture and algorithms.
