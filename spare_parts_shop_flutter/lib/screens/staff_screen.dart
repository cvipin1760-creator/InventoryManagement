import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../constants/app_theme.dart';

class StaffScreen extends StatefulWidget {
  const StaffScreen({super.key});

  @override
  State<StaffScreen> createState() => _StaffScreenState();
}

class _StaffScreenState extends State<StaffScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _staffMembers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStaff();
  }

  Future<void> _loadStaff() async {
    try {
      final staff = await _apiService.getUsers(); // Re-use getUsers from auth
      setState(() {
        _staffMembers = staff.where((u) => u['role'] == 'STAFF' || u['role'] == 'MANAGER').toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load staff: $e')));
      }
    }
  }

  void _showStaffDialog([dynamic staff]) {
    final usernameController = TextEditingController(text: staff?['username'] ?? '');
    final emailController = TextEditingController(text: staff?['email'] ?? '');
    final passwordController = TextEditingController();
    String role = staff?['role'] ?? 'STAFF';
    
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setStateDialog) => AlertDialog(
          title: Text(staff == null ? 'Create Staff' : 'Edit Staff'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(controller: usernameController, decoration: const InputDecoration(labelText: 'Username')),
                TextField(controller: emailController, decoration: const InputDecoration(labelText: 'Email')),
                if (staff == null)
                  TextField(controller: passwordController, decoration: const InputDecoration(labelText: 'Password'), obscureText: true),
                DropdownButtonFormField<String>(
                  value: role,
                  decoration: const InputDecoration(labelText: 'Role'),
                  items: ['STAFF', 'MANAGER'].map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
                  onChanged: (val) {
                    if (val != null) setStateDialog(() => role = val);
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
                  'username': usernameController.text,
                  'email': emailController.text,
                  'role': role,
                };
                if (staff == null) {
                  data['password'] = passwordController.text;
                }
                
                try {
                  if (staff == null) {
                    await _apiService.createStaff(data);
                  } else {
                    await _apiService.updateStaff(staff['id'], data);
                  }
                  if (mounted) {
                    Navigator.pop(context);
                    _loadStaff();
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
        title: const Text('Staff & Permissions'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showStaffDialog(),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _staffMembers.isEmpty
              ? const Center(child: Text('No staff found'))
              : ListView.builder(
                  itemCount: _staffMembers.length,
                  itemBuilder: (context, index) {
                    final staff = _staffMembers[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                          child: const Icon(Icons.person, color: AppTheme.primaryColor),
                        ),
                        title: Text(staff['username'], style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('${staff['email']}\nRole: ${staff['role']}'),
                        isThreeLine: true,
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.edit),
                              onPressed: () => _showStaffDialog(staff),
                              tooltip: 'Edit Staff',
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete, color: Colors.red),
                              onPressed: () async {
                                final confirm = await showDialog<bool>(
                                  context: context,
                                  builder: (context) => AlertDialog(
                                    title: const Text('Delete Staff'),
                                    content: Text('Are you sure you want to delete ${staff['username']}?'),
                                    actions: [
                                      TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
                                      ElevatedButton(
                                        onPressed: () => Navigator.pop(context, true),
                                        style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
                                        child: const Text('Delete'),
                                      ),
                                    ],
                                  ),
                                );
                                if (confirm == true) {
                                  try {
                                    await _apiService.deleteUser(staff['id']);
                                    if (mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(content: Text('Staff deleted successfully'), backgroundColor: Colors.green),
                                      );
                                    }
                                    _loadStaff();
                                  } catch (e) {
                                    if (mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text('Failed to delete staff: $e'), backgroundColor: Colors.red),
                                      );
                                    }
                                  }
                                }
                              },
                              tooltip: 'Delete Staff',
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
