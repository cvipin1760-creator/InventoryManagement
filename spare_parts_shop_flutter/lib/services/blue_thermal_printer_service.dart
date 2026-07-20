import 'package:blue_thermal_printer/blue_thermal_printer.dart';
import 'package:flutter/services.dart';

class BluetoothPrinterService {
  final BlueThermalPrinter bluetooth = BlueThermalPrinter.instance;

  Future<List<BluetoothDevice>> getPairedDevices() async {
    try {
      return await bluetooth.getBondedDevices();
    } on PlatformException {
      return [];
    }
  }

  Future<bool?> isConnected() async {
    return await bluetooth.isConnected;
  }

  Future<void> connect(BluetoothDevice device) async {
    try {
      await bluetooth.connect(device);
    } catch (e) {
      throw Exception('Could not connect to printer: $e');
    }
  }

  Future<void> disconnect() async {
    await bluetooth.disconnect();
  }

  /// Print a simple text label with barcode
  Future<void> printBarcodeLabel({
    required String businessName,
    required String productName,
    required String sku,
    required String barcode,
    required double price,
    int copies = 1,
  }) async {
    final bool? connected = await bluetooth.isConnected;
    if (connected != true) {
      throw Exception('Printer not connected');
    }

    for (int i = 0; i < copies; i++) {
      // Basic formatting using ESC/POS commands that blue_thermal_printer supports
      bluetooth.printCustom(businessName, 2, 1); // Size 2, Align Center
      bluetooth.printCustom(productName, 1, 1);
      bluetooth.printCustom('SKU: $sku', 0, 1);
      
      // Print barcode (type 73 is CODE128 usually, depends on printer firmware)
      // Standard ESC/POS for CODE128
      bluetooth.printCustom('Price: \$${price.toStringAsFixed(2)}', 1, 1);
      
      // Unfortunately blue_thermal_printer doesn't have a direct barcode drawing method in its basic API
      // We rely on standard text print for now, or users can use the `printQRcode` method.
      bluetooth.printQRcode(barcode, 200, 200, 1);
      
      bluetooth.printNewLine();
      bluetooth.printNewLine();
    }
  }
}
