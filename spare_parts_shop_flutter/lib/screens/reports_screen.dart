import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  final ApiService _apiService = ApiService();
  bool _exporting = false;

  Future<void> _export(String type) async {
    setState(() => _exporting = true);
    try {
      if (type == 'tally') {
        await _apiService.exportTallyXml();
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${type == 'tally' ? 'Tally XML' : 'QuickBooks CSV'} export started — check Downloads'),
            backgroundColor: Colors.green,
          ),
        );
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

    final categories = [
      {'title': 'Sales Reports', 'desc': 'Daily, weekly, monthly sales', 'icon': Icons.receipt_long, 'color': Colors.blue},
      {'title': 'Purchase Reports', 'desc': 'Purchase history & analysis', 'icon': Icons.shopping_cart, 'color': Colors.green},
      {'title': 'Inventory Reports', 'desc': 'Stock levels & movements', 'icon': Icons.inventory_2, 'color': Colors.orange},
      {'title': 'Customer Reports', 'desc': 'Customer activity & stats', 'icon': Icons.people, 'color': Colors.cyan},
      {'title': 'Payment Reports', 'desc': 'Payments received & pending', 'icon': Icons.payments, 'color': Colors.purple},
      {'title': 'Tax Reports', 'desc': 'GST & tax summaries', 'icon': Icons.pie_chart, 'color': Colors.red},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Reports')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
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
                    subtitle: const Text('Download CSV for QuickBooks (Last 30 Days)'),
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
                    subtitle: const Text('Download XML for Tally (Last 30 Days)'),
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
