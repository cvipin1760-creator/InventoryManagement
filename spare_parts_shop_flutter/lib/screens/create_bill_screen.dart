
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/customer.dart';
import '../models/product.dart';
import '../models/customer_balance.dart';

class CreateBillScreen extends StatefulWidget {
  const CreateBillScreen({super.key});

  @override
  State<CreateBillScreen> createState() => _CreateBillScreenState();
}

class _CreateBillScreenState extends State<CreateBillScreen> {
  final ApiService _apiService = ApiService();
  List<Customer> _customers = [];
  List<Product> _products = [];
  Customer? _selectedCustomer;
  CustomerBalance? _customerBalance;
  Map<String, double> _customerPrices = {};
  String _gstType = 'INCLUDED';
  double _discount = 0;
  double _paidAmount = 0;
  List<BillItem> _items = [];
  bool _isLoading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    try {
      final customers = await _apiService.getCustomers();
      setState(() {
        _customers = customers;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load data: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _onCustomerSelected(Customer? customer) async {
    setState(() {
      _selectedCustomer = customer;
      _customerBalance = null;
      _customerPrices = {};
    });
    if (customer != null) {
      try {
        final prices = await _apiService.getCustomerProductPrices(customer.id);
        final balance = await _apiService.getCustomerBalance(customer.id);
        setState(() {
          _customerPrices = prices;
          _customerBalance = balance;
        });
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to load customer data: $e')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Bill'),
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
                      // Customer Dropdown
                      DropdownButtonFormField<Customer>(
                        decoration: const InputDecoration(
                          labelText: 'Select Customer',
                          border: OutlineInputBorder(),
                        ),
                        value: _selectedCustomer,
                        items: _customers.map((customer) {
                          return DropdownMenuItem(
                            value: customer,
                            child: Text('${customer.name} - ${customer.phone}'),
                          );
                        }).toList(),
                        onChanged: _onCustomerSelected,
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
                      const SizedBox(height: 16),

                      // Paid Amount
                      TextFormField(
                        decoration: const InputDecoration(
                          labelText: 'Paid Now (₹)',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        initialValue: _paidAmount.toString(),
                        onChanged: (value) {
                          setState(() {
                            _paidAmount = double.tryParse(value) ?? 0;
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
                        onPressed: _selectedCustomer == null || _items.isEmpty
                            ? null
                            : _createBill,
                        child: const Text('Create Bill'),
                      ),
                    ],
                  ),
                ),
    );
  }

  Future<void> _createBill() async {
    // TODO: Implement create bill
  }
}

class BillItem {
  final int productId;
  final Product product;
  int quantity;
  double price;
  double gstPercent;
  double discount;

  BillItem({
    required this.productId,
    required this.product,
    this.quantity = 1,
    required this.price,
    required this.gstPercent,
    this.discount = 0,
  });
}
