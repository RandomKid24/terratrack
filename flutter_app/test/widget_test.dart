import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_app/main.dart';

void main() {
  testWidgets('TerraTrack app smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      const ProviderScope(
        child: TerraTrackApp(),
      ),
    );

    // Verify that the app title is present
    expect(find.text('Capture Field'), findsOneWidget);
  });
}
