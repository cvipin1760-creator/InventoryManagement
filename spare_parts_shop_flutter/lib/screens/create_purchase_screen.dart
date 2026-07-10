import 'dart:async';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import '../services/api_service.dart';
import '../models/supplier.dart';
import '../models/product.dart';
import '../constants/app_theme.dart';
import 'package:intl/intl.dart';

class CreatePurchaseScreen extends StatefulWidget {
  const CreatePurchaseScreen({super.key});

  @override
  State<CreatePurchaseScreen> createState() => _CreatePurchaseScreenState();
}

class _CreatePurchaseScreenState extends State<CreatePurchaseScreen> {
  final ApiService _apiService = ApiService();
  final List<Supplier> _suppliers = [];
  final List<Product> _searchResults = [];
  Supplier? _selectedSupplier;
  String _gstType = 'EXCLUDED';
  double _discount = 0;
  final List<PurchaseItem> _items = [];
  bool _isLoading = true;
  bool _isSearching = false;
  bool _isSubmitting = false;
  bool _isUploading = false;
  String _error = '';
  String _searchQuery = '';
  Timer? _debounceTimer;
  XFile? _attachmentImage;
  PlatformFile? _attachmentFile;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    try {
      final suppliers = await _apiService.getSuppliers();
      setState(() {
        _suppliers.clear();
        _suppliers.addAll(suppliers);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load data: $e';
        _isLoading = false;
      });
    }
  }

  void _onSearchChanged(String query) {
    _searchQuery = query;
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 300), () {
      _searchProducts(query);
    });
  }

  Future<void> _searchProducts(String query) async {
    if (query.isEmpty) {
      setState(() {
        _searchResults.clear();
      });
      return;
    }
    setState(() {
      _isSearching = true;
    });
    try {
      final products = await _apiService.searchProducts(query);
      setState(() {
        _searchResults.clear();
        _searchResults.addAll(products);
        _isSearching = false;
      });
    } catch (e) {
      setState(() {
        _isSearching = false;
        _error = 'Failed to search products: $e';
      });
    }
  }

  void _addItem(Product product) {
    setState(() {
      _items.add(PurchaseItem(
        productId: product.id,
        product: product,
        quantity: 1,
        price: product.price,
        gstPercent: product.gstPercent,
        discount: 0,
      ));
      _searchQuery = '';
      _searchResults.clear();
    });
  }

  void _removeItem(int index) {
    setState(() {
      _items.removeAt(index);
    });
  }

  void _updateItem(int index, String field, dynamic value) {
    setState(() {
      final item = _items[index];
      switch (field) {
        case 'quantity':
          item.quantity = value;
          break;
        case 'price':
          item.price = value;
          break;
        case 'gstPercent':
          item.gstPercent = value;
          break;
        case 'discount':
          item.discount = value;
          break;
      }
    });
  }

  Future<void> _pickAttachment() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
    );
    if (result != null) {
      setState(() {
        _attachmentFile = result.files.first;
        _attachmentImage = null;
      });
    }
  }

  Future<void> _takePhoto() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.camera);
    if (image != null) {
      setState(() {
        _attachmentImage = image;
        _attachmentFile = null;
      });
    }
  }

  double get _subtotal {
    return _items.fold(0, (sum, item) => sum + (item.price * item.quantity - item.discount));
  }

  double get _gstAmount {
    return _items.fold(0, (sum, item) {
      final lineTotal = item.price * item.quantity - item.discount;
      if (_gstType == 'INCLUDED') {
        final rate = item.gstPercent / 100;
        return sum + (lineTotal * rate) / (1 + rate);
      }
      return sum + lineTotal * (item.gstPercent / 100);
    });
  }

  double get _finalAmount {
    if (_gstType == 'INCLUDED') {
      return _subtotal - _discount;
    }
    return _subtotal + _gstAmount - _discount;
  }

  Future<void> _submitPurchase() async {
    if (_selectedSupplier == null || _items.isEmpty) {
      setState(() {
        _error = 'Please select a supplier and add at least one item';
      });
      return;
    }

    setState(() {
      _isSubmitting = true;
      _isUploading = (_attachmentFile != null || _attachmentImage != null);
      _error = '';
    });

    try {
      String? attachmentPath;
      if (_attachmentFile != null) {
        attachmentPath = await _apiService.uploadBillAttachment(_attachmentFile!);
      } else if (_attachmentImage != null) {
        attachmentPath = await _apiService.uploadBillAttachment(_attachmentImage!);
      }

      final purchaseItems = _items.map((item) => {
        'productId': item.productId,
        'quantity': item.quantity,
        'price': item.price,
        'gstPercent': item.gstPercent,
        'discount': item.discount,
      }).toList();

      await _apiService.createPurchase({
        'supplierId': _selectedSupplier!.id,
        'items': purchaseItems,
        'discount': _discount,
        'gstType': _gstType,
        'attachmentPath': attachmentPath,
      });

      if (!mounted) return;
      Navigator.of(context).pop();
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to create purchase: $e';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
          _isUploading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: const Text('New Purchase', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor))
          : _error.isNotEmpty
              ? Center(child: Text(_error, style: const TextStyle(color: Colors.red)))
              : _buildForm(),
    );
  }

  Widget _buildForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (_error.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red[100],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.red[300]!),
              ),
              child: Text(_error, style: TextStyle(color: Colors.red[700])),
            ),
          if (_error.isNotEmpty) const SizedBox(height: 16),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                DropdownButtonFormField<Supplier>(
                  value: _selectedSupplier,
                  decoration: InputDecoration(
                    labelText: 'Select Supplier',
                    labelStyle: TextStyle(color: Colors.grey[700]),
                    filled: true,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey[300]!),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppTheme.primaryColor, width: 2),
                    ),
                  ),
                  items: _suppliers.map((supplier) => DropdownMenuItem(
                    value: supplier,
                    child: Text('${supplier.name} - ${supplier.phone}'),
                  )).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedSupplier = value;
                    });
                  },
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _gstType,
                        decoration: InputDecoration(
                          labelText: 'GST Type',
                          labelStyle: TextStyle(color: Colors.grey[700]),
                          filled: true,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: AppTheme.primaryColor, width: 2),
                          ),
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
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        initialValue: _discount.toString(),
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        decoration: InputDecoration(
                          labelText: 'Purchase Discount (₹)',
                          labelStyle: TextStyle(color: Colors.grey[700]),
                          filled: true,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: AppTheme.primaryColor, width: 2),
                          ),
                        ),
                        onChanged: (value) {
                          setState(() {
                            _discount = double.tryParse(value) ?? 0;
                          });
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.inputBackgroundColor,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[300]!),
                  ),
                  child: Column(
                    children: [
                      const Text('Purchase Bill Attachment', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          ElevatedButton.icon(
                            onPressed: _pickAttachment,
                            icon: const Icon(Icons.attach_file),
                            label: const Text('Choose File'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                              foregroundColor: AppTheme.primaryColor,
                            ),
                          ),
                          const SizedBox(width: 8),
                          ElevatedButton.icon(
                            onPressed: _takePhoto,
                            icon: const Icon(Icons.camera_alt),
                            label: const Text('Take Photo'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.successColor.withOpacity(0.1),
                              foregroundColor: AppTheme.successColor,
                            ),
                          ),
                        ],
                      ),
                      if (_attachmentFile != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text('Selected: ${_attachmentFile!.name}', style: TextStyle(color: Colors.grey[600])),
                        ),
                      if (_attachmentImage != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text('Selected: ${_attachmentImage!.name}', style: TextStyle(color: Colors.grey[600])),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Purchase Items',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                TextField(
                  onChanged: _onSearchChanged,
                  decoration: InputDecoration(
                    hintText: 'Search product to add...',
                    prefixIcon: const Icon(Icons.search, color: Colors.grey),
                    suffixIcon: _isSearching
                        ? const Padding(
                            padding: EdgeInsets.all(12),
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : null,
                    filled: true,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey[300]!),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppTheme.primaryColor, width: 2),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                if (_searchResults.isNotEmpty)
                  Container(
                    constraints: const BoxConstraints(maxHeight: 200),
                    decoration: BoxDecoration(
                      color: Theme.of(context).cardColor,
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                    child: ListView.builder(
                      shrinkWrap: true,
                      itemCount: _searchResults.length,
                      itemBuilder: (context, index) {
                        final product = _searchResults[index];
                        return ListTile(
                          title: Text(product.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text(product.partNumber ?? ''),
                          trailing: Text(
                            '₹${product.price.toStringAsFixed(2)}',
                            style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold),
                          ),
                          onTap: () => _addItem(product),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        );
                      },
                    ),
                  ),
                const SizedBox(height: 16),
                if (_items.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Text(
                        'Search products above to add to purchase',
                        style: TextStyle(color: Colors.grey[500]),
                      ),
                    ),
                  )
                else
                  ..._items.asMap().entries.map((entry) {
                    final index = entry.key;
                    final item = entry.value;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.inputBackgroundColor,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.product.name,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          if (item.product.partNumber != null)
                            Text(
                              item.product.partNumber!,
                              style: TextStyle(color: Colors.grey[600], fontSize: 12),
                            ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Qty', style: TextStyle(fontSize: 12, color: Colors.grey)),
                                    TextFormField(
                                      initialValue: item.quantity.toString(),
                                      keyboardType: TextInputType.number,
                                      decoration: const InputDecoration(
                                        border: OutlineInputBorder(),
                                        contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      ),
                                      onChanged: (val) {
                                        _updateItem(index, 'quantity', int.tryParse(val) ?? 1);
                                      },
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Cost Price', style: TextStyle(fontSize: 12, color: Colors.grey)),
                                    TextFormField(
                                      initialValue: item.price.toStringAsFixed(2),
                                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                      decoration: const InputDecoration(
                                        border: OutlineInputBorder(),
                                        contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      ),
                                      onChanged: (val) {
                                        _updateItem(index, 'price', double.tryParse(val) ?? item.price);
                                      },
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('GST %', style: TextStyle(fontSize: 12, color: Colors.grey)),
                                    TextFormField(
                                      initialValue: item.gstPercent.toStringAsFixed(1),
                                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                      decoration: const InputDecoration(
                                        border: OutlineInputBorder(),
                                        contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      ),
                                      onChanged: (val) {
                                        _updateItem(index, 'gstPercent', double.tryParse(val) ?? item.gstPercent);
                                      },
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Discount', style: TextStyle(fontSize: 12, color: Colors.grey)),
                                    TextFormField(
                                      initialValue: item.discount.toStringAsFixed(2),
                                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                      decoration: const InputDecoration(
                                        border: OutlineInputBorder(),
                                        contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      ),
                                      onChanged: (val) {
                                        _updateItem(index, 'discount', double.tryParse(val) ?? 0);
                                      },
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete, color: Colors.red),
                                onPressed: () => _removeItem(index),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  }).toList(),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                _buildSummaryRow('Subtotal', '₹${_subtotal.toStringAsFixed(2)}'),
                const SizedBox(height: 8),
                _buildSummaryRow('GST', '₹${_gstAmount.toStringAsFixed(2)}'),
                const SizedBox(height: 8),
                _buildSummaryRow('Discount', '₹${_discount.toStringAsFixed(2)}'),
                const Divider(height: 24, thickness: 2),
                _buildSummaryRow('Total Cost', '₹${_finalAmount.toStringAsFixed(2)}', isTotal: true),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: Colors.grey[300],
                    foregroundColor: Colors.grey[700],
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Cancel', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitPurchase,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Complete Purchase', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isTotal ? 18 : 15,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.w500,
            color: isTotal ? AppTheme.primaryColor : Colors.grey[700],
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isTotal ? 18 : 15,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.w500,
            color: isTotal ? AppTheme.primaryColor : Colors.grey[700],
          ),
        ),
      ],
    );
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
