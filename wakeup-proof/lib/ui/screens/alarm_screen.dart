import 'package:flutter/material.dart';

class AlarmScreen extends StatefulWidget {
  const AlarmScreen({super.key});

  @override
  State<AlarmScreen> createState() => _AlarmScreenState();
}

class _AlarmScreenState extends State<AlarmScreen> {
  bool ringing = false;
  DateTime? nextAlarm;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('WakeUpProof')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Prototipo MVP — loop 30s e challenge engine',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 24),
            Row(
              children: [
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      ringing = true;
                    });
                  },
                  child: const Text('Simula suono sveglia'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      ringing = false;
                    });
                  },
                  child: const Text('Stop (debug)'),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Text('Stato: ${ringing ? 'RINGING' : 'IDLE'}'),
          ],
        ),
      ),
    );
  }
}
