import 'package:flutter/material.dart';
import '../services/api_service.dart';

class RoleManagementScreen extends StatefulWidget {
  const RoleManagementScreen({super.key});

  @override
  State<RoleManagementScreen> createState() => _RoleManagementScreenState();
}

class _RoleManagementScreenState extends State<RoleManagementScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<dynamic> _roles = [];

  @override
  void initState() {
    super.initState();
    _loadRoles();
  }

  Future<void> _loadRoles() async {
    try {
      final response = await _apiService.get('/roles'); // Adjust endpoint if needed
      if (mounted) {
        setState(() {
          _roles = response is List ? response : [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load roles: $e')),
        );
      }
    }
  }

  void _showAddRoleDialog() {
    final TextEditingController nameController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Role'),
        content: TextField(
          controller: nameController,
          decoration: const InputDecoration(labelText: 'Role Name'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              if (nameController.text.isNotEmpty) {
                try {
                  await _apiService.post('/roles', body: {'name': nameController.text});
                  _loadRoles();
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Error adding role: $e')),
                    );
                  }
                }
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Role Management'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _showAddRoleDialog,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _roles.isEmpty
              ? const Center(child: Text('No roles configured'))
              : ListView.builder(
                  itemCount: _roles.length,
                  itemBuilder: (context, index) {
                    final role = _roles[index];
                    return ListTile(
                      leading: const Icon(Icons.security),
                      title: Text(role['name'] ?? 'Unnamed Role'),
                      subtitle: const Text('Permissions can be configured here.'),
                      trailing: const Icon(Icons.settings),
                      onTap: () {
                        // Open permission configuration
                      },
                    );
                  },
                ),
    );
  }
}
