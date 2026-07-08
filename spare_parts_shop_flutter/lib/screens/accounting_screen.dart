import 'dart:io';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import '../services/api_service.dart';

class AccountingScreen extends StatefulWidget {
  const AccountingScreen({super.key});

  @override
  State<AccountingScreen> createState() => _AccountingScreenState();
}

class _AccountingScreenState extends State<AccountingScreen> {
  final ApiService _apiService = ApiService();
  bool _isExporting = false;

  Future<void> _exportTallyXml() async {
    setState(() {
      _isExporting = true;
    });
    try {
      final xmlString = await _apiService.exportTallyXml();
      final directory = await getApplicationDocumentsDirectory();
      final file = File('${directory.path}/Tally_Export_${DateTime.now().millisecondsSinceEpoch}.xml');
      await file.writeAsString(xmlString);
      
      if (mounted) {
        setState(() {
          _isExporting = false;
        });
        await Share.shareXFiles([XFile(file.path)], text: 'Tally XML Export');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isExporting = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to export Tally XML: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Accounting & Exports'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Export Data for Accounting Software',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Card(
              child: ListTile(
                leading: const Icon(Icons.account_balance, color: Colors.blue, size: 40),
                title: const Text('Tally ERP 9 / Tally Prime XML'),
                subtitle: const Text('Export all bills, purchases, and receipts.'),
                trailing: _isExporting
                    ? const CircularProgressIndicator()
                    : ElevatedButton(
                        onPressed: _exportTallyXml,
                        child: const Text('Export'),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
