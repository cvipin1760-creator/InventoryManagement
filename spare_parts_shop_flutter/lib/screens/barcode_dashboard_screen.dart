import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../core/theme/app_theme.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class BarcodeDashboardScreen extends StatefulWidget {
  const BarcodeDashboardScreen({Key? key}) : super(key: key);

  @override
  State<BarcodeDashboardScreen> createState() => _BarcodeDashboardScreenState();
}

class _BarcodeDashboardScreenState extends State<BarcodeDashboardScreen> {
  bool _isLoading = false;
  Map<String, dynamic> _stats = {
    'totalProducts': 0,
    'missingBarcodes': 0,
    'recentlyPrinted': 0
  };

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() => _isLoading = true);
    try {
      final api = context.read<ApiService>();
      final products = await api.get('/products');
      // Calculate missing barcodes locally for simplicity in this demo,
      // in production this would be an aggregate endpoint.
      int total = 0;
      int missing = 0;
      
      if (products != null && products is Map && products.containsKey('content')) {
        List content = products['content'];
        total = content.length;
        missing = content.where((p) => p['barcode'] == null || p['barcode'].toString().isEmpty).length;
      }
      
      setState(() {
        _stats['totalProducts'] = total;
        _stats['missingBarcodes'] = missing;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error loading stats: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _generateMissingBarcodes() async {
    setState(() => _isLoading = true);
    try {
      final api = context.read<ApiService>();
      final res = await api.generateMissingBarcodes();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Generated ${res["generatedCount"]} barcodes')),
        );
        _loadStats();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Barcode & Labels'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadStats),
        ],
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : RefreshIndicator(
            onRefresh: _loadStats,
            child: ListView(
              padding: const EdgeInsets.all(16.0),
              children: [
                _buildStatCards(),
                const SizedBox(height: 24),
                _buildActionButtons(context),
              ],
            ),
          ),
    );
  }

  Widget _buildStatCards() {
    return Row(
      children: [
        Expanded(
          child: _StatCard(
            title: 'Total Products',
            value: _stats['totalProducts'].toString(),
            icon: Icons.inventory_2_outlined,
            color: Colors.blue,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _StatCard(
            title: 'Missing Barcodes',
            value: _stats['missingBarcodes'].toString(),
            icon: Icons.warning_amber_rounded,
            color: _stats['missingBarcodes'] > 0 ? Colors.orange : Colors.green,
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Quick Actions',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 1.5,
          children: [
            _ActionButton(
              title: 'Print Single',
              icon: Icons.print,
              onTap: () => Navigator.pushNamed(context, '/barcode-print'),
            ),
            _ActionButton(
              title: 'Generate Missing',
              icon: Icons.auto_awesome,
              onTap: _generateMissingBarcodes,
            ),
            _ActionButton(
              title: 'Templates',
              icon: Icons.dashboard_customize,
              onTap: () => Navigator.pushNamed(context, '/barcode-templates'),
            ),
            _ActionButton(
              title: 'History',
              icon: Icons.history,
              onTap: () => Navigator.pushNamed(context, '/barcode-history'),
            ),
          ],
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 12),
            Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(title, style: TextStyle(color: Colors.grey.shade600, fontSize: 14)),
          ],
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final String title;
  final IconData icon;
  final VoidCallback onTap;

  const _ActionButton({
    required this.title,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).primaryColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Theme.of(context).primaryColor.withOpacity(0.3)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Theme.of(context).primaryColor, size: 32),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                color: Theme.of(context).primaryColor,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
