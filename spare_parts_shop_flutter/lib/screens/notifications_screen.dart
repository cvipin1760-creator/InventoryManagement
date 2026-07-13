import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../constants/app_theme.dart';
import 'package:intl/intl.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    try {
      final notifications = await _apiService.getNotifications();
      setState(() {
        _notifications = notifications;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load notifications: $e')));
      }
    }
  }

  Future<void> _markAsRead(int id, int index) async {
    if (_notifications[index]['isRead']) return;
    
    try {
      await _apiService.markNotificationAsRead(id);
      setState(() {
        _notifications[index]['isRead'] = true;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _markAllAsRead() async {
    final unread = _notifications.where((n) => !(n['isRead'] ?? false)).toList();
    if (unread.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      await Future.wait(
        unread.map((n) => _apiService.markNotificationAsRead(n['id'] as int)),
      );
      _loadNotifications();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to mark all as read: $e')),
        );
      }
      _loadNotifications();
    }
  }

  @override
  Widget build(BuildContext context) {
    final hasUnread = _notifications.any((n) => !(n['isRead'] ?? false));
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          if (hasUnread)
            IconButton(
              icon: const Icon(Icons.mark_chat_read),
              onPressed: _markAllAsRead,
              tooltip: 'Mark all as read',
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _notifications.isEmpty
              ? const Center(child: Text('No notifications'))
              : ListView.builder(
                  itemCount: _notifications.length,
                  itemBuilder: (context, index) {
                    final notification = _notifications[index];
                    final isRead = notification['isRead'] ?? false;
                    
                    String formattedDate = '';
                    try {
                      formattedDate = DateFormat.yMMMd().add_jm().format(DateTime.parse(notification['createdAt']));
                    } catch (e) {
                      formattedDate = 'Recently';
                    }

                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      color: isRead ? Colors.white : AppTheme.primaryColor.withOpacity(0.05),
                      elevation: isRead ? 1 : 2,
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: isRead ? Colors.grey[200] : AppTheme.primaryColor.withOpacity(0.2),
                          child: Icon(Icons.notifications, color: isRead ? Colors.grey : AppTheme.primaryColor),
                        ),
                        title: Text(
                          notification['title'] ?? 'Notification',
                          style: TextStyle(fontWeight: isRead ? FontWeight.normal : FontWeight.bold),
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 4),
                            Text(notification['message'] ?? ''),
                            const SizedBox(height: 8),
                            Text(formattedDate, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                          ],
                        ),
                        isThreeLine: true,
                        onTap: () => _markAsRead(notification['id'], index),
                      ),
                    );
                  },
                ),
    );
  }
}
