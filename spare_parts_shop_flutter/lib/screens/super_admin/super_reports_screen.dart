import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class SuperReportsScreen extends StatefulWidget {
  const SuperReportsScreen({super.key});

  @override
  State<SuperReportsScreen> createState() => _SuperReportsScreenState();
}

class _SuperReportsScreenState extends State<SuperReportsScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  dynamic _stats;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    try {
      final response = await _apiService.get('/superadmin/stats'); // Adjust if needed
      if (mounted) {
        setState(() {
          _stats = response;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load global stats: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Global Reports (Super Admin)')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _stats == null
              ? const Center(child: Text('No reports available'))
              : Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildStatCard('Total Tenants', _stats['totalTenants']?.toString() ?? '0', Colors.blue),
                          _buildStatCard('Total Revenue', '₹${_stats['totalRevenue'] ?? '0'}', Colors.green),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildStatCard('Active Users', _stats['activeUsers']?.toString() ?? '0', Colors.orange),
                          _buildStatCard('System Uptime', _stats['uptime'] ?? '99.9%', Colors.purple),
                        ],
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildStatCard(String title, String value, Color color) {
    return Expanded(
      child: Card(
        color: color.withOpacity(0.1),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              Text(title, style: TextStyle(color: color, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }
}
