import 'dart:io';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  final ApiService _apiService = ApiService();
  bool _exporting = false;
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
    setState(() => _exporting = true);
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
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Export failed: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _exporting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateFormat = DateFormat.yMMMd();

    final categories = [
      {'title': 'Sales Reports', 'desc': 'Daily, weekly, monthly sales', 'icon': Icons.receipt_long, 'color': Colors.blue},
      {'title': 'Purchase Reports', 'desc': 'Purchase history & analysis', 'icon': Icons.shopping_cart, 'color': Colors.green},
      {'title': 'Inventory Reports', 'desc': 'Stock levels & movements', 'icon': Icons.inventory_2, 'color': Colors.orange},
      {'title': 'Customer Reports', 'desc': 'Customer activity & stats', 'icon': Icons.people, 'color': Colors.cyan},
      {'title': 'Payment Reports', 'desc': 'Payments received & pending', 'icon': Icons.payments, 'color': Colors.purple},
      {'title': 'Tax Reports', 'desc': 'GST & tax summaries', 'icon': Icons.pie_chart, 'color': Colors.red},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Reports'),
        actions: [
          IconButton(
            icon: const Icon(Icons.date_range),
            onPressed: _selectDateRange,
            tooltip: 'Select Date Range',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
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
            Text('Report Categories', style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.4,
              children: categories.map((cat) {
                final color = cat['color'] as Color;
                return Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: color.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(cat['icon'] as IconData, color: color, size: 22),
                        ),
                        const SizedBox(height: 8),
                        Text(cat['title'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        const SizedBox(height: 2),
                        Text(cat['desc'] as String, style: TextStyle(fontSize: 11, color: Colors.grey[600])),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
            Text('Quick Exports', style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Column(
                children: [
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                      child: const Icon(Icons.receipt, color: Colors.green),
                    ),
                    title: const Text('QuickBooks Export', style: TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: const Text('Download CSV for QuickBooks'),
                    trailing: _exporting
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.download, color: Colors.green),
                    onTap: () => _export('quickbooks'),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: Colors.orange.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                      child: const Icon(Icons.inventory, color: Colors.orange),
                    ),
                    title: const Text('Tally ERP 9 Export', style: TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: const Text('Download XML for Tally'),
                    trailing: _exporting
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.download, color: Colors.orange),
                    onTap: () => _export('tally'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
