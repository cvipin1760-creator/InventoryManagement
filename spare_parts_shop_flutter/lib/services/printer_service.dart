import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PrinterService {
  Future<void> printReceipt({
    required Map<String, dynamic> billData,
    required String businessName,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final bool autoPrint = prefs.getBool('auto_print') ?? false;
    final String printerType = prefs.getString('printer_type') ?? 'A4';

    if (!autoPrint) return;

    final doc = pw.Document();
    
    // Choose format
    final PdfPageFormat format = printerType == 'A4' 
        ? PdfPageFormat.a4 
        : PdfPageFormat.roll80;

    doc.addPage(
      pw.Page(
        pageFormat: format,
        build: (pw.Context context) {
          return _buildReceipt(context, billData, businessName, printerType);
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => doc.save(),
      name: 'Receipt_${billData['customerName']}',
    );
  }

  pw.Widget _buildReceipt(pw.Context context, Map<String, dynamic> billData, String businessName, String type) {
    final items = billData['items'] as List<dynamic>;
    
    double total = 0;
    for (var i in items) {
      total += (i['price'] as double) * (i['quantity'] as int);
    }

    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Center(
          child: pw.Text(businessName, style: pw.TextStyle(fontSize: type == 'A4' ? 24 : 16, fontWeight: pw.FontWeight.bold)),
        ),
        pw.SizedBox(height: 10),
        pw.Text('Customer: ${billData['customerName']}'),
        pw.Text('Date: ${DateTime.now().toString().split('.').first}'),
        pw.Divider(),
        
        pw.Row(
          mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
          children: [
            pw.Expanded(flex: 3, child: pw.Text('Item')),
            pw.Expanded(flex: 1, child: pw.Text('Qty', textAlign: pw.TextAlign.center)),
            pw.Expanded(flex: 2, child: pw.Text('Price', textAlign: pw.TextAlign.right)),
            pw.Expanded(flex: 2, child: pw.Text('Total', textAlign: pw.TextAlign.right)),
          ],
        ),
        pw.Divider(),
        
        ...items.map((item) {
          final double price = item['price'] is int ? (item['price'] as int).toDouble() : item['price'];
          final int qty = item['quantity'];
          final double rowTotal = price * qty;
          
          return pw.Padding(
            padding: const pw.EdgeInsets.symmetric(vertical: 2),
            child: pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Expanded(flex: 3, child: pw.Text(item['productName'] ?? 'Product')),
                pw.Expanded(flex: 1, child: pw.Text('$qty', textAlign: pw.TextAlign.center)),
                pw.Expanded(flex: 2, child: pw.Text(price.toStringAsFixed(2), textAlign: pw.TextAlign.right)),
                pw.Expanded(flex: 2, child: pw.Text(rowTotal.toStringAsFixed(2), textAlign: pw.TextAlign.right)),
              ],
            ),
          );
        }),
        
        pw.Divider(),
        pw.Row(
          mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
          children: [
            pw.Text('GRAND TOTAL', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
            pw.Text('Rs. ${total.toStringAsFixed(2)}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
          ],
        ),
        pw.SizedBox(height: 20),
        pw.Center(
          child: pw.Text('Thank you for your business!'),
        ),
      ],
    );
  }
}
