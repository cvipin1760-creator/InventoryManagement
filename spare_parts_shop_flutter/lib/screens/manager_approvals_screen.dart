import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/approval_service.dart';
import '../constants/app_theme.dart';

class ManagerApprovalsScreen extends StatefulWidget {
  const ManagerApprovalsScreen({super.key});

  @override
  State<ManagerApprovalsScreen> createState() => _ManagerApprovalsScreenState();
}

class _ManagerApprovalsScreenState extends State<ManagerApprovalsScreen> {
  final ApprovalService _approvalService = ApprovalService();
  List<dynamic> _pendingRequests = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadRequests();
  }

  Future<void> _loadRequests() async {
    setState(() => _isLoading = true);
    try {
      final reqs = await _approvalService.getPendingRequests();
      if (mounted) {
        setState(() {
          _pendingRequests = reqs;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _resolveRequest(int id, bool approved) async {
    setState(() => _isLoading = true);
    try {
      await _approvalService.resolveRequest(id, approved);
      await _loadRequests();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Request ${approved ? "Approved" : "Rejected"}')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pending Approvals'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadRequests),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _pendingRequests.isEmpty
              ? const Center(child: Text('No pending approval requests.', style: TextStyle(fontSize: 18)))
              : ListView.builder(
                  itemCount: _pendingRequests.length,
                  itemBuilder: (context, index) {
                    final req = _pendingRequests[index];
                    final details = json.decode(req['detailsJson'] as String);

                    return Card(
                      margin: const EdgeInsets.all(8),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.orange,
                          child: const Icon(Icons.security, color: Colors.white),
                        ),
                        title: Text('Action: ${req['actionType']}'),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Requested at: ${req['requestedAt']}'),
                            const SizedBox(height: 5),
                            Text('Customer: ${details['customerName']}'),
                            Text('Requested Discount: ${details['discountRequested']}%', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
                            Text('Subtotal: ₹${details['subtotal']}'),
                          ],
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.cancel, color: Colors.red, size: 30),
                              onPressed: () => _resolveRequest(req['id'], false),
                              tooltip: 'Reject',
                            ),
                            const SizedBox(width: 10),
                            IconButton(
                              icon: const Icon(Icons.check_circle, color: Colors.green, size: 30),
                              onPressed: () => _resolveRequest(req['id'], true),
                              tooltip: 'Approve',
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
