import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../providers/auth_provider.dart';
import '../models/product.dart';
import 'package:intl/intl.dart';

class StockTransfersScreen extends StatefulWidget {
  const StockTransfersScreen({super.key});

  @override
  State<StockTransfersScreen> createState() => _StockTransfersScreenState();
}

class _StockTransfersScreenState extends State<StockTransfersScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<dynamic> _transfers = [];

  @override
  void initState() {
    super.initState();
    _loadTransfers();
  }

  Future<void> _loadTransfers() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final data = await _apiService.getStockTransfers();
      if (mounted) {
        setState(() {
          _transfers = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading transfers: $e')),
        );
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _updateStatus(int id, String newStatus) async {
    try {
      await _apiService.updateStockTransferStatus(id, newStatus);
      _loadTransfers();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Transfer status updated')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error updating status: $e')),
        );
      }
    }
  }

  Future<void> _createTransfer() async {
    setState(() => _isLoading = true);
    try {
      final branches = await _apiService.getBranches();
      final products = await _apiService.getProducts();
      
      if (!mounted) return;
      setState(() => _isLoading = false);

      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final defaultSourceId = authProvider.branchId;

      dynamic selectedSourceBranch = branches.firstWhere(
        (b) => b['id'] == defaultSourceId,
        orElse: () => branches.isNotEmpty ? branches.first : null,
      );
      dynamic selectedDestBranch = branches.firstWhere(
        (b) => b['id'] != (selectedSourceBranch?['id'] ?? -1),
        orElse: () => branches.length > 1 ? branches[1] : null,
      );
      Product? selectedProduct = products.isNotEmpty ? products.first : null;
      final quantityController = TextEditingController();
      final notesController = TextEditingController();
      final formKey = GlobalKey<FormState>();

      if (branches.isEmpty || products.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Need at least one branch and product to transfer')),
        );
        return;
      }

      showDialog(
        context: context,
        builder: (context) => StatefulBuilder(
          builder: (context, setDialogState) => AlertDialog(
            title: const Text('New Stock Transfer'),
            content: Form(
              key: formKey,
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    DropdownButtonFormField<dynamic>(
                      value: selectedSourceBranch,
                      decoration: const InputDecoration(labelText: 'Source Branch'),
                      items: branches.map((b) => DropdownMenuItem(
                        value: b,
                        child: Text(b['name'] ?? ''),
                      )).toList(),
                      onChanged: (v) {
                        setDialogState(() {
                          selectedSourceBranch = v;
                          if (selectedDestBranch?['id'] == v?['id']) {
                            selectedDestBranch = branches.firstWhere(
                              (b) => b['id'] != v?['id'],
                              orElse: () => null,
                            );
                          }
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<dynamic>(
                      value: selectedDestBranch,
                      decoration: const InputDecoration(labelText: 'Destination Branch'),
                      items: branches.where((b) => b['id'] != selectedSourceBranch?['id']).map((b) => DropdownMenuItem(
                        value: b,
                        child: Text(b['name'] ?? ''),
                      )).toList(),
                      onChanged: (v) => setDialogState(() => selectedDestBranch = v),
                      validator: (v) => v == null ? 'Select destination branch' : null,
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<Product>(
                      value: selectedProduct,
                      decoration: const InputDecoration(labelText: 'Product'),
                      items: products.map((p) => DropdownMenuItem(
                        value: p,
                        child: Text(p.name),
                      )).toList(),
                      onChanged: (v) => setDialogState(() => selectedProduct = v),
                      validator: (v) => v == null ? 'Select product' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: quantityController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Quantity'),
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) return 'Enter quantity';
                        final qty = int.tryParse(v);
                        if (qty == null || qty <= 0) return 'Enter valid quantity';
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: notesController,
                      decoration: const InputDecoration(labelText: 'Notes'),
                    ),
                  ],
                ),
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () async {
                  if (formKey.currentState?.validate() ?? false) {
                    Navigator.pop(context);
                    setState(() => _isLoading = true);
                    try {
                      await _apiService.createStockTransfer({
                        'sourceBranchId': selectedSourceBranch['id'],
                        'destinationBranchId': selectedDestBranch['id'],
                        'productId': selectedProduct!.id,
                        'quantity': int.parse(quantityController.text),
                        'notes': notesController.text.trim(),
                      });
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Transfer created successfully!'), backgroundColor: Colors.green),
                        );
                      }
                      _loadTransfers();
                    } catch (e) {
                      if (mounted) {
                        setState(() => _isLoading = false);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Failed to create transfer: $e'), backgroundColor: Colors.red),
                        );
                      }
                    }
                  }
                },
                child: const Text('Create'),
              ),
            ],
          ),
        ),
      );
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to fetch details: $e')),
        );
      }
    }
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    switch (status) {
      case 'COMPLETED':
        color = Colors.green;
        break;
      case 'CANCELLED':
        color = Colors.red;
        break;
      default:
        color = Colors.orange;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color),
      ),
      child: Text(
        status,
        style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Stock Transfers'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadTransfers,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _transfers.isEmpty
              ? const Center(child: Text('No stock transfers found.'))
              : RefreshIndicator(
                  onRefresh: _loadTransfers,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _transfers.length,
                    itemBuilder: (context, index) {
                      final transfer = _transfers[index];
                      final date = DateTime.tryParse(transfer['transferDate'] ?? '') ?? DateTime.now();
                      
                      return Card(
                        margin: const EdgeInsets.only(bottom: 16),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      transfer['product'] != null ? transfer['product']['name'] : 'Unknown Product',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                    ),
                                  ),
                                  _buildStatusBadge(transfer['status'] ?? 'PENDING'),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text('Quantity: ${transfer['quantity']}'),
                              const SizedBox(height: 4),
                              Text(
                                'From: ${transfer['sourceBranch'] != null ? transfer['sourceBranch']['name'] : 'N/A'} \nTo: ${transfer['destinationBranch'] != null ? transfer['destinationBranch']['name'] : 'N/A'}',
                                style: const TextStyle(color: Colors.grey),
                              ),
                              const SizedBox(height: 8),
                              Text('Date: ${DateFormat.yMMMd().format(date)}'),
                              if (transfer['notes'] != null && transfer['notes'].isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(top: 8),
                                  child: Text('Notes: ${transfer['notes']}'),
                                ),
                              if (transfer['status'] == 'PENDING')
                                Padding(
                                  padding: const EdgeInsets.only(top: 16),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    children: [
                                      TextButton(
                                        onPressed: () => _updateStatus(transfer['id'], 'CANCELLED'),
                                        child: const Text('Cancel', style: TextStyle(color: Colors.red)),
                                      ),
                                      const SizedBox(width: 8),
                                      ElevatedButton(
                                        onPressed: () => _updateStatus(transfer['id'], 'COMPLETED'),
                                        child: const Text('Complete'),
                                      ),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _createTransfer,
        icon: const Icon(Icons.swap_horiz),
        label: const Text('New Transfer'),
      ),
    );
  }
}
