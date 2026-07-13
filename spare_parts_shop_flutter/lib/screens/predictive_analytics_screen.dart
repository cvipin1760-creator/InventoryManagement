import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../constants/app_theme.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

class PredictiveAnalyticsScreen extends StatefulWidget {
  const PredictiveAnalyticsScreen({super.key});

  @override
  State<PredictiveAnalyticsScreen> createState() => _PredictiveAnalyticsScreenState();
}

class _PredictiveAnalyticsScreenState extends State<PredictiveAnalyticsScreen> {
  final ApiService _apiService = ApiService();
  Map<String, dynamic>? _data;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final data = await _apiService.getPredictiveAnalytics();
      if (mounted) {
        setState(() {
          _data = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load analytics: $e')),
        );
      }
    }
  }

  Future<void> _sendWhatsAppPromo(String phone, String name) async {
    final message = Uri.encodeComponent("Hi $name, we miss you! Here is a special 10% discount on your next purchase at StockPilot. Use code: COMEBACK10");
    final url = Uri.parse("https://wa.me/$phone?text=$message");
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open WhatsApp')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Predictive Analytics'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _data == null
              ? const Center(child: Text('No data available'))
              : RefreshIndicator(
                  onRefresh: _loadData,
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _buildSectionHeader('Dead Stock', 'No sales in last 60 days', FontAwesomeIcons.arrowTrendDown, AppTheme.errorColor),
                        _buildDeadStockList((_data!['deadStock'] as List?) ?? []),
                        const SizedBox(height: 24),
                        
                        _buildSectionHeader('Fast Moving', 'Top sellers in last 30 days', FontAwesomeIcons.arrowTrendUp, AppTheme.successColor),
                        _buildFastMovingList((_data!['fastMovingProducts'] as List?) ?? []),
                        const SizedBox(height: 24),

                        _buildSectionHeader('Churned Customers', 'No purchases in last 90 days', FontAwesomeIcons.usersSlash, AppTheme.warningColor),
                        _buildChurnedCustomersList((_data!['churnedCustomers'] as List?) ?? []),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildSectionHeader(String title, String subtitle, IconData icon, Color iconColor) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                Text(
                  subtitle,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey[600]),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeadStockList(List items) {
    if (items.isEmpty) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(16.0),
          child: Center(child: Text('Great! No dead stock found.')),
        ),
      );
    }
    return Card(
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: items.length > 5 ? 5 : items.length,
        separatorBuilder: (context, index) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final product = items[index];
          return ListTile(
            leading: Icon(Icons.warning_amber_rounded, color: AppTheme.errorColor),
            title: Text(product['name'] ?? ''),
            subtitle: Text('Part: ${product['partNumber']} | Stock: ${product['quantity']}'),
            trailing: Text(
              '₹${(product['price'] ?? 0).toStringAsFixed(2)}',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          );
        },
      ),
    );
  }

  Widget _buildFastMovingList(List items) {
    if (items.isEmpty) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(16.0),
          child: Center(child: Text('No recent sales data.')),
        ),
      );
    }
    return Card(
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: items.length > 5 ? 5 : items.length,
        separatorBuilder: (context, index) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final item = items[index];
          final product = item['product'];
          return ListTile(
            leading: Icon(Icons.bolt, color: AppTheme.successColor),
            title: Text(product['name'] ?? ''),
            subtitle: Text('Part: ${product['partNumber']} | Stock: ${product['quantity']}'),
            trailing: Chip(
              label: Text('${item['totalSold']} sold'),
              backgroundColor: AppTheme.successColor.withValues(alpha: 0.1),
              labelStyle: TextStyle(color: AppTheme.successColor, fontWeight: FontWeight.bold),
            ),
          );
        },
      ),
    );
  }

  Widget _buildChurnedCustomersList(List items) {
    if (items.isEmpty) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(16.0),
          child: Center(child: Text('Excellent! Customer retention is high.')),
        ),
      );
    }
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final customer = items[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 8.0),
          child: ListTile(
            title: Text(customer['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text(customer['phone'] ?? ''),
            trailing: OutlinedButton.icon(
              onPressed: () => _sendWhatsAppPromo(customer['phone'] ?? '', customer['name'] ?? ''),
              icon: const Icon(FontAwesomeIcons.whatsapp, size: 16),
              label: const Text('Promo'),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.green,
                side: const BorderSide(color: Colors.green),
              ),
            ),
          ),
        );
      },
    );
  }
}
