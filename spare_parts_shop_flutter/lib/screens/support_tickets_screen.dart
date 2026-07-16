import 'package:flutter/material.dart';
import '../services/api_service.dart';

class SupportTicketsScreen extends StatefulWidget {
  const SupportTicketsScreen({super.key});

  @override
  State<SupportTicketsScreen> createState() => _SupportTicketsScreenState();
}

class _SupportTicketsScreenState extends State<SupportTicketsScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<dynamic> _tickets = [];

  @override
  void initState() {
    super.initState();
    _loadTickets();
  }

  Future<void> _loadTickets() async {
    try {
      final response = await _apiService.get('/support/tickets'); // Adjust if needed
      if (mounted) {
        setState(() {
          _tickets = response is List ? response : [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load tickets: $e')),
        );
      }
    }
  }

  void _showTicketDialog(dynamic ticket) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Ticket: ${ticket['subject']}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('From: ${ticket['customerName'] ?? 'Unknown'}'),
            const SizedBox(height: 8),
            Text('Message: ${ticket['description']}'),
            const SizedBox(height: 8),
            Text('Status: ${ticket['status']}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          if (ticket['status'] != 'CLOSED')
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(context);
                try {
                  await _apiService.put('/support/tickets/${ticket['id']}/resolve');
                  _loadTickets();
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed to resolve: $e')),
                    );
                  }
                }
              },
              child: const Text('Mark Resolved'),
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Support Tickets')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _tickets.isEmpty
              ? const Center(child: Text('No support tickets'))
              : ListView.builder(
                  itemCount: _tickets.length,
                  itemBuilder: (context, index) {
                    final ticket = _tickets[index];
                    return ListTile(
                      leading: Icon(
                        Icons.support_agent,
                        color: ticket['status'] == 'CLOSED' ? Colors.grey : Colors.red,
                      ),
                      title: Text(ticket['subject'] ?? 'No Subject'),
                      subtitle: Text(ticket['status'] ?? 'OPEN'),
                      onTap: () => _showTicketDialog(ticket),
                    );
                  },
                ),
    );
  }
}
