import 'package:flutter/material.dart';
import '../services/api_service.dart';

class PaymentSettingsScreen extends StatefulWidget {
  const PaymentSettingsScreen({super.key});

  @override
  State<PaymentSettingsScreen> createState() => _PaymentSettingsScreenState();
}

class _PaymentSettingsScreenState extends State<PaymentSettingsScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  
  final TextEditingController _razorpayKeyController = TextEditingController();
  final TextEditingController _razorpaySecretController = TextEditingController();
  
  final TextEditingController _stripeKeyController = TextEditingController();
  final TextEditingController _stripeSecretController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }
  
  @override
  void dispose() {
    _razorpayKeyController.dispose();
    _razorpaySecretController.dispose();
    _stripeKeyController.dispose();
    _stripeSecretController.dispose();
    super.dispose();
  }

  Future<void> _loadSettings() async {
    try {
      final response = await _apiService.get('/business/payment-settings'); // Adjust endpoint if needed
      if (mounted) {
        setState(() {
          if (response != null && response is Map) {
            _razorpayKeyController.text = response['razorpayKeyId'] ?? '';
            _razorpaySecretController.text = response['razorpayKeySecret'] ?? '';
            _stripeKeyController.text = response['stripePublishableKey'] ?? '';
            _stripeSecretController.text = response['stripeSecretKey'] ?? '';
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not load payment settings: $e')),
        );
      }
    }
  }

  Future<void> _saveSettings() async {
    setState(() => _isLoading = true);
    try {
      await _apiService.put('/business/payment-settings', body: {
        'razorpayKeyId': _razorpayKeyController.text,
        'razorpayKeySecret': _razorpaySecretController.text,
        'stripePublishableKey': _stripeKeyController.text,
        'stripeSecretKey': _stripeSecretController.text,
      });
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payment settings saved successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save settings: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment Settings'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Razorpay Configuration', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _razorpayKeyController,
                    decoration: const InputDecoration(
                      labelText: 'Razorpay Key ID',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _razorpaySecretController,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'Razorpay Key Secret',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 32),
                  const Text('Stripe Configuration', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _stripeKeyController,
                    decoration: const InputDecoration(
                      labelText: 'Stripe Publishable Key',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _stripeSecretController,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'Stripe Secret Key',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _saveSettings,
                      child: const Text('Save Settings', style: TextStyle(fontSize: 18)),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
