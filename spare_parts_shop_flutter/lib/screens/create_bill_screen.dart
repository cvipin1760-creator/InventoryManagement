import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../models/customer.dart';
import '../models/product.dart';
import '../models/customer_balance.dart';
import '../providers/auth_provider.dart';
import 'barcode_scanner_screen.dart';

class CreateBillScreen extends StatefulWidget {
  const CreateBillScreen({super.key});

  @override
  State<CreateBillScreen> createState() => _CreateBillScreenState();
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

class _CreateBillScreenState extends State<CreateBillScreen> {
  final ApiService _apiService = ApiService();
  List<Customer> _customers = [];
  Customer? _selectedCustomer;
  CustomerBalance? _customerBalance;
  Map<String, dynamic>? _loyaltyAccount;
  bool _useLoyaltyPoints = false;
  Map<String, double> _customerPrices = {};

  // Product state
  List<Product> _allProducts = [];
  List<Product> _filteredProducts = [];
  bool _isLoadingProducts = true;
  String? _productError;
  final TextEditingController _searchController = TextEditingController();

  final List<BillItem> _items = [];
  String _gstType = 'INCLUDED';
  double _discount = 0;
  double _paidAmount = 0;
  String _paymentMode = 'FULL';
  bool _isLoading = true;
  bool _billCreated = false;
  String? _invoiceNumber;

  @override
  void initState() {
    super.initState();
    _loadCustomers();
    _loadProducts();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
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

  Future<void> _loadProducts() async {
    setState(() {
      _isLoadingProducts = true;
      _productError = null;
    });
    try {
      final products = await _apiService.getProducts();
      if (mounted) {
        setState(() {
          _allProducts = products;
          _filteredProducts = products;
          _isLoadingProducts = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingProducts = false;
          _productError = 'Failed to load products: $e';
        });
      }
    }
  }

  void _filterProducts(String query) {
    if (query.trim().isEmpty) {
      setState(() {
        _filteredProducts = _allProducts;
      });
      return;
    }
    final q = query.toLowerCase();
    setState(() {
      _filteredProducts = _allProducts.where((p) {
        return p.name.toLowerCase().contains(q) ||
            p.partNumber.toLowerCase().contains(q);
      }).toList();
    });
    // Also call API search for thoroughness (backend may have more fields)
    _apiSearchProducts(query);
  }

  Future<void> _apiSearchProducts(String query) async {
    if (query.trim().isEmpty) return;
    try {
      final results = await _apiService.searchProducts(query);
      if (mounted && _searchController.text == query) {
        // Merge API results with local filter (deduplicate by id)
        final existingIds = _filteredProducts.map((p) => p.id).toSet();
        final newItems = results.where((p) => !existingIds.contains(p.id)).toList();
        if (newItems.isNotEmpty) {
          setState(() {
            _filteredProducts = [..._filteredProducts, ...newItems];
          });
        }
      }
    } catch (_) {
      // Silent — local filter already shows results
    }
  }

  void _addItem(Product product) {
    if (product.quantity <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('⚠️ ${product.name} is out of stock'),
          backgroundColor: Colors.orange[700],
        ),
      );
      return;
    }
    // Check for duplicate and merge quantity
    final existingIndex = _items.indexWhere((i) => i.productId == product.id);
    if (existingIndex != -1) {
      setState(() {
        _items[existingIndex].quantity += 1;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Quantity updated for ${product.name}')),
      );
      return;
    }
    final customerPrice = _customerPrices[product.id.toString()];
    setState(() {
      _items.add(BillItem(
        productId: product.id,
        product: product,
        price: customerPrice ?? product.price,
        gstPercent: product.gstPercent,
      ));
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

  Future<void> _createBill() async {
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
        'paymentMode': _paymentMode,
        'gstType': _gstType,
        'paidAmount': _paidAmount,
        'redeemPoints': _useLoyaltyPoints ? (_loyaltyAccount!['points'] ?? 0) : 0,
      };
      final bill = await _apiService.createBillFromMap(billData);
      setState(() {
        _billCreated = true;
        _invoiceNumber = bill.invoiceNumber;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Bill created successfully!')),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to create bill: $e')),
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
                            value: _selectedCustomer,
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
                                color: Theme.of(context).primaryColor.withOpacity(0.05),
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
                                color: Theme.of(context).primaryColor.withOpacity(0.05),
                                borderRadius: BorderRadius.circular(12),
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
                            value: _gstType,
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
                              if (Provider.of<AuthProvider>(context, listen: false).account?.features?['emiEnabled'] == true)
                                Expanded(
                                  child: DropdownButtonFormField<String>(
                                    value: _paymentMode,
                                    decoration: const InputDecoration(labelText: 'Payment Mode'),
                                    items: const [
                                      DropdownMenuItem(value: 'FULL', child: Text('Full Payment')),
                                      DropdownMenuItem(value: 'EMI', child: Text('EMI / Installments')),
                                      DropdownMenuItem(value: 'LATER', child: Text('Pay Later')),
                                    ],
                                    onChanged: (v) => setState(() => _paymentMode = v!),
                                  ),
                                ),
                              if (Provider.of<AuthProvider>(context, listen: false).account?.features?['emiEnabled'] == true)
                                const SizedBox(width: 16),
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
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Add Products', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                              if (!_isLoadingProducts)
                                Text(
                                  '${_filteredProducts.length} product${_filteredProducts.length == 1 ? '' : 's'}',
                                  style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                                ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: _searchController,
                                  decoration: InputDecoration(
                                    hintText: 'Search by name, part number...',
                                    prefixIcon: const Icon(Icons.search),
                                    suffixIcon: _searchController.text.isNotEmpty
                                        ? IconButton(
                                            icon: const Icon(Icons.clear),
                                            onPressed: () {
                                              _searchController.clear();
                                              _filterProducts('');
                                            },
                                          )
                                        : null,
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                  onChanged: _filterProducts,
                                ),
                              ),
                              const SizedBox(width: 8),
                              IconButton(
                                icon: const Icon(Icons.qr_code_scanner, size: 28),
                                color: Colors.blue,
                                tooltip: 'Scan barcode',
                                onPressed: () async {
                                  final barcode = await Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (context) => const BarcodeScannerScreen()),
                                  );
                                  if (barcode != null && mounted) {
                                    _searchController.text = barcode;
                                    _filterProducts(barcode);
                                    if (_filteredProducts.length == 1) {
                                      _addItem(_filteredProducts.first);
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text('Added ${_filteredProducts.first.name}')),
                                      );
                                    } else if (_filteredProducts.isEmpty) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text('No product found for $barcode')),
                                      );
                                    }
                                  }
                                },
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          // Product list area
                          if (_isLoadingProducts)
                            const Center(
                              child: Padding(
                                padding: EdgeInsets.symmetric(vertical: 24.0),
                                child: Column(
                                  children: [
                                    CircularProgressIndicator(),
                                    SizedBox(height: 12),
                                    Text('Loading products...', style: TextStyle(color: Colors.grey)),
                                  ],
                                ),
                              ),
                            )
                          else if (_productError != null)
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.red[50],
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.red[200]!),
                              ),
                              child: Column(
                                children: [
                                  Row(
                                    children: [
                                      Icon(Icons.error_outline, color: Colors.red[700]),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          _productError!,
                                          style: TextStyle(color: Colors.red[700], fontSize: 13),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  ElevatedButton.icon(
                                    onPressed: _loadProducts,
                                    icon: const Icon(Icons.refresh, size: 16),
                                    label: const Text('Retry'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.red[700],
                                      foregroundColor: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                            )
                          else if (_allProducts.isEmpty)
                            Container(
                              padding: const EdgeInsets.all(24),
                              alignment: Alignment.center,
                              child: Column(
                                children: [
                                  Icon(Icons.inventory_2_outlined, size: 48, color: Colors.grey[400]),
                                  const SizedBox(height: 12),
                                  Text(
                                    'No products found',
                                    style: TextStyle(color: Colors.grey[600], fontSize: 15),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Add products in the Products module first.',
                                    style: TextStyle(color: Colors.grey[400], fontSize: 12),
                                    textAlign: TextAlign.center,
                                  ),
                                ],
                              ),
                            )
                          else if (_filteredProducts.isEmpty)
                            Container(
                              padding: const EdgeInsets.all(24),
                              alignment: Alignment.center,
                              child: Column(
                                children: [
                                  Icon(Icons.search_off, size: 48, color: Colors.grey[400]),
                                  const SizedBox(height: 12),
                                  Text(
                                    'No products match "${_searchController.text}"',
                                    style: TextStyle(color: Colors.grey[600], fontSize: 14),
                                    textAlign: TextAlign.center,
                                  ),
                                ],
                              ),
                            )
                          else
                            Container(
                              constraints: const BoxConstraints(maxHeight: 320),
                              decoration: BoxDecoration(
                                color: Colors.grey[50],
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: Colors.grey[200]!),
                              ),
                              child: ListView.separated(
                                shrinkWrap: true,
                                padding: EdgeInsets.zero,
                                separatorBuilder: (context, index) => Divider(height: 1, color: Colors.grey[200]),
                                itemCount: _filteredProducts.length,
                                itemBuilder: (context, index) {
                                  final product = _filteredProducts[index];
                                  final customerPrice = _customerPrices[product.id.toString()];
                                  final isOutOfStock = product.quantity <= 0;
                                  return ListTile(
                                    onTap: isOutOfStock ? null : () => _addItem(product),
                                    title: Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            product.name,
                                            style: TextStyle(
                                              fontWeight: FontWeight.w600,
                                              color: isOutOfStock ? Colors.grey : null,
                                            ),
                                          ),
                                        ),
                                        if (isOutOfStock)
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: Colors.red[100],
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: Text(
                                              'Out of stock',
                                              style: TextStyle(fontSize: 10, color: Colors.red[700], fontWeight: FontWeight.w600),
                                            ),
                                          ),
                                      ],
                                    ),
                                    subtitle: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        if (product.partNumber.isNotEmpty)
                                          Text('SKU: ${product.partNumber}', style: const TextStyle(fontSize: 12)),
                                        Row(
                                          children: [
                                            Text(
                                              'Stock: ${product.quantity}',
                                              style: TextStyle(
                                                fontSize: 12,
                                                color: product.quantity <= product.lowStockThreshold
                                                    ? Colors.orange[700]
                                                    : Colors.green[700],
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                            const SizedBox(width: 12),
                                            if (product.gstPercent > 0)
                                              Text(
                                                'GST: ${product.gstPercent}%',
                                                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                                              ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    trailing: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        Text(
                                          '₹${(customerPrice ?? product.price).toStringAsFixed(2)}',
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                        ),
                                        if (!isOutOfStock)
                                          Text('Tap to add', style: TextStyle(fontSize: 10, color: Colors.blue[400])),
                                      ],
                                    ),
                                  );
                                },
                              ),
                            ),
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
                      onPressed: _createBill,
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
