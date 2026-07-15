import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:stock_pilot/services/api_service.dart';

class CustomerInvoiceDetailScreen extends StatefulWidget {
  final int billId;
  const CustomerInvoiceDetailScreen({super.key, required this.billId});

  @override
  State<CustomerInvoiceDetailScreen> createState() => _CustomerInvoiceDetailScreenState();
}

class _CustomerInvoiceDetailScreenState extends State<CustomerInvoiceDetailScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _bill;

  @override
  void initState() {
    super.initState();
    _fetchBillDetails();
  }

  Future<void> _fetchBillDetails() async {
    try {
      final response = await ApiService().get('/api/customer-portal/purchases/${widget.billId}');
      if (mounted) {
        setState(() {
          _bill = response;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load invoice: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(backgroundColor: Colors.white, elevation: 0),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_bill == null) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(title: const Text('Invoice Details', style: TextStyle(color: Colors.black)), backgroundColor: Colors.white, elevation: 0, iconTheme: const IconThemeData(color: Colors.black)),
        body: const Center(child: Text('Invoice not found')),
      );
    }

    final billNumber = _bill!['billNumber'] ?? 'Unknown';
    final billDate = _bill!['billDate'] != null ? _bill!['billDate'].toString().split('T')[0] : '';
    final businessName = _bill!['business']?['name'] ?? 'StockPilot Business';
    final customerName = _bill!['customer']?['name'] ?? 'Customer';
    final paymentMode = _bill!['paymentMode'] ?? 'Cash';
    final items = _bill!['items'] as List? ?? [];
    
    // QR Code data
    final qrData = 'https://stockpilot.app/verify/$billNumber';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Invoice Details', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black87)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
        actions: [
          IconButton(icon: const Icon(Icons.download), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey[200]!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Header
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(businessName, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text('Tax Invoice', style: TextStyle(color: Colors.grey[500], fontSize: 14)),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(billNumber, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            const SizedBox(height: 4),
                            Text(billDate, style: TextStyle(color: Colors.grey[600], fontSize: 14)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  
                  const Divider(height: 1, thickness: 1),
                  
                  // Billed To
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('BILLED TO', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey[500])),
                        const SizedBox(height: 8),
                        Text(customerName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        if (_bill!['customer']?['phone'] != null)
                          Text(_bill!['customer']!['phone'], style: TextStyle(color: Colors.grey[600], fontSize: 14)),
                      ],
                    ),
                  ),

                  // Items Table Header
                  Container(
                    color: Colors.grey[50],
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    child: Row(
                      children: [
                        Expanded(flex: 3, child: Text('ITEM', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey[500]))),
                        Expanded(flex: 1, child: Text('QTY', textAlign: TextAlign.right, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey[500]))),
                        Expanded(flex: 2, child: Text('PRICE', textAlign: TextAlign.right, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey[500]))),
                        Expanded(flex: 2, child: Text('TOTAL', textAlign: TextAlign.right, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey[500]))),
                      ],
                    ),
                  ),

                  // Items List
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: items.length,
                    itemBuilder: (context, index) {
                      final item = items[index];
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        child: Row(
                          children: [
                            Expanded(
                              flex: 3,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(item['product']?['name'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                  if (item['product']?['partNumber'] != null)
                                    Text('Part: ${item['product']!['partNumber']}', style: TextStyle(color: Colors.grey[500], fontSize: 11)),
                                ],
                              ),
                            ),
                            Expanded(flex: 1, child: Text('${item['quantity']}', textAlign: TextAlign.right, style: TextStyle(color: Colors.grey[600], fontSize: 13))),
                            Expanded(flex: 2, child: Text('₹${item['price']}', textAlign: TextAlign.right, style: TextStyle(color: Colors.grey[600], fontSize: 13))),
                            Expanded(flex: 2, child: Text('₹${(item['price'] * item['quantity'])}', textAlign: TextAlign.right, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13))),
                          ],
                        ),
                      );
                    },
                  ),
                  
                  const Divider(height: 1, thickness: 1),

                  // Totals
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Subtotal', style: TextStyle(color: Colors.grey[600])),
                            Text('₹${_bill!['totalAmount'] ?? 0}', style: const TextStyle(fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Discount', style: TextStyle(color: Colors.grey[600])),
                            Text('-₹${_bill!['discount'] ?? 0}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
                          ],
                        ),
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 12),
                          child: Divider(height: 1, thickness: 1),
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Total Amount', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            Text('₹${_bill!['finalAmount'] ?? 0}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: Color(0xFF2563EB))),
                          ],
                        ),
                      ],
                    ),
                  ),
                  
                  // Footer with QR
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.grey[50],
                      borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(16), bottomRight: Radius.circular(16)),
                    ),
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.grey[300]!),
                              ),
                              child: QrImageView(
                                data: qrData,
                                version: QrVersions.auto,
                                size: 60.0,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Row(
                                  children: [
                                    Icon(Icons.verified, color: Colors.green, size: 16),
                                    SizedBox(width: 4),
                                    Text('Verified', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                  ],
                                ),
                                Text('Scan to verify', style: TextStyle(color: Colors.grey[500], fontSize: 11)),
                              ],
                            ),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text('Payment Mode', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                            const SizedBox(height: 4),
                            Text(paymentMode, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          ],
                        )
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
