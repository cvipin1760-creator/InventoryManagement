import 'package:flutter/material.dart';
import '../services/api_service.dart';

class PurchaseOrdersScreen extends StatefulWidget {
  @override
  _PurchaseOrdersScreenState createState() => _PurchaseOrdersScreenState();
}

class _PurchaseOrdersScreenState extends State<PurchaseOrdersScreen> {
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
      final data = await ApiService().getPurchaseOrders();
      setState(() => _orders = data);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load POs')));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _autoGenerate() async {
    setState(() => _isLoading = true);
    try {
      await ApiService().autoGeneratePurchaseOrders();
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Purchase Orders Auto-Generated')));
      await _loadOrders();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to generate POs')));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _updateStatus(int id, String newStatus) async {
    try {
      await ApiService().updatePurchaseOrderStatus(id, newStatus);
      _loadOrders();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to update status')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Purchase Orders'),
        actions: [
          IconButton(
            icon: Icon(Icons.auto_awesome),
            onPressed: _autoGenerate,
            tooltip: 'Auto-Generate',
          ),
          IconButton(icon: Icon(Icons.refresh), onPressed: _loadOrders),
        ],
      ),
      body: _isLoading 
        ? Center(child: CircularProgressIndicator())
        : ListView.builder(
            itemCount: _orders.length,
            itemBuilder: (context, index) {
              final order = _orders[index];
              return Card(
                margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  title: Text('PO #${order['id']} - ${order['supplier']['name']}'),
                  subtitle: Text('Status: ${order['status']} | Total: \$${order['totalAmount']}'),
                  trailing: PopupMenuButton<String>(
                    onSelected: (value) => _updateStatus(order['id'], value),
                    itemBuilder: (context) => [
                      PopupMenuItem(value: 'DRAFT', child: Text('Draft')),
                      PopupMenuItem(value: 'PENDING', child: Text('Pending')),
                      PopupMenuItem(value: 'APPROVED', child: Text('Approved')),
                      PopupMenuItem(value: 'COMPLETED', child: Text('Completed')),
                    ],
                  ),
                ),
              );
            },
          ),
    );
  }
}
