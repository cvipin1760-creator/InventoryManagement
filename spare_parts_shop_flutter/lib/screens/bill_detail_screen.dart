import 'package:flutter/material.dart';
import '../models/bill.dart';
import '../constants/app_theme.dart';
import '../services/api_service.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';

class BillDetailScreen extends StatelessWidget {
  final Bill bill;
  final ApiService _apiService = ApiService();

  BillDetailScreen({super.key, required this.bill});

  Future<void> _sendBillToWhatsApp(BuildContext context) async {
    String message = "Hello ${bill.customer.name},\n\n";
    message += "Your Bill: ${bill.invoiceNumber}\n";
    message += "Date: ${DateFormat.yMMMMd().format(DateTime.parse(bill.billDate))}\n";
    message += "------------------------\n";
    for (var item in bill.items) {
      message += "${item.product.name} x ${item.quantity} = ₹${(item.price * item.quantity).toStringAsFixed(2)}\n";
    }
    message += "------------------------\n";
    message += "Gross Total: ₹${bill.subtotal.toStringAsFixed(2)}\n";
    message += "Discount: -₹${bill.discount.toStringAsFixed(2)}\n";
    message += "GST (${bill.gstType}): ₹${bill.gstAmount.toStringAsFixed(2)}\n";
    message += "Grand Total: ₹${bill.finalAmount.toStringAsFixed(2)}\n";
    message += "\nThank you for your business!";

    final phone = bill.customer.phone.replaceAll(RegExp(r'[^0-9]'), '');
    final url = "https://wa.me/$phone?text=${Uri.encodeComponent(message)}";
    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('WhatsApp not installed or cannot be opened')),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error opening WhatsApp: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: Text(bill.invoiceNumber),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.download),
            onPressed: () {
              _apiService.downloadInvoicePdf(bill.id);
            },
            tooltip: 'Download Invoice',
          ),
          IconButton(
            icon: const Icon(Icons.send),
            onPressed: () => _sendBillToWhatsApp(context),
            tooltip: 'Send via WhatsApp',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Bill Details',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildDetailRow('Invoice Number', bill.invoiceNumber),
                    _buildDetailRow('Date', DateFormat.yMMMMd().format(DateTime.parse(bill.billDate))),
                    const SizedBox(height: 12),
                    const Divider(),
                    const SizedBox(height: 12),
                    const Text(
                      'Customer',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildDetailRow('Name', bill.customer.name),
                    _buildDetailRow('Phone', bill.customer.phone),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Items',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ...bill.items.map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        children: [
                          Expanded(
                            flex: 3,
                            child: Text(
                              item.product.name,
                              style: const TextStyle(fontWeight: FontWeight.w500),
                            ),
                          ),
                          Expanded(
                            flex: 1,
                            child: Text(
                              'x${item.quantity}',
                              textAlign: TextAlign.center,
                            ),
                          ),
                          Expanded(
                            flex: 2,
                            child: Text(
                              '₹${(item.price * item.quantity).toStringAsFixed(2)}',
                              textAlign: TextAlign.end,
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    )),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            Card(
              elevation: 0,
              color: AppTheme.primaryColor.withOpacity(0.08),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    _buildSummaryRow('Subtotal', '₹${bill.subtotal.toStringAsFixed(2)}'),
                    const SizedBox(height: 8),
                    _buildSummaryRow('Discount', '-₹${bill.discount.toStringAsFixed(2)}'),
                    const SizedBox(height: 8),
                    _buildSummaryRow('GST (${bill.gstType})', '₹${bill.gstAmount.toStringAsFixed(2)}'),
                    const Divider(height: 24),
                    _buildSummaryRow('Grand Total', '₹${bill.finalAmount.toStringAsFixed(2)}', isTotal: true),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(color: Colors.grey[600], fontSize: 14),
          ),
          Text(
            value,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
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
