import 'package:flutter/material.dart';
import '../services/api_service.dart';

class FeaturePermissionsScreen extends StatefulWidget {
  const FeaturePermissionsScreen({super.key});

  @override
  State<FeaturePermissionsScreen> createState() => _FeaturePermissionsScreenState();
}

class _FeaturePermissionsScreenState extends State<FeaturePermissionsScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  dynamic _settings;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    try {
      final response = await _apiService.get('/business/settings');
      if (mounted) {
        setState(() {
          _settings = response;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load settings: $e')),
        );
      }
    }
  }

  Future<void> _toggleModule(String module, bool value) async {
    try {
      final currentModules = List<String>.from(_settings['activeModules'] ?? []);
      if (value && !currentModules.contains(module)) {
        currentModules.add(module);
      } else if (!value) {
        currentModules.remove(module);
      }
      
      await _apiService.put('/business/settings', body: {
        'activeModules': currentModules,
      });
      
      setState(() {
        _settings['activeModules'] = currentModules;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Module updated successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update module: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Feature Permissions')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }
    
    final activeModules = List<String>.from(_settings?['activeModules'] ?? []);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Feature Permissions'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Toggle Business Modules', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          SwitchListTile(
            title: const Text('EMI / Installments'),
            subtitle: const Text('Allow partial payments and installments'),
            value: activeModules.contains('emi'),
            onChanged: (v) => _toggleModule('emi', v),
          ),
          SwitchListTile(
            title: const Text('Warranties'),
            subtitle: const Text('Track product warranties and claims'),
            value: activeModules.contains('warranty'),
            onChanged: (v) => _toggleModule('warranty', v),
          ),
          SwitchListTile(
            title: const Text('Marketing (SMS/Email)'),
            subtitle: const Text('Send promotional campaigns to customers'),
            value: activeModules.contains('marketing'),
            onChanged: (v) => _toggleModule('marketing', v),
          ),
          SwitchListTile(
            title: const Text('Stock Transfers'),
            subtitle: const Text('Transfer items between branches'),
            value: activeModules.contains('transfers'),
            onChanged: (v) => _toggleModule('transfers', v),
          ),
          SwitchListTile(
            title: const Text('B2B Wholesale'),
            subtitle: const Text('Enable B2B customer logins and pricing'),
            value: activeModules.contains('b2b'),
            onChanged: (v) => _toggleModule('b2b', v),
          ),
        ],
      ),
    );
  }
}
