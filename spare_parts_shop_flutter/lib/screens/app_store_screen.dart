import 'package:flutter/material.dart';
import 'package:stock_pilot/services/api_service.dart';
import 'package:stock_pilot/constants/app_theme.dart';
import 'package:stock_pilot/core/widgets/feature_locked_dialog.dart';

class AppStoreScreen extends StatefulWidget {
  const AppStoreScreen({super.key});

  @override
  State<AppStoreScreen> createState() => _AppStoreScreenState();
}

class _AppStoreScreenState extends State<AppStoreScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<dynamic> _availableModules = [];
  List<dynamic> _installedModules = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final availableResponse = await _apiService.get('/modules/available');
      final installedResponse = await _apiService.get('/modules/installed');

      setState(() {
        _availableModules = availableResponse ?? [];
        _installedModules = installedResponse ?? [];
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load App Store: ${e.toString()}')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  bool _isInstalled(String code) {
    return _installedModules.any((mod) => mod['module']['code'] == code);
  }

  String _getModuleStatus(String code) {
    try {
      final installed = _installedModules.firstWhere(
        (mod) => mod['module']['code'] == code,
        orElse: () => null,
      );
      if (installed != null) {
        return installed['status'] ?? 'ACTIVE';
      }
    } catch (_) {}
    return 'NOT_INSTALLED';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('App Store & Modules'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _availableModules.length,
                itemBuilder: (context, index) {
                  final module = _availableModules[index];
                  final isCore = module['isCore'] == true;
                  final status = isCore ? 'ACTIVE' : _getModuleStatus(module['code']);

                  return Card(
                    elevation: 2,
                    margin: const EdgeInsets.only(bottom: 16),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryColor.withAlpha(25),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(
                                  Icons.extension,
                                  color: AppTheme.primaryColor,
                                  size: 32,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            module['name'],
                                            style: const TextStyle(
                                              fontSize: 18,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: Colors.grey.shade200,
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: Text(
                                            module['category'],
                                            style: const TextStyle(fontSize: 12),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      isCore ? 'Free (Core)' : '₹${module['monthlyPrice']}/mo',
                                      style: TextStyle(
                                        color: isCore ? Colors.green : AppTheme.primaryColor,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Text(module['description']),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              if (status == 'ACTIVE')
                                const Chip(
                                  label: Text('Installed', style: TextStyle(color: Colors.white)),
                                  backgroundColor: Colors.green,
                                )
                              else if (status == 'TRIAL')
                                const Chip(
                                  label: Text('Trial Active', style: TextStyle(color: Colors.white)),
                                  backgroundColor: Colors.orange,
                                )
                              else if (status == 'EXPIRED')
                                ElevatedButton(
                                  onPressed: () {
                                    FeatureLockedDialog.show(
                                      context, 
                                      module['code'], 
                                      'Your trial for ${module['name']} has expired.'
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                                  child: const Text('Trial Expired - Renew'),
                                )
                              else
                                ElevatedButton(
                                  onPressed: () {
                                    FeatureLockedDialog.show(
                                      context, 
                                      module['code'], 
                                      'Request access to ${module['name']}'
                                    );
                                  },
                                  child: const Text('Request Access / Trial'),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
    );
  }
}
