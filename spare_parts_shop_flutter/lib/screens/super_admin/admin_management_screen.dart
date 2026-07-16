import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class AdminManagementScreen extends StatefulWidget {
  const AdminManagementScreen({super.key});

  @override
  State<AdminManagementScreen> createState() => _AdminManagementScreenState();
}

class _AdminManagementScreenState extends State<AdminManagementScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<dynamic> _admins = [];

  @override
  void initState() {
    super.initState();
    _loadAdmins();
  }

  Future<void> _loadAdmins() async {
    try {
      final response = await _apiService.get('/superadmin/admins'); // Adjust if needed
      if (mounted) {
        setState(() {
          _admins = response is List ? response : [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load admins: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Admin Management (Super Admin)')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _admins.isEmpty
              ? const Center(child: Text('No admins found'))
              : ListView.builder(
                  itemCount: _admins.length,
                  itemBuilder: (context, index) {
                    final admin = _admins[index];
                    return ListTile(
                      leading: const Icon(Icons.person),
                      title: Text(admin['username'] ?? 'Unknown'),
                      subtitle: Text(admin['email'] ?? 'No email'),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete, color: Colors.red),
                        onPressed: () {
                          // Implement delete/ban logic
                        },
                      ),
                    );
                  },
                ),
    );
  }
}
