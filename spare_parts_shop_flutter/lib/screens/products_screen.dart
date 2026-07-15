import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/product.dart';
import 'package:file_picker/file_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'dart:io';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'barcode_scanner_screen.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  final ApiService _apiService = ApiService();
  List<Product> _products = [];
  bool _isLoading = true;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadProducts() async {
    try {
      final products = await _apiService.getProducts();
      setState(() {
        _products = products;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load products: $e')),
        );
      }
    }
  }

  Future<void> _searchProducts(String query) async {
    if (query.trim().isEmpty) {
      _loadProducts();
      return;
    }
    setState(() => _isLoading = true);
    try {
      final results = await _apiService.searchProducts(query);
      setState(() {
        _products = results;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Search failed: $e')),
        );
      }
    }
  }

  Future<void> _exportExcel() async {
    try {
      final data = await _apiService.exportExcel();
      final directory = await getApplicationDocumentsDirectory();
      final file = File('${directory.path}/Products_Export_${DateTime.now().millisecondsSinceEpoch}.csv'); // or xlsx
      await file.writeAsString(data);
      if (mounted) {
        await Share.shareXFiles([XFile(file.path)], text: 'Products Export');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Export failed: $e')));
      }
    }
  }

  Future<void> _uploadExcel() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['xls', 'xlsx', 'csv'],
      );
      if (result != null) {
        final path = result.files.single.path;
        if (path != null) {
          await _apiService.uploadExcel(XFile(path));
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Upload successful')));
          }
          _loadProducts();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Upload failed: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Products'),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            onPressed: () async {
              final barcode = await Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const BarcodeScannerScreen()),
              );
              if (barcode != null && mounted) {
                // Find product by barcode (partNumber) or open create dialog
                final existingProduct = _products.where((p) => p.partNumber == barcode || p.id.toString() == barcode).firstOrNull;
                if (existingProduct != null) {
                  _showProductDialog(product: existingProduct);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Scanned: $barcode. No product found.')));
                }
              }
            },
            tooltip: 'Scan Barcode',
          ),
          IconButton(
            icon: const Icon(Icons.upload_file),
            onPressed: _uploadExcel,
            tooltip: 'Upload Excel',
          ),
          IconButton(
            icon: const Icon(Icons.download),
            onPressed: _exportExcel,
            tooltip: 'Export Excel',
          ),
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showProductDialog(),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                labelText: 'Search Products',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _loadProducts();
                        },
                      )
                    : null,
                border: const OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(10))),
              ),
              onChanged: _searchProducts,
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _products.isEmpty
                    ? const Center(child: Text('No products found'))
                    : ListView.builder(
                        itemCount: _products.length,
                        itemBuilder: (context, index) {
                          final product = _products[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                            child: ListTile(
                              title: Text(product.name),
                              subtitle: Text('Part: ${product.partNumber} | Stock: ${product.quantity}'),
                              trailing: FittedBox(
                                fit: BoxFit.scaleDown,
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      '₹${product.price.toStringAsFixed(2)}',
                                      style: const TextStyle(fontWeight: FontWeight.bold),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.edit),
                                      onPressed: () => _showProductDialog(product: product),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.delete, color: Colors.red),
                                      onPressed: () => _deleteProduct(product),
                                    ),
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
    );
  }

  Future<void> _showProductDialog({Product? product}) async {
    final nameController = TextEditingController(text: product?.name ?? '');
    final partNumberController = TextEditingController(text: product?.partNumber ?? '');
    final costPriceController = TextEditingController(text: product?.costPrice.toString() ?? '');
    final priceController = TextEditingController(text: product?.price.toString() ?? '');
    final gstPercentController = TextEditingController(text: product?.gstPercent.toString() ?? '');
    final quantityController = TextEditingController(text: product?.quantity.toString() ?? '');
    final lowStockThresholdController = TextEditingController(text: product?.lowStockThreshold.toString() ?? '');
    final warrantyDaysController = TextEditingController(text: product?.warrantyDays?.toString() ?? '');

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final config = authProvider.activeAccount?.configuration;
    final modules = config != null && config['modules'] != null ? config['modules'] as List<dynamic> : [];
    final bool warrantyEnabled = modules.any((m) => m['key'] == 'warranty' && m['enabled'] == true);
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(product == null ? 'Add Product' : 'Edit Product'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'Name'),
              ),
              TextField(
                controller: partNumberController,
                decoration: const InputDecoration(labelText: 'Part Number'),
              ),
              TextField(
                controller: costPriceController,
                decoration: const InputDecoration(labelText: 'Cost Price'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: priceController,
                decoration: const InputDecoration(labelText: 'Selling Price'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: gstPercentController,
                decoration: const InputDecoration(labelText: 'GST Percent'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: quantityController,
                decoration: const InputDecoration(labelText: 'Quantity'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: lowStockThresholdController,
                decoration: const InputDecoration(labelText: 'Low Stock Threshold'),
                keyboardType: TextInputType.number,
              ),
              if (warrantyEnabled)
                TextField(
                  controller: warrantyDaysController,
                  decoration: const InputDecoration(labelText: 'Warranty Days (0 for none)'),
                  keyboardType: TextInputType.number,
                ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                if (product == null) {
                  await _apiService.createProduct(
                    Product(
                      id: 0,
                      name: nameController.text,
                      partNumber: partNumberController.text,
                      costPrice: double.tryParse(costPriceController.text) ?? 0,
                      price: double.tryParse(priceController.text) ?? 0.0,
                      gstPercent: double.tryParse(gstPercentController.text) ?? 0.0,
                      quantity: int.tryParse(quantityController.text) ?? 0,
                      lowStockThreshold: int.tryParse(lowStockThresholdController.text) ?? 10,
                      warrantyDays: (warrantyEnabled && warrantyDaysController.text.isNotEmpty)
                          ? (int.tryParse(warrantyDaysController.text) ?? 0)
                          : null,
                    ),
                  );
                } else {
                  await _apiService.updateProduct(
                    product.id,
                    Product(
                      id: product.id,
                      name: nameController.text,
                      partNumber: partNumberController.text,
                      costPrice: double.tryParse(costPriceController.text) ?? 0,
                      price: double.tryParse(priceController.text) ?? 0.0,
                      gstPercent: double.tryParse(gstPercentController.text) ?? 0.0,
                      quantity: int.tryParse(quantityController.text) ?? 0,
                      lowStockThreshold: int.tryParse(lowStockThresholdController.text) ?? 10,
                      warrantyDays: (warrantyEnabled && warrantyDaysController.text.isNotEmpty)
                          ? (int.tryParse(warrantyDaysController.text) ?? 0)
                          : null,
                    ),
                  );
                }
                if (mounted) {
                  Navigator.pop(context);
                  _loadProducts();
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Failed to save product: $e')),
                  );
                }
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteProduct(Product product) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Product'),
        content: Text('Are you sure you want to delete ${product.name}?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirm == true) {
      setState(() => _isLoading = true);
      try {
        await _apiService.deleteProduct(product.id);
        _loadProducts();
      } catch (e) {
        setState(() => _isLoading = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to delete product: $e')),
          );
        }
      }
    }
  } }

