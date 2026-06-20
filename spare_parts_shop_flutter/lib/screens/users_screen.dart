import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:stock_pilot/constants/app_theme.dart';
import 'package:stock_pilot/services/api_service.dart';

class UsersScreen extends StatefulWidget {
  const UsersScreen({super.key});

  @override
  State<UsersScreen> createState() => _UsersScreenState();
}

class _UsersScreenState extends State<UsersScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _users = [];
  bool _isLoading = true;
  bool _showCreateUser = false;
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String _selectedRole = 'ADMIN';
  bool _userEnabled = true;

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _loadUsers() async {
    try {
      final users = await _apiService.getUsers();
      setState(() {
        _users = users;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load users: $e')),
        );
      }
    }
  }

  Future<void> _createUser() async {
    if (_formKey.currentState!.validate()) {
      try {
        await _apiService.createUser(
          _usernameController.text.trim(),
          _emailController.text.trim(),
          _passwordController.text.trim(),
          _selectedRole,
          _userEnabled,
        );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('User created successfully!'),
              backgroundColor: AppTheme.successColor,
            ),
          );
          // Reset form
          _formKey.currentState!.reset();
          _usernameController.clear();
          _emailController.clear();
          _passwordController.clear();
          _selectedRole = 'ADMIN';
          _userEnabled = true;
          setState(() {
            _showCreateUser = false;
          });
          // Reload users
          _loadUsers();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(e.toString().replaceAll('Exception: ', '')),
              backgroundColor: AppTheme.errorColor,
            ),
          );
        }
      }
    }
  }

  Future<void> _deleteUser(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete User'),
        content: const Text('Are you sure you want to delete this user?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: AppTheme.errorColor),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await _apiService.deleteUser(id);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('User deleted successfully!'),
              backgroundColor: AppTheme.successColor,
            ),
          );
          _loadUsers();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to delete user: $e')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('User Management'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadUsers,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Create user button
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: ElevatedButton.icon(
                    onPressed: () {
                      setState(() {
                        _showCreateUser = !_showCreateUser;
                      });
                    },
                    icon: const Icon(Icons.add),
                    label: Text(_showCreateUser ? 'Hide Form' : 'Create New User'),
                  ),
                ),
                // Create user form
                if (_showCreateUser)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Form(
                          key: _formKey,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Text(
                                'Create New User',
                                style: Theme.of(context)
                                    .textTheme
                                    .titleLarge
                                    ?.copyWith(fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 16),
                              TextFormField(
                                controller: _usernameController,
                                decoration: const InputDecoration(
                                  labelText: 'Username',
                                  prefixIcon: Icon(Icons.person_outline),
                                  border: OutlineInputBorder(),
                                ),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Please enter username';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 12),
                              TextFormField(
                                controller: _emailController,
                                decoration: const InputDecoration(
                                  labelText: 'Email',
                                  prefixIcon: Icon(Icons.email_outlined),
                                  border: OutlineInputBorder(),
                                ),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Please enter email';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 12),
                              TextFormField(
                                controller: _passwordController,
                                decoration: const InputDecoration(
                                  labelText: 'Password',
                                  prefixIcon: Icon(Icons.lock_outline),
                                  border: OutlineInputBorder(),
                                ),
                                obscureText: true,
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Please enter password';
                                  }
                                  if (value.length < 6) {
                                    return 'Password must be at least 6 characters';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 12),
                              DropdownButtonFormField<String>(
                                value: _selectedRole,
                                decoration: const InputDecoration(
                                  labelText: 'Role',
                                  prefixIcon: Icon(Icons.admin_panel_settings_outlined),
                                  border: OutlineInputBorder(),
                                ),
                                items: const [
                                  DropdownMenuItem(
                                    value: 'ADMIN',
                                    child: Text('Admin'),
                                  ),
                                  DropdownMenuItem(
                                    value: 'EMPLOYEE',
                                    child: Text('Employee'),
                                  ),
                                  DropdownMenuItem(
                                    value: 'CUSTOMER',
                                    child: Text('Customer'),
                                  ),
                                  DropdownMenuItem(
                                    value: 'SUPER_ADMIN',
                                    child: Text('Super Admin'),
                                  ),
                                ],
                                onChanged: (value) {
                                  if (value != null) {
                                    setState(() {
                                      _selectedRole = value;
                                    });
                                  }
                                },
                              ),
                              const SizedBox(height: 12),
                              SwitchListTile(
                                title: const Text('Account Enabled'),
                                value: _userEnabled,
                                onChanged: (value) {
                                  setState(() {
                                    _userEnabled = value;
                                  });
                                },
                              ),
                              const SizedBox(height: 16),
                              ElevatedButton(
                                onPressed: _createUser,
                                child: const Text('Create User'),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                // Users list
                Expanded(
                  child: _users.isEmpty
                      ? const Center(child: Text('No users found'))
                      : ListView.builder(
                          padding: const EdgeInsets.all(16.0),
                          itemCount: _users.length,
                          itemBuilder: (context, index) {
                            final user = _users[index];
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12.0),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: AppTheme.primaryColor,
                                  child: Text(
                                    user['username']?.substring(0, 1).toUpperCase() ?? '?',
                                    style: const TextStyle(color: Colors.white),
                                  ),
                                ),
                                title: Text(user['username'] ?? 'Unknown'),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(user['email'] ?? ''),
                                    Row(
                                      children: [
                                        Chip(
                                          label: Text(
                                            user['role'] ?? 'N/A',
                                            style: const TextStyle(fontSize: 12),
                                          ),
                                          backgroundColor: user['role'] == 'ADMIN' || user['role'] == 'SUPER_ADMIN'
                                              ? AppTheme.primaryColor.withOpacity(0.1)
                                              : user['role'] == 'CUSTOMER'
                                                  ? AppTheme.successColor.withOpacity(0.1)
                                                  : AppTheme.warningColor.withOpacity(0.1),
                                          labelStyle: TextStyle(
                                            color: user['role'] == 'ADMIN' || user['role'] == 'SUPER_ADMIN'
                                                ? AppTheme.primaryColor
                                                : user['role'] == 'CUSTOMER'
                                                    ? AppTheme.successColor
                                                    : AppTheme.warningColor,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Chip(
                                          label: Text(
                                            user['enabled'] == true ? 'Enabled' : 'Disabled',
                                            style: const TextStyle(fontSize: 12),
                                          ),
                                          backgroundColor: user['enabled'] == true
                                              ? AppTheme.successColor.withOpacity(0.1)
                                              : AppTheme.errorColor.withOpacity(0.1),
                                          labelStyle: TextStyle(
                                            color: user['enabled'] == true ? AppTheme.successColor : AppTheme.errorColor,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                trailing: IconButton(
                                  icon: const Icon(Icons.delete_outline, color: AppTheme.errorColor),
                                  onPressed: () {
                                    final id = user['id'];
                                    if (id is int) {
                                      _deleteUser(id);
                                    }
                                  },
                                ),
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
    );
  }
}
