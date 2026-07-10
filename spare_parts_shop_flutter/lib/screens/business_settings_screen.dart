import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../constants/app_theme.dart';
import '../services/secure_storage_service.dart';
import '../services/biometric_service.dart';

class BusinessSettingsScreen extends StatefulWidget {
  const BusinessSettingsScreen({super.key});

  @override
  State<BusinessSettingsScreen> createState() => _BusinessSettingsScreenState();
}

class _BusinessSettingsScreenState extends State<BusinessSettingsScreen> {
  final ApiService _apiService = ApiService();
  dynamic _business;
  bool _isLoading = true;
  bool _biometricEnabled = false;
  bool _biometricAvailable = false;
  final SecureStorageService _storageService = SecureStorageService();
  final BiometricService _biometricService = BiometricService();

  @override
  void initState() {
    super.initState();
    _loadBusiness();
    _loadBiometricSettings();
  }

  Future<void> _loadBiometricSettings() async {
    final available = await _biometricService.isBiometricAvailable();
    final enabled = await _storageService.getBiometricEnabled();
    if (mounted) {
      setState(() {
        _biometricAvailable = available;
        _biometricEnabled = enabled;
      });
    }
  }

  Future<void> _toggleBiometric(bool value) async {
    if (value) {
      // Trying to enable it, verify first
      try {
        final authenticated = await _biometricService.authenticate('Authenticate to enable biometric login');
        if (authenticated) {
          await _storageService.saveBiometricEnabled(true);
          setState(() => _biometricEnabled = true);
          if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Biometric login enabled.')));
        }
      } catch (e) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString().replaceAll('Exception: ', ''))));
      }
    } else {
      await _storageService.saveBiometricEnabled(false);
      setState(() => _biometricEnabled = false);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Biometric login disabled.')));
    }
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Business Settings'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (_business != null)
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
                  if (_business == null)
                    const Card(
                      elevation: 0,
                      child: Padding(
                        padding: EdgeInsets.all(20),
                        child: Text('No business data found for this account.'),
                      ),
                    ),
                  const SizedBox(height: 20),
                      if (_biometricAvailable)
                        Card(
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          child: Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Security', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                const Divider(height: 32),
                                SwitchListTile(
                                  title: const Text('Login with Biometrics'),
                                  subtitle: const Text('Use fingerprint or face unlock to login quickly'),
                                  value: _biometricEnabled,
                                  onChanged: _toggleBiometric,
                                  activeColor: AppTheme.primaryColor,
                                ),
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
                                trailing: Text(
                                  _business['subscriptionPlan'] ?? 'FREE',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                ),
                              ),
                              ListTile(
                                title: const Text('Status'),
                                trailing: Text(
                                  (_business['isActive'] ?? false) ? 'Active' : 'Inactive',
                                  style: TextStyle(
                                    color: (_business['isActive'] ?? false) ? Colors.green : Colors.red,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 16),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  onPressed: () {
                                    Navigator.pushNamed(context, '/billing');
                                  },
                                  icon: const Icon(Icons.credit_card),
                                  label: const Text('Manage Subscription / Renew'),
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
