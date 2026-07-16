import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class SubscriptionsScreen extends StatefulWidget {
  const SubscriptionsScreen({super.key});

  @override
  State<SubscriptionsScreen> createState() => _SubscriptionsScreenState();
}

class _SubscriptionsScreenState extends State<SubscriptionsScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<dynamic> _subscriptions = [];

  @override
  void initState() {
    super.initState();
    _loadSubscriptions();
  }

  Future<void> _loadSubscriptions() async {
    try {
      final response = await _apiService.get('/superadmin/subscriptions'); // Adjust if needed
      if (mounted) {
        setState(() {
          _subscriptions = response is List ? response : [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load subscriptions: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Global Subscriptions (Super Admin)')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _subscriptions.isEmpty
              ? const Center(child: Text('No active subscriptions across tenants'))
              : ListView.builder(
                  itemCount: _subscriptions.length,
                  itemBuilder: (context, index) {
                    final sub = _subscriptions[index];
                    return ListTile(
                      leading: const Icon(Icons.business),
                      title: Text(sub['businessName'] ?? 'Unknown Business'),
                      subtitle: Text('Plan: ${sub['planTier']} | Expires: ${sub['expiryDate']}'),
                      trailing: Text(sub['status'] ?? 'ACTIVE'),
                    );
                  },
                ),
    );
  }
}
