import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/api_service.dart';
import '../services/printer_service.dart';
import '../models/product.dart';
import '../constants/app_theme.dart';

class SelfCheckoutScreen extends StatefulWidget {
  const SelfCheckoutScreen({super.key});

  @override
  State<SelfCheckoutScreen> createState() => _SelfCheckoutScreenState();
}

class _SelfCheckoutScreenState extends State<SelfCheckoutScreen> {
  final ApiService _apiService = ApiService();
  
  List<Product> _products = [];
  List<Product> _filteredProducts = [];
  final List<Map<String, dynamic>> _cart = [];
  
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocus = FocusNode();
  
  bool _isLoading = true;
  Timer? _debounce;
  String _paymentMode = 'UPI';

  @override
  void initState() {
    super.initState();
    _loadProducts();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    _searchFocus.dispose();
    super.dispose();
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
        setState(() => _isLoading = false);
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
      _processExactScan(q);
    });
  }

  void _processExactScan(String query) {
    if (query.trim().isEmpty) return;
    final exactMatch = _products.where((p) => p.partNumber.toLowerCase() == query.trim().toLowerCase()).toList();
    if (exactMatch.length == 1) {
      _addToCart(exactMatch.first);
      _searchController.clear();
      _searchFocus.requestFocus();
    }
  }

  void _addToCart(Product product) {
    setState(() {
      final existingIndex = _cart.indexWhere((item) => (item['product'] as Product).id == product.id);
      if (existingIndex >= 0) {
        _cart[existingIndex]['quantity']++;
      } else {
        _cart.add({
          'product': product,
          'quantity': 1,
          'price': product.price,
        });
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${product.name} added to cart'), duration: const Duration(seconds: 1)),
    );
  }

  void _updateQuantity(int index, int delta) {
    setState(() {
      _cart[index]['quantity'] += delta;
      if (_cart[index]['quantity'] <= 0) {
        _cart.removeAt(index);
      }
    });
  }

  Future<void> _processPayment() async {
    if (_cart.isEmpty) return;
    
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );
    
    try {
      final items = _cart.map((item) => {
        'productId': (item['product'] as Product).id,
        'productName': (item['product'] as Product).name,
        'quantity': item['quantity'],
        'price': item['price'],
        'warrantyType': 'NO_WARRANTY',
        'warrantyPeriodMonths': 0,
        'warrantyNotes': '',
      }).toList();
      
      final billData = {
        'customerName': 'Self-Checkout Kiosk',
        'items': items,
        'paymentMode': _paymentMode,
        'discount': 0,
      };

      await _apiService.createBillFromMap(billData);
      
      // Auto-print receipt
      try {
        await PrinterService().printReceipt(billData: billData, businessName: 'Store');
      } catch (e) {
        debugPrint('Print failed: $e');
      }

      if (mounted) {
        Navigator.pop(context); // close loader
        
        // Show success screen
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            title: const Icon(Icons.check_circle, color: Colors.green, size: 64),
            content: const Text('Payment Successful!\nPlease collect your receipt.', textAlign: TextAlign.center, style: TextStyle(fontSize: 24)),
            actions: [
              Center(
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context); // close success dialog
                    setState(() {
                      _cart.clear();
                      _searchController.clear();
                      _paymentMode = 'UPI';
                    });
                  },
                  child: const Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Text('Done', style: TextStyle(fontSize: 20)),
                  ),
                ),
              )
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Payment Failed: $e'), backgroundColor: Colors.red));
      }
    }
  }

  Future<void> _showExitDialog() async {
    final TextEditingController passwordController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Exit Kiosk Mode'),
        content: TextField(
          controller: passwordController,
          obscureText: true,
          decoration: const InputDecoration(labelText: 'Admin Password'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              // Very basic security for exiting kiosk mode
              if (passwordController.text == 'admin123') { // Hardcoded for demo
                Navigator.pop(context); // close dialog
                Navigator.pop(context); // close screen
              } else {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Incorrect password')));
              }
            },
            child: const Text('Exit'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final double total = _cart.fold(0, (sum, item) => sum + (item['price'] * item['quantity']));

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text('Self Checkout Kiosk', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
        centerTitle: true,
        automaticallyImplyLeading: false, // Hide back button for Kiosk mode
        actions: [
          IconButton(icon: const Icon(Icons.exit_to_app), onPressed: _showExitDialog),
        ],
      ),
      body: Row(
        children: [
          // Left side: Products / Scanner
          Expanded(
            flex: 2,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Scan Barcode or Search:', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _searchController,
                    focusNode: _searchFocus,
                    autofocus: true,
                    style: const TextStyle(fontSize: 24),
                    decoration: InputDecoration(
                      hintText: 'Search by Name or Barcode...',
                      prefixIcon: const Icon(Icons.search, size: 32),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                      filled: true,
                      fillColor: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: GridView.builder(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 3,
                        childAspectRatio: 0.8,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                      ),
                      itemCount: _filteredProducts.length,
                      itemBuilder: (context, index) {
                        final product = _filteredProducts[index];
                        return Card(
                          elevation: 2,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          child: InkWell(
                            onTap: () => _addToCart(product),
                            borderRadius: BorderRadius.circular(16),
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.inventory, size: 48, color: AppTheme.primaryColor),
                                  const SizedBox(height: 16),
                                  Text(
                                    product.name,
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 8),
                                  Text('₹${product.price.toStringAsFixed(2)}', style: const TextStyle(fontSize: 20, color: Colors.green, fontWeight: FontWeight.w600)),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Right side: Cart and Payment
          Expanded(
            flex: 1,
            child: Container(
              color: Colors.white,
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(24),
                    color: AppTheme.primaryColor,
                    width: double.infinity,
                    child: const Text('Your Cart', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
                  ),
                  Expanded(
                    child: _cart.isEmpty
                        ? const Center(child: Text('Scan items to begin', style: TextStyle(fontSize: 20, color: Colors.grey)))
                        : ListView.builder(
                            itemCount: _cart.length,
                            itemBuilder: (context, index) {
                              final item = _cart[index];
                              final product = item['product'] as Product;
                              return ListTile(
                                title: Text(product.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                subtitle: Text('₹${item['price']} x ${item['quantity']}'),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.remove_circle_outline, size: 32),
                                      onPressed: () => _updateQuantity(index, -1),
                                    ),
                                    Text('${item['quantity']}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                                    IconButton(
                                      icon: const Icon(Icons.add_circle_outline, size: 32),
                                      onPressed: () => _updateQuantity(index, 1),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                  ),
                  const Divider(thickness: 2),
                  Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Total to Pay:', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                            Text('₹${total.toStringAsFixed(2)}', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.green)),
                          ],
                        ),
                        const SizedBox(height: 24),
                        const Text('Select Payment Method', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            ChoiceChip(
                              label: const Padding(
                                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                child: Text('UPI', style: TextStyle(fontSize: 20)),
                              ),
                              selected: _paymentMode == 'UPI',
                              onSelected: (v) => setState(() => _paymentMode = 'UPI'),
                            ),
                            ChoiceChip(
                              label: const Padding(
                                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                child: Text('Card', style: TextStyle(fontSize: 20)),
                              ),
                              selected: _paymentMode == 'CARD',
                              onSelected: (v) => setState(() => _paymentMode = 'CARD'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 32),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            padding: const EdgeInsets.symmetric(vertical: 24),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          onPressed: _cart.isEmpty ? null : _processPayment,
                          child: const Text('PAY NOW', style: TextStyle(fontSize: 28, color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
