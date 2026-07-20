import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:barcode_widget/barcode_widget.dart';
import '../services/api_service.dart';
import '../services/blue_thermal_printer_service.dart';
import '../models/product.dart';

class BarcodePrintScreen extends StatefulWidget {
  const BarcodePrintScreen({Key? key}) : super(key: key);

  @override
  State<BarcodePrintScreen> createState() => _BarcodePrintScreenState();
}

class _BarcodePrintScreenState extends State<BarcodePrintScreen> {
  Product? _selectedProduct;
  int _copies = 1;
  bool _isLoading = false;
  final BluetoothPrinterService _printerService = BluetoothPrinterService();
  
  List<Product> _products = [];

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() => _isLoading = true);
    try {
      final api = context.read<ApiService>();
      final res = await api.get('/products');
      if (res != null && res is Map && res.containsKey('content')) {
        setState(() {
          _products = (res['content'] as List).map((p) => Product.fromJson(p)).toList();
        });
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _print() async {
    if (_selectedProduct == null) return;
    
    // Check if barcode exists
    String barcodeStr = _selectedProduct!.barcode ?? _selectedProduct!.sku ?? '';
    if (barcodeStr.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Product has no Barcode or SKU to print.')));
      return;
    }

    setState(() => _isLoading = true);
    try {
      // Connect to printer if not connected
      // For demo we assume the user has to select device.
      // We will just call the service. If it fails, we show error.
      await _printerService.printBarcodeLabel(
        businessName: 'My Store', // In real app, fetch from auth context
        productName: _selectedProduct!.name,
        sku: _selectedProduct!.sku ?? '',
        barcode: barcodeStr,
        price: _selectedProduct!.price,
        copies: _copies,
      );

      // Record print history
      final api = context.read<ApiService>();
      await api.recordBarcodePrint(_selectedProduct!.id, _copies, 'Default Label');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Printed successfully!')));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Print Error: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Print Barcode')),
      body: _isLoading && _products.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  DropdownButtonFormField<Product>(
                    decoration: const InputDecoration(labelText: 'Select Product'),
                    value: _selectedProduct,
                    items: _products.map((p) {
                      return DropdownMenuItem(value: p, child: Text(p.name));
                    }).toList(),
                    onChanged: (val) {
                      setState(() {
                        _selectedProduct = val;
                      });
                    },
                  ),
                  const SizedBox(height: 16),
                  if (_selectedProduct != null) ...[
                    TextFormField(
                      decoration: const InputDecoration(labelText: 'Copies'),
                      initialValue: _copies.toString(),
                      keyboardType: TextInputType.number,
                      onChanged: (val) {
                        setState(() {
                          _copies = int.tryParse(val) ?? 1;
                        });
                      },
                    ),
                    const SizedBox(height: 32),
                    const Text('Label Preview', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    Center(
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey),
                          color: Colors.white,
                        ),
                        width: 250,
                        child: Column(
                          children: [
                            Text(_selectedProduct!.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            Text('Price: \$${_selectedProduct!.price.toStringAsFixed(2)}'),
                            const SizedBox(height: 8),
                            if (_selectedProduct!.barcode != null && _selectedProduct!.barcode!.isNotEmpty)
                              BarcodeWidget(
                                barcode: Barcode.code128(),
                                data: _selectedProduct!.barcode!,
                                width: 200,
                                height: 80,
                              )
                            else if (_selectedProduct!.sku != null && _selectedProduct!.sku!.isNotEmpty)
                              QrImageView(
                                data: _selectedProduct!.sku!,
                                size: 100,
                              )
                            else
                              const Text('No Barcode/SKU available'),
                          ],
                        ),
                      ),
                    ),
                    const Spacer(),
                    ElevatedButton.icon(
                      onPressed: _isLoading ? null : _print,
                      icon: _isLoading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white)) : const Icon(Icons.print),
                      label: const Text('Print Now'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ]
                ],
              ),
            ),
    );
  }
}
