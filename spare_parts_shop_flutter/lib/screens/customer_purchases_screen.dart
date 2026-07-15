import 'package:flutter/material.dart';
import 'package:stock_pilot/services/api_service.dart';
import 'customer_invoice_detail_screen.dart';

class CustomerPurchasesScreen extends StatefulWidget {
  const CustomerPurchasesScreen({super.key});

  @override
  State<CustomerPurchasesScreen> createState() => _CustomerPurchasesScreenState();
}

class _CustomerPurchasesScreenState extends State<CustomerPurchasesScreen> {
  bool _isLoading = true;
  List<dynamic> _purchases = [];

  @override
  void initState() {
    super.initState();
    _fetchPurchases();
  }

  Future<void> _fetchPurchases() async {
    try {
      final response = await ApiService().get('/api/customer-portal/purchases');
      if (mounted) {
        setState(() {
          _purchases = response;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load purchases: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('My Purchases', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black87)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _purchases.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey[400]),
                      const SizedBox(height: 16),
                      Text('No purchases found', style: TextStyle(fontSize: 18, color: Colors.grey[600], fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text('You haven\'t made any purchases yet.', style: TextStyle(color: Colors.grey[500])),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _purchases.length,
                  itemBuilder: (context, index) {
                    final bill = _purchases[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 0,
                      child: InkWell(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => CustomerInvoiceDetailScreen(billId: bill['id']),
                            ),
                          );
                        },
                        borderRadius: BorderRadius.circular(16),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(bill['billNumber'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  Text('₹${bill['finalAmount'] ?? 0}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF2563EB))),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(Icons.calendar_today, size: 14, color: Colors.grey[500]),
                                  const SizedBox(width: 4),
                                  Text(bill['billDate'] != null ? bill['billDate'].toString().split('T')[0] : '', style: TextStyle(color: Colors.grey[500], fontSize: 13)),
                                  const Spacer(),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.green[50],
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(bill['paymentMode'] ?? 'Paid', style: TextStyle(color: Colors.green[700], fontSize: 11, fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.grey[50],
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Items', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.grey)),
                                    const SizedBox(height: 8),
                                    if (bill['items'] != null)
                                      ...(bill['items'] as List).take(2).map((item) {
                                        return Padding(
                                          padding: const EdgeInsets.only(bottom: 4),
                                          child: Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Expanded(child: Text('${item['quantity']}x ${item['product']?['name'] ?? 'Unknown'}', style: TextStyle(fontSize: 13, color: Colors.grey[800]), maxLines: 1, overflow: TextOverflow.ellipsis)),
                                              Text('₹${(item['price'] * item['quantity'])}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                                            ],
                                          ),
                                        );
                                      }).toList(),
                                    if (bill['items'] != null && (bill['items'] as List).length > 2)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 4),
                                        child: Text('+ ${(bill['items'] as List).length - 2} more items', style: const TextStyle(fontSize: 12, color: Colors.blue)),
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
