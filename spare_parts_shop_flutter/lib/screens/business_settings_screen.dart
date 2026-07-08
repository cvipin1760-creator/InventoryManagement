import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../constants/app_theme.dart';

class BusinessSettingsScreen extends StatefulWidget {
  const BusinessSettingsScreen({super.key});

  @override
  State<BusinessSettingsScreen> createState() => _BusinessSettingsScreenState();
}

class _BusinessSettingsScreenState extends State<BusinessSettingsScreen> {
  final ApiService _apiService = ApiService();
  dynamic _business;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBusiness();
  }

  Future<void> _loadBusiness() async {
    try {
      final business = await _apiService.getBusiness();
      setState(() {
        _business = business;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load business info: $e')));
      }
    }
  }

  Future<void> _updateSubscription(String plan) async {
    try {
      await _apiService.updateSubscription(_business['id'], plan);
      _loadBusiness();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Subscription updated!')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to update: $e')));
      }
    }
  }

  Future<void> _toggleStatus(bool isActive) async {
    try {
      await _apiService.toggleSubscriptionStatus(_business['id'], isActive);
      _loadBusiness();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to toggle status: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Business Settings'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _business == null
              ? const Center(child: Text('No business data found'))
              : Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Card(
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _business['name'] ?? 'Your Business',
                                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 8),
                              Text('Email: ${_business['email'] ?? 'N/A'}'),
                              Text('Phone: ${_business['phone'] ?? 'N/A'}'),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Card(
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Subscription & Billing', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                              const Divider(height: 32),
                              ListTile(
                                title: const Text('Current Plan'),
                                trailing: DropdownButton<String>(
                                  value: _business['subscriptionPlan'] ?? 'FREE',
                                  items: ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE']
                                      .map((p) => DropdownMenuItem(value: p, child: Text(p)))
                                      .toList(),
                                  onChanged: (val) {
                                    if (val != null) _updateSubscription(val);
                                  },
                                ),
                              ),
                              ListTile(
                                title: const Text('Account Status'),
                                trailing: Switch(
                                  value: _business['isActive'] ?? false,
                                  onChanged: _toggleStatus,
                                  activeColor: AppTheme.primaryColor,
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
