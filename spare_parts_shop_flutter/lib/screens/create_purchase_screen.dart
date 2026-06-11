
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/supplier.dart';
import '../models/product.dart';

class CreatePurchaseScreen extends StatefulWidget {
  const CreatePurchaseScreen({super.key});

  @override
  State<CreatePurchaseScreen> createState() => _CreatePurchaseScreenState();
}

class _CreatePurchaseScreenState extends State<CreatePurchaseScreen> {
  final ApiService _apiService = ApiService();
  List<Supplier> _suppliers = [];
  Supplier? _selectedSupplier;
  String _gstType = 'EXCLUDED';
  double _discount = 0;
  List<PurchaseItem> _items = [];
  bool _isLoading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    try {
      final suppliers = await _apiService.getSuppliers();
      setState(() {
        _suppliers = suppliers;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load data: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Purchase'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error.isNotEmpty
              ? Center(child: Text(_error))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Supplier Dropdown
                      DropdownButtonFormField<Supplier>(
                        decoration: const InputDecoration(
                          labelText: 'Select Supplier',
                          border: OutlineInputBorder(),
                        ),
                        value: _selectedSupplier,
                        items: _suppliers.map((supplier) {
                          return DropdownMenuItem(
                            value: supplier,
                            child: Text('${supplier.name} - ${supplier.phone}'),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() {
                            _selectedSupplier = value;
                          });
                        },
                      ),
                      const SizedBox(height: 16),

                      // GST Type
                      DropdownButtonFormField<String>(
                        decoration: const InputDecoration(
                          labelText: 'GST Type',
                          border: OutlineInputBorder(),
                        ),
                        value: _gstType,
                        items: const [
                          DropdownMenuItem(value: 'INCLUDED', child: Text('GST Included')),
                          DropdownMenuItem(value: 'EXCLUDED', child: Text('GST Excluded')),
                        ],
                        onChanged: (value) {
                          if (value != null) {
                            setState(() {
                              _gstType = value;
                            });
                          }
                        },
                      ),
                      const SizedBox(height: 16),

                      // Discount
                      TextFormField(
                        decoration: const InputDecoration(
                          labelText: 'Discount (₹)',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        initialValue: _discount.toString(),
                        onChanged: (value) {
                          setState(() {
                            _discount = double.tryParse(value) ?? 0;
                          });
                        },
                      ),

                      // Items List
                      if (_items.isNotEmpty) ...[
                        const SizedBox(height: 24),
                        const Text(
                          'Items',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        ..._items.asMap().entries.map((entry) {
                          final idx = entry.key;
                          final item = entry.value;
                          return ListTile(
                            title: Text(item.product.name),
                            subtitle: Text('Qty: ${item.quantity}'),
                            trailing: IconButton(
                              icon: const Icon(Icons.delete, color: Colors.red),
                              onPressed: () {
                                setState(() {
                                  _items.removeAt(idx);
                                });
                              },
                            ),
                          );
                        }).toList(),
                      ],

                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: _selectedSupplier == null || _items.isEmpty
                            ? null
                            : _createPurchase,
                        child: const Text('Create Purchase'),
                      ),
                    ],
                  ),
                ),
    );
  }

  Future<void> _createPurchase() async {
    // TODO: Implement create purchase
  }
}

class PurchaseItem {
  final int productId;
  final Product product;
  int quantity;
  double price;
  double gstPercent;
  double discount;

  PurchaseItem({
    required this.productId,
    required this.product,
    this.quantity = 1,
    required this.price,
    required this.gstPercent,
    this.discount = 0,
  });
}
