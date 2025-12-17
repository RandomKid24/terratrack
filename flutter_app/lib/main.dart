import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'data/database.dart';
import 'ui/main_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Database
  final db = DatabaseService();
  await db.db; // Wait for DB to open

  runApp(
    const ProviderScope(
      child: TerraTrackApp(),
    ),
  );
}

class TerraTrackApp extends StatelessWidget {
  const TerraTrackApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TerraTrack',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: Colors.green,
        brightness: Brightness.light,
        scaffoldBackgroundColor: Colors.grey.shade50,
      ),
      home: const MainScreen(),
    );
  }
}
