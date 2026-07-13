import 'dart:io';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';

class AccountingScreen extends StatefulWidget {
  const AccountingScreen({super.key});

  @override
  State<AccountingScreen> createState() => _AccountingScreenState();
}

class _AccountingScreenState extends State<AccountingScreen> {
  final ApiService _apiService = ApiService();
  bool _isExporting = false;
  DateTimeRange _dateRange = DateTimeRange(
    start: DateTime.now().subtract(const Duration(days: 30)),
    end: DateTime.now(),
  );

  Future<void> _selectDateRange() async {
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 1)),
      initialDateRange: _dateRange,
    );
    if (picked != null) {
      setState(() => _dateRange = picked);
    }
  }

  Future<void> _export(String type) async {
    setState(() => _isExporting = true);
    final startStr = _dateRange.start.toIso8601String().substring(0, 19);
    final endStr = _dateRange.end.toIso8601String().substring(0, 19);

    try {
      String data;
      String filename;
      String text;

      if (type == 'tally') {
        data = await _apiService.exportTallyXml(startDate: startStr, endDate: endStr);
        filename = 'Tally_Export_${DateFormat('yyyyMMdd_HHmmss').format(DateTime.now())}.xml';
        text = 'Tally XML Export';
      } else {
        data = await _apiService.exportQuickBooksCsv(startDate: startStr, endDate: endStr);
        filename = 'QuickBooks_Export_${DateFormat('yyyyMMdd_HHmmss').format(DateTime.now())}.csv';
        text = 'QuickBooks CSV Export';
      }

      final directory = await getApplicationDocumentsDirectory();
      final file = File('${directory.path}/$filename');
      await file.writeAsString(data);

      if (mounted) {
        setState(() => _isExporting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${type == 'tally' ? 'Tally XML' : 'QuickBooks CSV'} exported successfully'),
            backgroundColor: Colors.green,
          ),
        );
        await Share.shareXFiles([XFile(file.path)], text: text);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isExporting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to export: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateFormat = DateFormat.yMMMd();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Accounting & Exports'),
        actions: [
          IconButton(
            icon: const Icon(Icons.date_range),
            onPressed: _selectDateRange,
            tooltip: 'Select Date Range',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Selected Date Range Card
            Card(
              elevation: 0,
              color: theme.colorScheme.primaryContainer.withOpacity(0.3),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Icon(Icons.date_range, color: theme.colorScheme.primary),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Active Date Range', style: TextStyle(fontSize: 12, color: Colors.grey[700], fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text(
                            '${dateFormat.format(_dateRange.start)} - ${dateFormat.format(_dateRange.end)}',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: _selectDateRange,
                      child: const Text('Change'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Export Data for Accounting Software',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 8.0),
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.account_balance, color: Colors.blue, size: 40),
                      title: const Text('Tally ERP 9 / Prime XML'),
                      subtitle: const Text('Export all bills, purchases, and receipts as XML.'),
                      trailing: _isExporting
                          ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2))
                          : IconButton(
                              icon: const Icon(Icons.download, color: Colors.blue),
                              onPressed: () => _export('tally'),
                              tooltip: 'Export Tally XML',
                            ),
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.receipt_long, color: Colors.green, size: 40),
                      title: const Text('QuickBooks CSV'),
                      subtitle: const Text('Export transactions formatted for QuickBooks.'),
                      trailing: _isExporting
                          ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2))
                          : IconButton(
                              icon: const Icon(Icons.download, color: Colors.green),
                              onPressed: () => _export('quickbooks'),
                              tooltip: 'Export QuickBooks CSV',
                            ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
