import 'package:flutter/material.dart';
import '../models/bill.dart';
import '../constants/app_theme.dart';
import '../services/api_service.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';
import 'edit_bill_screen.dart';
import 'package:file_picker/file_picker.dart';
import 'package:blue_thermal_printer/blue_thermal_printer.dart';

class BillDetailScreen extends StatefulWidget {
  final Bill bill;
  const BillDetailScreen({super.key, required this.bill});

  @override
  State<BillDetailScreen> createState() => _BillDetailScreenState();
}

class _BillDetailScreenState extends State<BillDetailScreen> {
  final ApiService _apiService = ApiService();
  bool _isUploading = false;

  Future<void> _sendBillToWhatsApp(BuildContext context) async {
    String message = "Hello ${widget.bill.customer.name},\n\n";
    message += "Your Bill: ${widget.bill.invoiceNumber}\n";
    message += "Date: ${DateFormat.yMMMMd().format(DateTime.parse(widget.bill.billDate))}\n";
    message += "------------------------\n";
    for (var item in widget.bill.items) {
      message += "${item.product.name} x ${item.quantity} = ₹${(item.price * item.quantity).toStringAsFixed(2)}\n";
    }
    message += "------------------------\n";
    message += "Gross Total: ₹${widget.bill.subtotal.toStringAsFixed(2)}\n";
    message += "Discount: -₹${widget.bill.discount.toStringAsFixed(2)}\n";
    message += "GST (${widget.bill.gstType}): ₹${widget.bill.gstAmount.toStringAsFixed(2)}\n";
    message += "Grand Total: ₹${widget.bill.finalAmount.toStringAsFixed(2)}\n";
    message += "\nThank you for your business!";

    final phone = widget.bill.customer.phone.replaceAll(RegExp(r'[^0-9]'), '');
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

  Future<void> _printReceipt() async {
    BlueThermalPrinter bluetooth = BlueThermalPrinter.instance;
    bool? isConnected = await bluetooth.isConnected;
    
    if (isConnected == null || !isConnected) {
      List<BluetoothDevice> devices = await bluetooth.getBondedDevices();
      if (devices.isEmpty) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('No bonded Bluetooth printers found.')));
        return;
      }
      
      // Attempt to connect to the first bonded device (usually the thermal printer)
      try {
        await bluetooth.connect(devices.first);
      } catch (e) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to connect to printer: $e')));
        return;
      }
    }

    bluetooth.printCustom("Stock Pilot", 3, 1);
    bluetooth.printNewLine();
    bluetooth.printCustom("Invoice: ${widget.bill.invoiceNumber}", 1, 0);
    bluetooth.printCustom("Date: ${DateFormat.yMMMMd().format(DateTime.parse(widget.bill.billDate))}", 1, 0);
    bluetooth.printCustom("Customer: ${widget.bill.customer.name}", 1, 0);
    bluetooth.printNewLine();
    bluetooth.printCustom("--------------------------------", 1, 1);
    for (var item in widget.bill.items) {
      bluetooth.printCustom("${item.product.name} x ${item.quantity}", 1, 0);
      bluetooth.printCustom("Rs ${(item.price * item.quantity).toStringAsFixed(2)}", 1, 2);
    }
    bluetooth.printCustom("--------------------------------", 1, 1);
    bluetooth.printCustom("Gross: Rs ${widget.bill.subtotal.toStringAsFixed(2)}", 1, 2);
    bluetooth.printCustom("Disc: Rs ${widget.bill.discount.toStringAsFixed(2)}", 1, 2);
    bluetooth.printCustom("GST: Rs ${widget.bill.gstAmount.toStringAsFixed(2)}", 1, 2);
    bluetooth.printCustom("TOTAL: Rs ${widget.bill.finalAmount.toStringAsFixed(2)}", 2, 2);
    bluetooth.printNewLine();
    bluetooth.printCustom("Thank you for your business!", 1, 1);
    bluetooth.printNewLine();
    bluetooth.printNewLine();
    bluetooth.paperCut();
  }

  Future<void> _uploadAttachment() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles();
      if (result != null) {
        final path = result.files.single.path;
        if (path != null) {
          setState(() => _isUploading = true);
          await _apiService.uploadBillAttachment(path);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Attachment uploaded successfully!')));
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to upload attachment: $e')));
      }
    } finally {
      if (mounted) {
        setState(() => _isUploading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: Text(widget.bill.invoiceNumber),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        actions: [
          if (_isUploading)
            const Center(child: Padding(padding: EdgeInsets.all(16.0), child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)))),
          IconButton(
            icon: const Icon(Icons.attach_file),
            onPressed: _isUploading ? null : _uploadAttachment,
            tooltip: 'Upload Attachment',
          ),
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => EditBillScreen(bill: widget.bill)),
              );
            },
            tooltip: 'Edit Bill',
          ),
          IconButton(
            icon: const Icon(Icons.download),
            onPressed: () {
              _apiService.downloadInvoicePdf(widget.bill.id);
            },
            tooltip: 'Download Invoice',
          ),
          IconButton(
            icon: const Icon(Icons.print),
            onPressed: _printReceipt,
            tooltip: 'Print Receipt (Bluetooth)',
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
                    _buildDetailRow('Invoice Number', widget.bill.invoiceNumber),
                    _buildDetailRow('Date', DateFormat.yMMMMd().format(DateTime.parse(widget.bill.billDate))),
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
                    _buildDetailRow('Name', widget.bill.customer.name),
                    _buildDetailRow('Phone', widget.bill.customer.phone),
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
                    ...widget.bill.items.map((item) => Padding(
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
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    _buildSummaryRow('Subtotal:', '₹${widget.bill.subtotal.toStringAsFixed(2)}'),
                    _buildSummaryRow('Discount:', '-₹${widget.bill.discount.toStringAsFixed(2)}'),
                    _buildSummaryRow('GST (${widget.bill.gstType}):', '₹${widget.bill.gstAmount.toStringAsFixed(2)}'),
                    const Divider(height: 32),
                    _buildSummaryRow('Grand Total:', '₹${widget.bill.finalAmount.toStringAsFixed(2)}', isTotal: true),
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
