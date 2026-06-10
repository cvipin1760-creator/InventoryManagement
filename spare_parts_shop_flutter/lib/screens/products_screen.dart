import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/product.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  final ApiService _apiService = ApiService();
  List<Product> _products = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadProducts();
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Products'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showProductDialog(),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _products.isEmpty
              ? const Center(child: Text('No products found'))
              : ListView.builder(
                  itemCount: _products.length,
                  itemBuilder: (context, index) {
                    final product = _products[index];
                    return ListTile(
                      title: Text(product.name),
                      subtitle: Text('Part: ${product.partNumber} | Stock: ${product.quantity}'),
                      trailing: Row(
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
                            onPressed: () => _deleteProduct(product.id),
                          ),
                        ],
                      ),
                    );
                  },
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
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              try {
                if (product == null) {
                  await _apiService.createProduct(
                    Product(
                      id: 0,
                      name: nameController.text,
                      partNumber: partNumberController.text,
                      costPrice: double.tryParse(costPriceController.text) ?? 0,
                      price: double.tryParse(priceController.text) ?? 0,
                      gstPercent: double.tryParse(gstPercentController.text) ?? 0,
                      quantity: int.tryParse(quantityController.text) ?? 0,
                      lowStockThreshold: int.tryParse(lowStockThresholdController.text) ?? 0,
                      createdAt: DateTime.now().toIso8601String(),
                      updatedAt: DateTime.now().toIso8601String(),
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
                      price: double.tryParse(priceController.text) ?? 0,
                      gstPercent: double.tryParse(gstPercentController.text) ?? 0,
                      quantity: int.tryParse(quantityController.text) ?? 0,
                      lowStockThreshold: int.tryParse(lowStockThresholdController.text) ?? 0,
                      createdAt: product.createdAt,
                      updatedAt: DateTime.now().toIso8601String(),
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

  Future<void> _deleteProduct(int id) async {
    try {
      await _apiService.deleteProduct(id);
      _loadProducts();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to delete product: $e')),
        );
      }
    }
  }
}
