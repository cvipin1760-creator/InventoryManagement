import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/api_service.dart';
import '../services/api_service.dart';
import '../services/printer_service.dart';
import '../services/shift_service.dart';
import '../services/approval_service.dart';
import '../core/database_helper.dart';
import '../models/product.dart';


class QuickPosScreen extends StatefulWidget {
  const QuickPosScreen({super.key});

  @override
  State<QuickPosScreen> createState() => _QuickPosScreenState();
}

class _QuickPosScreenState extends State<QuickPosScreen> {
  final ApiService _apiService = ApiService();
  final ShiftService _shiftService = ShiftService();
  final ApprovalService _approvalService = ApprovalService();
  
  List<Product> _products = [];
  List<Product> _filteredProducts = [];
  
  final List<Map<String, dynamic>> _cart = [];
  
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _customerController = TextEditingController();
  
  final FocusNode _searchFocus = FocusNode();
  final FocusNode _customerFocus = FocusNode();

  bool _isLoading = true;
  String _aiSuggestion = "Ready for billing";
  String _paymentMode = 'CASH';
  double _emiDownPayment = 0;
  int _emiMonths = 1;
  double _discountPercentage = 0;
  
  Map<String, dynamic>? _activeCustomer;

  Timer? _debounce;
  final List<Map<String, dynamic>> _heldBills = [];

  @override
  void initState() {
    super.initState();
    _checkShift();
    _loadProducts();
    _searchController.addListener(_onSearchChanged);
    
    // Add hotkey listener
    ServicesBinding.instance.keyboard.addHandler(_onKeyEvent);
  }

  Future<void> _checkShift() async {
    try {
      final currentShift = await _shiftService.getCurrentShift();
      if (currentShift == null) {
        if (mounted) {
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) => AlertDialog(
              title: const Text('Register Closed'),
              content: const Text('You must open a shift before billing.'),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.pop(context); // Go back to dashboard
                  },
                  child: const Text('Go Back'),
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context); // close dialog
                    Navigator.pushReplacementNamed(context, '/shift-management');
                  },
                  child: const Text('Open Register'),
                ),
              ],
            ),
          );
        }
      }
    } catch (e) {
      debugPrint('Error checking shift: $e');
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    _customerController.dispose();
    _searchFocus.dispose();
    _customerFocus.dispose();
    ServicesBinding.instance.keyboard.removeHandler(_onKeyEvent);
    super.dispose();
  }
  
  bool _onKeyEvent(KeyEvent event) {
    if (event is KeyDownEvent) {
      if (event.logicalKey == LogicalKeyboardKey.f1) {
        _searchFocus.requestFocus();
        return true;
      }
      if (event.logicalKey == LogicalKeyboardKey.f2) {
        _customerFocus.requestFocus();
        return true;
      }
      if (event.logicalKey == LogicalKeyboardKey.f3) {
        _holdBill();
        return true;
      }
      if (event.logicalKey == LogicalKeyboardKey.f4) {
        _showHeldBills();
        return true;
      }
      if (event.logicalKey == LogicalKeyboardKey.f6) {
        _saveBill();
        return true;
      }
    }
    return false;
  }

  Future<void> _loadProducts() async {
    try {
      final products = await _apiService.getProducts();
      if (mounted) {
        setState(() {
          _products = products;
          _filteredProducts = products;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load products: $e')),
        );
      }
    }
  }

  void _onSearchChanged() {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      final q = _searchController.text.toLowerCase();
      setState(() {
        _filteredProducts = _products.where((p) {
          return p.name.toLowerCase().contains(q) || 
                 p.partNumber.toLowerCase().contains(q);
        }).toList();
      });
    });
  }

  void _processScan(String query) {
    if (query.trim().isEmpty) {
      _searchFocus.requestFocus();
      return;
    }
    
    // Exact match for partNumber (barcode)
    final exactMatch = _products.where((p) => p.partNumber.toLowerCase() == query.trim().toLowerCase()).toList();
    if (exactMatch.length == 1) {
      _addToCart(exactMatch.first);
      _searchController.clear();
    } else {
      // Maybe exact match on name
      final nameMatch = _products.where((p) => p.name.toLowerCase() == query.trim().toLowerCase()).toList();
      if (nameMatch.length == 1) {
        _addToCart(nameMatch.first);
        _searchController.clear();
      }
    }
    // Always keep focus for continuous scanning
    Future.microtask(() => _searchFocus.requestFocus());
  }

  void _addToCart(Product product) {
    setState(() {
      final existingIndex = _cart.indexWhere((item) => item['product'].id == product.id);
      if (existingIndex >= 0) {
        _cart[existingIndex]['quantity'] += 1;
      } else {
        _cart.add({
          'product': product,
          'quantity': 1,
          'price': product.price,
          'warrantyType': 'NO_WARRANTY',
          'warrantyPeriodMonths': null,
          'warrantyNotes': '',
        });
      }
      
      _updateAiSuggestion();
    });
  }

  void _removeFromCart(int index) {
    setState(() {
      _cart.removeAt(index);
      _updateAiSuggestion();
    });
  }
  
  void _updateQuantity(int index, int delta) {
    setState(() {
      _cart[index]['quantity'] += delta;
      if (_cart[index]['quantity'] <= 0) {
        _cart.removeAt(index);
      }
      _updateAiSuggestion();
    });
  }

  void _updateAiSuggestion() {
    if (_cart.isNotEmpty) {
      final String name = _cart.first['product'].name;
      _aiSuggestion = "Frequently Bought Together: $name Accessories";
    } else {
      _aiSuggestion = "Ready for billing";
    }
  }

  double get _totalAmount {
    return _cart.fold(0, (sum, item) => sum + (item['price'] * item['quantity']));
  }

  Future<void> _checkLoyalty() async {
    final query = _customerController.text.trim();
    if (query.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter phone number')));
      return;
    }
    
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );
    
    try {
      final results = await _apiService.get('/customers/search?keyword=$query') as List;
      Navigator.pop(context); // close loader
      
      if (results.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('No customer found')));
        return;
      }
      
      final customer = results.first;
      setState(() => _activeCustomer = customer);
      
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Loyalty Points: ${customer['name']}'),
          content: Text('Available Points: ${customer['loyaltyPoints']}\n\n1 Point = ₹1 Discount'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: customer['loyaltyPoints'] > 0 ? () async {
                try {
                  await _apiService.post('/customers/${customer['id']}/redeem-points', body: {'points': customer['loyaltyPoints']});
                  setState(() {
                     // Simple conversion for demo: 1 pt = 1% discount roughly, or just set it as absolute discount if we changed to absolute.
                     // But _discountPercentage is percentage. Let's just give a fixed 10% discount for redeeming any points for this demo.
                     _discountPercentage = 10.0; 
                  });
                  Navigator.pop(context);
                  ScaffoldMessenger.of(this.context).showSnackBar(const SnackBar(content: Text('Points redeemed! 10% discount applied.')));
                } catch (e) {
                  ScaffoldMessenger.of(this.context).showSnackBar(SnackBar(content: Text('Error redeeming: $e')));
                }
              } : null,
              child: const Text('Redeem (Apply 10% Off)'),
            ),
          ],
        ),
      );
    } catch (e) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  Future<void> _saveBill() async {
    if (_cart.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cart is empty')),
      );
      return;
    }
    
    // Simulate bill saving
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    final subtotal = _cart.fold(0.0, (sum, item) => sum + (item['price'] * item['quantity']));
    final discountAmount = subtotal * (_discountPercentage / 100);

    if (_discountPercentage > 10.0) {
      // Require Manager Approval
      Navigator.pop(context); // close saving dialog
      
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          title: const Text('Manager Approval Required'),
          content: Text('A discount of $_discountPercentage% exceeds the 10% limit. Waiting for manager approval...'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('Cancel Request'),
            ),
            ElevatedButton(
              onPressed: () async {
                try {
                  final req = await _approvalService.requestApproval('HIGH_DISCOUNT', {
                    'customerName': _customerController.text,
                    'discountRequested': _discountPercentage,
                    'subtotal': subtotal,
                  });
                  Navigator.pop(context);
                  ScaffoldMessenger.of(this.context).showSnackBar(
                    SnackBar(content: Text('Request Sent. ID: ${req['id']}. Please ask manager to approve in dashboard.')),
                  );
                } catch (e) {
                  ScaffoldMessenger.of(this.context).showSnackBar(SnackBar(content: Text('Error: $e')));
                }
              },
              child: const Text('Request Approval Now'),
            ),
          ],
        ),
      );
      return;
    }
    
    try {
      final items = _cart.map((item) => {
        'productId': (item['product'] as Product).id,
        'productName': (item['product'] as Product).name,
        'quantity': item['quantity'],
        'price': item['price'],
        'warrantyType': item['warrantyType'],
        'warrantyPeriodMonths': item['warrantyPeriodMonths'],
        'warrantyNotes': item['warrantyNotes'],
      }).toList();
      
      final billData = {
        'customerName': _customerController.text.isEmpty ? 'Walk-in Customer' : _customerController.text,
        'items': items,
        'paymentMode': _paymentMode,
        'discount': discountAmount,
      };

      if (_paymentMode == 'EMI') {
        billData['emi'] = {
          'downPayment': _emiDownPayment,
          'totalEmis': _emiMonths,
        };
      }

      final warranties = _cart
          .where((item) => item['warrantyType'] != 'NO_WARRANTY')
          .map((item) => {
                'productId': (item['product'] as Product).id,
                'warrantyType': item['warrantyType'],
                'warrantyPeriodMonths': item['warrantyPeriodMonths'],
                'warrantyNotes': item['warrantyNotes'],
              })
          .toList();

      if (warranties.isNotEmpty) {
        billData['warranties'] = warranties;
      }

      try {
        await _apiService.createBillFromMap(billData);
      } catch (e) {
        // Fallback to SQLite Offline Mode
        debugPrint('API failed, saving offline: $e');
        await DatabaseHelper.instance.insertOfflineBill(billData);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Saved Offline. Will sync later.'), backgroundColor: Colors.orange),
          );
        }
      }
      
      // Attempt silent auto-printing
      try {
        await PrinterService().printReceipt(billData: billData, businessName: 'Stock Pilot Enterprise');
      } catch (printError) {
        debugPrint('Print Error: $printError');
      }
      
      if (mounted) {
        Navigator.pop(context); // pop dialog
        setState(() {
          _cart.clear();
          _customerController.clear();
          _searchController.clear();
          _updateAiSuggestion();
        });
        Future.microtask(() => _searchFocus.requestFocus());
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Bill saved successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // pop dialog
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save bill: $e')),
        );
      }
    }
  }

  void _holdBill() {
    if (_cart.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Cart is empty')));
      return;
    }
    setState(() {
      _heldBills.add({
        'customer': _customerController.text,
        'cart': List<Map<String, dynamic>>.from(_cart.map((item) => Map<String, dynamic>.from(item))),
        'timestamp': DateTime.now(),
      });
      _cart.clear();
      _customerController.clear();
      _searchController.clear();
      _updateAiSuggestion();
    });
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Bill Held Successfully')));
    _searchFocus.requestFocus();
  }

  void _showHeldBills() {
    if (_heldBills.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('No held bills')));
      return;
    }
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Held Bills'),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: _heldBills.length,
            itemBuilder: (context, index) {
              final bill = _heldBills[index];
              final cart = bill['cart'] as List;
              return ListTile(
                leading: const Icon(Icons.pause_circle_filled, color: Colors.orange),
                title: Text(bill['customer'].toString().isEmpty ? 'Guest Customer' : bill['customer']),
                subtitle: Text('${cart.length} items - Held at ${bill['timestamp'].toString().split('.').first}'),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.play_arrow, color: Colors.green),
                      tooltip: 'Resume',
                      onPressed: () {
                        setState(() {
                          _cart.clear();
                          _cart.addAll(List<Map<String, dynamic>>.from(cart));
                          _customerController.text = bill['customer'];
                          _heldBills.removeAt(index);
                          _updateAiSuggestion();
                        });
                        Navigator.pop(context);
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      tooltip: 'Discard',
                      onPressed: () {
                        setState(() => _heldBills.removeAt(index));
                        Navigator.pop(context);
                      },
                    ),
                  ],
                ),
              );
            },
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close'))
        ],
      ),
    );
  }

  Future<void> _showWarrantyDialog(int index) async {
    final item = _cart[index];
    final TextEditingController periodController = TextEditingController(text: item['warrantyPeriodMonths']?.toString() ?? '');
    final TextEditingController notesController = TextEditingController(text: item['warrantyNotes'] ?? '');
    String selectedType = item['warrantyType'] ?? 'NO_WARRANTY';

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Warranty Details'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                value: selectedType,
                items: const [
                  DropdownMenuItem(value: 'NO_WARRANTY', child: Text('No Warranty')),
                  DropdownMenuItem(value: 'MANUFACTURER', child: Text('Manufacturer')),
                  DropdownMenuItem(value: 'STORE', child: Text('Store Warranty')),
                ],
                onChanged: (v) => selectedType = v!,
                decoration: const InputDecoration(labelText: 'Warranty Type'),
              ),
              TextFormField(
                controller: periodController,
                decoration: const InputDecoration(labelText: 'Months'),
                keyboardType: TextInputType.number,
              ),
              TextFormField(
                controller: notesController,
                decoration: const InputDecoration(labelText: 'Notes'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _cart[index]['warrantyType'] = selectedType;
                _cart[index]['warrantyPeriodMonths'] = int.tryParse(periodController.text);
                _cart[index]['warrantyNotes'] = notesController.text;
              });
              Navigator.pop(context);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Quick POS'),
        actions: [
          TextButton.icon(
            onPressed: _showHeldBills,
            icon: const Icon(Icons.list_alt, color: Colors.white),
            label: Text('Resume (${_heldBills.length})', style: const TextStyle(color: Colors.white)),
          ),
          const SizedBox(width: 8),
          ElevatedButton.icon(
            onPressed: _holdBill,
            icon: const Icon(Icons.pause, size: 18),
            label: const Text('Hold (F3)'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16),
            ),
          ),
          const SizedBox(width: 16),
        ],
      ),
      
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isMobile = constraints.maxWidth < 800;
          return Flex(
            direction: isMobile ? Axis.vertical : Axis.horizontal,
            children: [
              // Left Side: Products
              Expanded(
                flex: isMobile ? 1 : 6,
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: TextField(
                    controller: _searchController,
                    focusNode: _searchFocus,
                    decoration: InputDecoration(
                      labelText: 'Search Products (F1)',
                      prefixIcon: const Icon(Icons.search),
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.add_box),
                        tooltip: 'Quick Add Product',
                        onPressed: () {
                          Navigator.pushNamed(context, '/products').then((_) => _loadProducts());
                        },
                      ),
                      border: const OutlineInputBorder(),
                    ),
                    onSubmitted: _processScan,
                  ),
                ),
                Expanded(
                  child: _isLoading 
                    ? const Center(child: CircularProgressIndicator())
                    : GridView.builder(
                        padding: const EdgeInsets.all(8),
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: constraints.maxWidth < 500 ? 2 : (isMobile ? 3 : 3),
                          childAspectRatio: 0.8,
                          crossAxisSpacing: 8,
                          mainAxisSpacing: 8,
                        ),
                        itemCount: _filteredProducts.length,
                        itemBuilder: (context, index) {
                          final p = _filteredProducts[index];
                          return Card(
                            elevation: 2,
                            child: InkWell(
                              onTap: () => _addToCart(p),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.inventory, size: 40, color: Colors.blue),
                                  const SizedBox(height: 8),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                    child: Text(
                                      p.name, 
                                      textAlign: TextAlign.center,
                                      style: const TextStyle(fontWeight: FontWeight.bold),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  Text('₹${p.price.toStringAsFixed(2)}', style: const TextStyle(color: Colors.green)),
                                  if (p.quantity < 5)
                                    Text('Low Stock: ${p.quantity}', style: const TextStyle(color: Colors.red, fontSize: 12)),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                ),
              ],
            ),
          ),
          
          if (!isMobile) const VerticalDivider(width: 1),
                    // Right Side: Cart
          Expanded(
            flex: isMobile ? 1 : 4,
            child: Container(
              color: Theme.of(context).colorScheme.surface,
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      color: Colors.indigo,
                      width: double.infinity,
                      child: Text(
                        _aiSuggestion,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _customerController,
                              focusNode: _customerFocus,
                              decoration: InputDecoration(
                                labelText: 'Customer Phone/Name (F2)',
                                prefixIcon: const Icon(Icons.person),
                                suffixIcon: IconButton(
                                  icon: const Icon(Icons.person_add),
                                  tooltip: 'Quick Add Customer',
                                  onPressed: () {
                                    Navigator.pushNamed(context, '/customers');
                                  },
                                ),
                                border: const OutlineInputBorder(),
                                isDense: true,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          ElevatedButton.icon(
                            onPressed: _checkLoyalty,
                            icon: const Icon(Icons.star, color: Colors.amber),
                            label: const Text('Loyalty'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.indigo,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SliverToBoxAdapter(child: Divider()),
                  if (_cart.isEmpty)
                    const SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.all(32.0),
                        child: Center(child: Text('Cart is empty')),
                      ),
                    )
                  else SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final item = _cart[index];
                          final product = item['product'] as Product;
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                            child: Row(
                              children: [
                                Expanded(
                                  flex: 3,
                                  child: Text(product.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  flex: 2,
                                  child: TextFormField(
                                    key: ValueKey('price_${product.id}_${item['price']}'),
                                    initialValue: item['price'].toString(),
                                    decoration: const InputDecoration(labelText: 'Price', prefixText: '₹', isDense: true, border: OutlineInputBorder()),
                                    keyboardType: TextInputType.number,
                                    onFieldSubmitted: (val) {
                                      final newPrice = double.tryParse(val);
                                      if (newPrice != null && newPrice >= 0) {
                                        setState(() {
                                          _cart[index]['price'] = newPrice;
                                          _updateAiSuggestion();
                                        });
                                      }
                                    },
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  flex: 2,
                                  child: TextFormField(
                                    key: ValueKey('qty_${product.id}_${item['quantity']}'),
                                    initialValue: item['quantity'].toString(),
                                    decoration: const InputDecoration(labelText: 'Qty', isDense: true, border: OutlineInputBorder()),
                                    keyboardType: TextInputType.number,
                                    onFieldSubmitted: (val) {
                                      final newQty = int.tryParse(val);
                                      if (newQty != null) {
                                        setState(() {
                                          if (newQty <= 0) {
                                            _cart.removeAt(index);
                                          } else {
                                            _cart[index]['quantity'] = newQty;
                                          }
                                          _updateAiSuggestion();
                                        });
                                      }
                                    },
                                  ),
                                ),
                                const SizedBox(width: 8),
                                IconButton(
                                  icon: const Icon(Icons.security, color: Colors.blue),
                                  tooltip: 'Warranty',
                                  onPressed: () => _showWarrantyDialog(index),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete, color: Colors.red),
                                  tooltip: 'Remove',
                                  onPressed: () => _removeFromCart(index),
                                ),
                              ],
                            ),
                          );
                        },
                        childCount: _cart.length,
                      ),
                    ),
                  const SliverToBoxAdapter(child: Divider()),
                  SliverFillRemaining(
                    hasScrollBody: false,
                    child: Align(
                      alignment: Alignment.bottomCenter,
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Total:', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                                Text('₹${_totalAmount.toStringAsFixed(2)}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.green)),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                DropdownButtonFormField<String>(
                                  value: _paymentMode,
                                  decoration: const InputDecoration(labelText: 'Payment Mode', isDense: true),
                                  items: const [
                                    DropdownMenuItem(value: 'CASH', child: Text('CASH')),
                                    DropdownMenuItem(value: 'EMI', child: Text('EMI')),
                                    DropdownMenuItem(value: 'LATER', child: Text('PAY LATER')),
                                  ],
                                  onChanged: (v) => setState(() => _paymentMode = v!),
                                ),
                                if (_paymentMode == 'EMI') ...[
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: TextFormField(
                                          decoration: const InputDecoration(labelText: 'Down Pmt', isDense: true),
                                          keyboardType: TextInputType.number,
                                          onChanged: (v) => setState(() => _emiDownPayment = double.tryParse(v) ?? 0),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: TextFormField(
                                          decoration: const InputDecoration(labelText: 'Months', isDense: true),
                                          keyboardType: TextInputType.number,
                                          initialValue: '1',
                                          onChanged: (v) => setState(() => _emiMonths = int.tryParse(v) ?? 1),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                backgroundColor: Colors.green,
                                foregroundColor: Colors.white,
                              ),
                              onPressed: _saveBill,
                              icon: const Icon(Icons.check_circle),
                              label: const Text('SAVE BILL (F6)', style: TextStyle(fontSize: 18)),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      );
    },
  ),
);
}
}
