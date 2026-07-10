import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api_service.dart';
import '../models/customer.dart';
import '../models/product.dart';
import '../models/customer_balance.dart';

import '../models/bill.dart';

class EditBillScreen extends StatefulWidget {
  final Bill bill;
  const EditBillScreen({super.key, required this.bill});

  @override
  State<EditBillScreen> createState() => _EditBillScreenState();
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

  double get lineTotal {
    return price * quantity;
  }

  double get discountAmount {
    return (lineTotal * discount) / 100;
  }

  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'quantity': quantity,
      'price': price,
      'gstPercent': gstPercent,
      'discount': discountAmount,
    };
  }
}

class _EditBillScreenState extends State<EditBillScreen> {
  final ApiService _apiService = ApiService();
  List<Customer> _customers = [];
  Customer? _selectedCustomer;
  CustomerBalance? _customerBalance;
  Map<String, dynamic>? _loyaltyAccount;
  bool _useLoyaltyPoints = false;
  Map<String, double> _customerPrices = {};
  List<Product> _searchResults = [];
  bool _isSearching = false;
  final List<BillItem> _items = [];
  String _gstType = 'INCLUDED';
  double _discount = 0;
  double _paidAmount = 0;
  bool _isLoading = true;
  bool _billCreated = false;
  String? _invoiceNumber;

  @override
  void initState() {
    super.initState();
    _gstType = widget.bill.gstType;
    _discount = widget.bill.discount;
    _paidAmount = 0;
    _invoiceNumber = widget.bill.invoiceNumber;
    
    // Add existing items
    for (var item in widget.bill.items) {
      _items.add(BillItem(
        productId: item.product.id,
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        gstPercent: item.product.gstPercent,
        discount: (item.discount / (item.price * item.quantity)) * 100, // Recover percentage
      ));
    }
    
    _loadCustomers().then((_) {
      // Find and select the customer
      final customer = _customers.where((c) => c.id == widget.bill.customer.id).firstOrNull;
      if (customer != null) {
        _onCustomerSelected(customer);
      }
    });
  }

  Future<void> _loadCustomers() async {
    try {
      final customers = await _apiService.getCustomers();
      setState(() {
        _customers = customers;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load customers: $e')),
        );
      }
    }
  }

  Future<void> _onCustomerSelected(Customer? customer) async {
    setState(() {
      _selectedCustomer = customer;
      _customerBalance = null;
      _loyaltyAccount = null;
      _useLoyaltyPoints = false;
      _customerPrices = {};
    });
    if (customer != null) {
      try {
        final prices = await _apiService.getCustomerProductPrices(customer.id);
        final balance = await _apiService.getCustomerBalance(customer.id);
        Map<String, dynamic>? loyalty;
        try {
          loyalty = await _apiService.getLoyaltyAccount(customer.id);
        } catch (e) {
          // Ignored if loyalty doesn't exist
        }
        setState(() {
          _customerPrices = prices;
          _customerBalance = balance;
          _loyaltyAccount = loyalty;
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

  Future<void> _searchProducts(String query) async {
    setState(() {
      _isSearching = true;
    });
    if (query.isEmpty) {
      setState(() {
        _searchResults = [];
        _isSearching = false;
      });
      return;
    }
    try {
      final results = await _apiService.searchProducts(query);
      setState(() {
        _searchResults = results;
        _isSearching = false;
      });
    } catch (e) {
      setState(() {
        _isSearching = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to search products: $e')),
        );
      }
    }
  }

  void _addItem(Product product) {
    final customerPrice = _customerPrices[product.id.toString()];
    setState(() {
      _items.add(BillItem(
        productId: product.id,
        product: product,
        price: customerPrice ?? product.price,
        gstPercent: product.gstPercent,
      ));
      _searchResults = [];
    });
  }

  void _removeItem(int index) {
    setState(() {
      _items.removeAt(index);
    });
  }

  double get grossTotal {
    return _items.fold(0, (sum, item) => sum + item.lineTotal);
  }

  double get lineDiscountTotal {
    return _items.fold(0, (sum, item) => sum + item.discountAmount);
  }

  double get taxableAmount {
    return grossTotal - lineDiscountTotal - ((grossTotal - lineDiscountTotal) * _discount / 100);
  }

  double get gstAmount {
    return _items.fold(0, (sum, item) {
      final lineBase = item.price * item.quantity;
      final lineDiscount = (lineBase * item.discount) / 100;
      final line = lineBase - lineDiscount;
      if (_gstType == 'INCLUDED') {
        final rate = item.gstPercent / 100;
        return sum + (line * rate) / (1 + rate);
      }
      return sum + line * (item.gstPercent / 100);
    });
  }

  double get loyaltyDiscount {
    if (!_useLoyaltyPoints || _loyaltyAccount == null) return 0;
    return (_loyaltyAccount!['points'] as num).toDouble() * 0.10;
  }

  double get finalAmount {
    double total = _gstType == 'INCLUDED'
        ? (grossTotal - lineDiscountTotal - ((grossTotal - lineDiscountTotal) * _discount / 100))
        : (grossTotal - lineDiscountTotal + gstAmount - ((grossTotal - lineDiscountTotal) * _discount / 100));
    return total - loyaltyDiscount;
  }

  Future<void> _updateBill() async {
    if (_selectedCustomer == null || _items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a customer and add at least one item')),
      );
      return;
    }
    try {
      final billData = {
        'customerId': _selectedCustomer!.id,
        'items': _items.map((item) => item.toJson()).toList(),
        'discount': _discount,
        'gstType': _gstType,
        'paidAmount': _paidAmount,
        'redeemPoints': _useLoyaltyPoints ? (_loyaltyAccount!['points'] ?? 0) : 0,
      };
      final bill = await _apiService.updateBill(widget.bill.id, billData);
      setState(() {
        _billCreated = true;
        _invoiceNumber = bill.invoiceNumber;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Bill updated successfully!')),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update bill: $e')),
        );
      }
    }
  }

  Future<void> _sendBillToWhatsApp() async {
    if (_selectedCustomer == null) return;

    String message = "Hello ${_selectedCustomer!.name},\n\n";
    message += "Your Bill: ${_invoiceNumber ?? 'INV-XXXX'}\n";
    message += "------------------------\n";
    for (var item in _items) {
      message += "${item.product.name} x ${item.quantity} = ₹${(item.price * item.quantity).toStringAsFixed(2)}\n";
    }
    message += "------------------------\n";
    message += "Gross Total: ₹${grossTotal.toStringAsFixed(2)}\n";
    message += "Discount: -₹${lineDiscountTotal.toStringAsFixed(2)}\n";
    message += "GST: ₹${gstAmount.toStringAsFixed(2)}\n";
    message += "Grand Total: ₹${finalAmount.toStringAsFixed(2)}\n";
    if (_customerBalance != null) {
      message += "Previous Balance: ₹${_customerBalance!.remainingAmount.toStringAsFixed(2)}\n";
      message += "Paid: -₹${_paidAmount.toStringAsFixed(2)}\n";
      message += "Remaining Balance: ₹${(_customerBalance!.remainingAmount + finalAmount - _paidAmount).toStringAsFixed(2)}\n";
    }
    message += "\nThank you for your business!";

    final phone = _selectedCustomer!.phone.replaceAll(RegExp(r'[^0-9]'), '');
    final url = "https://wa.me/$phone?text=${Uri.encodeComponent(message)}";
    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('WhatsApp not installed or cannot be opened')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error opening WhatsApp: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Focus on search field
          // For now, just show a snackbar
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Search for products above to add!')),
          );
        },
        child: const Icon(Icons.add),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back),
                        onPressed: () => Navigator.pop(context),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Create Bill',
                        style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Customer Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 16),
                          DropdownButtonFormField<Customer>(
                            initialValue: _selectedCustomer,
                            decoration: const InputDecoration(
                              labelText: 'Select Customer',
                            ),
                            items: _customers.map((customer) {
                              return DropdownMenuItem(
                                value: customer,
                                child: Text('${customer.name} - ${customer.phone}'),
                              );
                            }).toList(),
                            onChanged: _onCustomerSelected,
                          ),
                          if (_customerBalance != null) ...[
                            const SizedBox(height: 16),
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.blue[50],
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Previous Balance',
                                    style: TextStyle(color: Colors.blue[800], fontWeight: FontWeight.w500),
                                  ),
                                  Text(
                                    '₹${_customerBalance!.remainingAmount.toStringAsFixed(2)}',
                                    style: TextStyle(color: Colors.blue[800], fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                          ],
                          if (_loyaltyAccount != null && (_loyaltyAccount!['points'] ?? 0) > 0) ...[
                            const SizedBox(height: 16),
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.orange[50],
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.star, color: Colors.orange, size: 20),
                                      const SizedBox(width: 8),
                                      Text(
                                        '${_loyaltyAccount!['points']} Loyalty Points',
                                        style: TextStyle(color: Colors.orange[800], fontWeight: FontWeight.w500),
                                      ),
                                    ],
                                  ),
                                  Switch(
                                    value: _useLoyaltyPoints,
                                    activeColor: Colors.orange,
                                    onChanged: (val) {
                                      setState(() {
                                        _useLoyaltyPoints = val;
                                      });
                                    },
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Bill Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 16),
                          DropdownButtonFormField<String>(
                            initialValue: _gstType,
                            decoration: const InputDecoration(
                              labelText: 'GST Type',
                            ),
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
                          Row(
                            children: [
                              Expanded(
                                child: TextFormField(
                                  decoration: const InputDecoration(
                                    labelText: 'Discount (%)',
                                  ),
                                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                  initialValue: _discount.toString(),
                                  onChanged: (value) {
                                    setState(() {
                                      _discount = double.tryParse(value) ?? 0;
                                    });
                                  },
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: TextFormField(
                                  decoration: const InputDecoration(
                                    labelText: 'Paid Amount',
                                  ),
                                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                  initialValue: _paidAmount.toString(),
                                  onChanged: (value) {
                                    setState(() {
                                      _paidAmount = double.tryParse(value) ?? 0;
                                    });
                                  },
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Add Products', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 16),
                          TextField(
                            decoration: InputDecoration(
                              hintText: 'Search product by name or part number...',
                              prefixIcon: const Icon(Icons.search),
                              suffixIcon: _isSearching
                                  ? const Padding(
                                      padding: EdgeInsets.all(12.0),
                                      child: CircularProgressIndicator(strokeWidth: 2),
                                    )
                                  : null,
                            ),
                            onChanged: _searchProducts,
                          ),
                          if (_searchResults.isNotEmpty) ...[
                            const SizedBox(height: 12),
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.grey[100],
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: ListView.separated(
                                shrinkWrap: true,
                                padding: EdgeInsets.zero,
                                separatorBuilder: (context, index) => const Divider(height: 1),
                                itemCount: _searchResults.length,
                                itemBuilder: (context, index) {
                                  final product = _searchResults[index];
                                  final customerPrice = _customerPrices[product.id.toString()];
                                  return ListTile(
                                    title: Text(product.name),
                                    subtitle: Text(product.partNumber),
                                    trailing: Text(
                                      '₹${(customerPrice ?? product.price).toStringAsFixed(2)}',
                                      style: const TextStyle(fontWeight: FontWeight.bold),
                                    ),
                                    onTap: () => _addItem(product),
                                  );
                                },
                              ),
                            ),
                          ],
                          const SizedBox(height: 16),
                          if (_items.isNotEmpty) ...[
                            const Text('Bill Items', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 12),
                            ..._items.asMap().entries.map((entry) {
                              final index = entry.key;
                              final item = entry.value;
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 12.0),
                                child: Card(
                                  child: Padding(
                                    padding: const EdgeInsets.all(16.0),
                                    child: Column(
                                      children: [
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Text(item.product.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                            ),
                                            IconButton(
                                              icon: const Icon(Icons.delete_outline, color: Colors.red),
                                              onPressed: () => _removeItem(index),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 16),
                                        Row(
                                          children: [
                                            Expanded(
                                              child: TextFormField(
                                                decoration: const InputDecoration(labelText: 'Quantity'),
                                                keyboardType: TextInputType.number,
                                                initialValue: item.quantity.toString(),
                                                onChanged: (value) {
                                                  setState(() {
                                                    item.quantity = int.tryParse(value) ?? 1;
                                                  });
                                                },
                                              ),
                                            ),
                                            const SizedBox(width: 12),
                                            Expanded(
                                              child: TextFormField(
                                                decoration: const InputDecoration(labelText: 'Price'),
                                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                                initialValue: item.price.toString(),
                                                onChanged: (value) {
                                                  setState(() {
                                                    item.price = double.tryParse(value) ?? 0;
                                                  });
                                                },
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 12),
                                        Row(
                                          children: [
                                            Expanded(
                                              child: TextFormField(
                                                decoration: const InputDecoration(labelText: 'GST %'),
                                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                                initialValue: item.gstPercent.toString(),
                                                onChanged: (value) {
                                                  setState(() {
                                                    item.gstPercent = double.tryParse(value) ?? 0;
                                                  });
                                                },
                                              ),
                                            ),
                                            const SizedBox(width: 12),
                                            Expanded(
                                              child: TextFormField(
                                                decoration: const InputDecoration(labelText: 'Discount %'),
                                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                                initialValue: item.discount.toString(),
                                                onChanged: (value) {
                                                  setState(() {
                                                    item.discount = double.tryParse(value) ?? 0;
                                                  });
                                                },
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            }),
                            const SizedBox(height: 24),
                            Card(
                              color: Colors.blue[50],
                              child: Padding(
                                padding: const EdgeInsets.all(20.0),
                                child: Column(
                                  children: [
                                    _buildSummaryRow('Gross Total:', '₹${grossTotal.toStringAsFixed(2)}'),
                                    _buildSummaryRow('Total Discount:', '-₹${lineDiscountTotal.toStringAsFixed(2)}'),
                                    _buildSummaryRow('GST Amount:', '₹${gstAmount.toStringAsFixed(2)}'),
                                    if (_useLoyaltyPoints && loyaltyDiscount > 0)
                                      _buildSummaryRow('Loyalty Discount:', '-₹${loyaltyDiscount.toStringAsFixed(2)}'),
                                    const Divider(height: 32),
                                    _buildSummaryRow('Grand Total:', '₹${finalAmount.toStringAsFixed(2)}', isTotal: true),
                                    if (_customerBalance != null) ...[
                                      const SizedBox(height: 16),
                                      const Divider(),
                                      const SizedBox(height: 16),
                                      _buildSummaryRow('Previous Balance:', '₹${_customerBalance!.remainingAmount.toStringAsFixed(2)}'),
                                      _buildSummaryRow('Paid Amount:', '-₹${_paidAmount.toStringAsFixed(2)}'),
                                      const SizedBox(height: 8),
                                      _buildSummaryRow(
                                        'Remaining After Bill:',
                                        '₹${(_customerBalance!.remainingAmount + finalAmount - _paidAmount).toStringAsFixed(2)}',
                                        isTotal: true,
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  if (_billCreated) ...[
                    ElevatedButton.icon(
                      onPressed: _sendBillToWhatsApp,
                      icon: const Icon(Icons.send),
                      label: const Text('Send Bill via WhatsApp'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        backgroundColor: Colors.green,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () {
                        // Reset form
                        setState(() {
                          _billCreated = false;
                          _invoiceNumber = null;
                          _items.clear();
                          _discount = 0;
                          _paidAmount = 0;
                        });
                      },
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      child: const Text('Create Another Bill'),
                    ),
                  ],
                  if (!_billCreated)
                    ElevatedButton(
                      onPressed: _updateBill,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      child: const Text('Create Bill'),
                    ),
                ],
              ),
            ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(
                label,
                style: TextStyle(
                  fontWeight: isTotal ? FontWeight.bold : FontWeight.w500,
                  fontSize: isTotal ? 16 : 14,
                  color: isTotal ? Colors.blue : Theme.of(context).colorScheme.onSurface,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerRight,
              child: Text(
                value,
                style: TextStyle(
                  fontWeight: isTotal ? FontWeight.bold : FontWeight.w500,
                  fontSize: isTotal ? 16 : 14,
                  color: isTotal ? Colors.blue : Theme.of(context).colorScheme.onSurface,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
