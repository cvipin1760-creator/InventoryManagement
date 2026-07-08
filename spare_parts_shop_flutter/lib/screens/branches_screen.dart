import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../constants/app_theme.dart';

class BranchesScreen extends StatefulWidget {
  const BranchesScreen({super.key});

  @override
  State<BranchesScreen> createState() => _BranchesScreenState();
}

class _BranchesScreenState extends State<BranchesScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _branches = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBranches();
  }

  Future<void> _loadBranches() async {
    try {
      final branches = await _apiService.getBranches();
      setState(() {
        _branches = branches;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load branches: $e')));
      }
    }
  }

  void _showBranchDialog([dynamic branch]) {
    final nameController = TextEditingController(text: branch?['name'] ?? '');
    final locationController = TextEditingController(text: branch?['location'] ?? '');
    final contactPhoneController = TextEditingController(text: branch?['contactPhone'] ?? '');
    final isMain = branch?['isMain'] ?? false;
    bool currentIsMain = isMain;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setStateDialog) => AlertDialog(
          title: Text(branch == null ? 'Create Branch' : 'Edit Branch'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Branch Name')),
                TextField(controller: locationController, decoration: const InputDecoration(labelText: 'Location')),
                TextField(controller: contactPhoneController, decoration: const InputDecoration(labelText: 'Contact Phone')),
                SwitchListTile(
                  title: const Text('Is Main Branch?'),
                  value: currentIsMain,
                  onChanged: (val) {
                    setStateDialog(() => currentIsMain = val);
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () async {
                final data = {
                  'name': nameController.text,
                  'location': locationController.text,
                  'contactPhone': contactPhoneController.text,
                  'isMain': currentIsMain,
                };
                try {
                  if (branch == null) {
                    await _apiService.createBranch(data);
                  } else {
                    await _apiService.updateBranch(branch['id'], data);
                  }
                  if (mounted) {
                    Navigator.pop(context);
                    _loadBranches();
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                  }
                }
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Branches'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showBranchDialog(),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _branches.isEmpty
              ? const Center(child: Text('No branches found'))
              : ListView.builder(
                  itemCount: _branches.length,
                  itemBuilder: (context, index) {
                    final branch = _branches[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                          child: const Icon(Icons.store, color: AppTheme.primaryColor),
                        ),
                        title: Text(branch['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('${branch['location']}\n${branch['contactPhone']}'),
                        isThreeLine: true,
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (branch['isMain'])
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(color: Colors.green, borderRadius: BorderRadius.circular(12)),
                                child: const Text('MAIN', style: TextStyle(color: Colors.white, fontSize: 10)),
                              ),
                            IconButton(icon: const Icon(Icons.edit), onPressed: () => _showBranchDialog(branch)),
                            IconButton(
                              icon: const Icon(Icons.delete, color: Colors.red),
                              onPressed: () async {
                                await _apiService.deleteBranch(branch['id']);
                                _loadBranches();
                              },
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
