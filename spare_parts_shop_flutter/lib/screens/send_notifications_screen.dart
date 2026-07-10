import 'package:flutter/material.dart';
import '../services/api_service.dart';

class SendNotificationsScreen extends StatefulWidget {
  const SendNotificationsScreen({super.key});

  @override
  State<SendNotificationsScreen> createState() => _SendNotificationsScreenState();
}

class _SendNotificationsScreenState extends State<SendNotificationsScreen> {
  final ApiService _apiService = ApiService();
  final _titleController = TextEditingController();
  final _messageController = TextEditingController();
  bool _sendToAll = false;
  bool _loading = false;
  List<dynamic> _users = [];
  List<dynamic> _selectedUsers = [];

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _loadUsers() async {
    try {
      final users = await _apiService.getUsers();
      setState(() => _users = users);
    } catch (_) {}
  }

  Future<void> _send() async {
    if (_titleController.text.trim().isEmpty || _messageController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in both title and message'), backgroundColor: Colors.red),
      );
      return;
    }
    if (!_sendToAll && _selectedUsers.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one user or send to all'), backgroundColor: Colors.red),
      );
      return;
    }
    setState(() => _loading = true);
    try {
      await _apiService.sendAdminNotification({
        'title': _titleController.text.trim(),
        'message': _messageController.text.trim(),
        'sendToAll': _sendToAll,
        'userIds': _sendToAll ? [] : _selectedUsers.map((u) => u['id']).toList(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Notifications sent successfully!'), backgroundColor: Colors.green),
        );
        _titleController.clear();
        _messageController.clear();
        setState(() { _selectedUsers = []; _sendToAll = false; });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Send Notifications')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Card(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  controller: _titleController,
                  decoration: InputDecoration(
                    labelText: 'Title',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    prefixIcon: const Icon(Icons.title),
                  ),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _messageController,
                  maxLines: 5,
                  decoration: InputDecoration(
                    labelText: 'Message',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    prefixIcon: const Icon(Icons.message),
                  ),
                ),
                const SizedBox(height: 16),
                SwitchListTile(
                  title: const Text('Send to All Users'),
                  subtitle: const Text('Notification will go to every registered user'),
                  value: _sendToAll,
                  onChanged: (v) => setState(() { _sendToAll = v; if (v) _selectedUsers = []; }),
                  contentPadding: EdgeInsets.zero,
                ),
                if (!_sendToAll) ...[
                  const SizedBox(height: 8),
                  Text('Select Recipients', style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w500)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: _users.map((user) {
                      final isSelected = _selectedUsers.any((u) => u['id'] == user['id']);
                      return FilterChip(
                        label: Text(user['username'] ?? '?'),
                        selected: isSelected,
                        onSelected: (selected) {
                          setState(() {
                            if (selected) {
                              _selectedUsers.add(user);
                            } else {
                              _selectedUsers.removeWhere((u) => u['id'] == user['id']);
                            }
                          });
                        },
                      );
                    }).toList(),
                  ),
                ],
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: _loading ? null : _send,
                  icon: _loading
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.send),
                  label: Text(_loading ? 'Sending...' : 'Send Notifications'),
                  style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
