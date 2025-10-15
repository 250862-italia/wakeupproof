import 'package:flutter/material.dart';
import 'ui/screens/alarm_screen.dart';

void main() {
  runApp(const WakeupApp());
}

class WakeupApp extends StatelessWidget {
  const WakeupApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WakeUpProof',
      theme: ThemeData(useMaterial3: true),
      home: const AlarmScreen(),
    );
  }
}
