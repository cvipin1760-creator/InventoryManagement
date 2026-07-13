import 'package:flutter/material.dart';
import '../services/api_service.dart';

class PurchaseOrdersScreen extends StatefulWidget {
  const PurchaseOrdersScreen({super.key});

  @override
  State<PurchaseOrdersScreen> createState() => _PurchaseOrdersScreenState();
}

class _PurchaseOrdersScreenState extends State<PurchaseOrdersScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _orders = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    setState(() => _isLoading = true);
    try {
      final data = await _apiService.getPurchaseOrders();
      if (mounted) setState(() => _orders = data);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to load POs')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _autoGenerate() async {
    setState(() => _isLoading = true);
    try {
      await _apiService.autoGeneratePurchaseOrders();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Purchase Orders Auto-Generated')));
      }
      await _loadOrders();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to generate POs')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _updateStatus(int id, String newStatus) async {
    try {
      await _apiService.updatePurchaseOrderStatus(id, newStatus);
      _loadOrders();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to update status')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Purchase Orders'),
        actions: [
          IconButton(
            icon: const Icon(Icons.auto_awesome),
            onPressed: _autoGenerate,
            tooltip: 'Auto-Generate',
          ),
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadOrders),
        ],
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ListView.builder(
            itemCount: _orders.length,
            itemBuilder: (context, index) {
              final order = _orders[index];
              final supplierName = order['supplier'] != null ? order['supplier']['name'] : 'Unknown';
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  title: Text('PO #${order['id']} - $supplierName'),
                  subtitle: Text('Status: ${order['status']} | Total: ₹${order['totalAmount'] ?? 0}'),
                  trailing: PopupMenuButton<String>(
                    onSelected: (value) => _updateStatus(order['id'], value),
                    itemBuilder: (context) => [
                      const PopupMenuItem(value: 'DRAFT', child: Text('Draft')),
                      const PopupMenuItem(value: 'PENDING', child: Text('Pending')),
                      const PopupMenuItem(value: 'APPROVED', child: Text('Approved')),
                      const PopupMenuItem(value: 'COMPLETED', child: Text('Completed')),
                    ],
                  ),
                ),
              );
            },
          ),
    );
  }
}
