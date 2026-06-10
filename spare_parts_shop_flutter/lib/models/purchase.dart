import 'supplier.dart';
import 'purchase_item.dart';

class Purchase {
  final int id;
  final String invoiceNumber;
  final Supplier supplier;
  final double subtotal;
  final double gstAmount;
  final double discount;
  final double finalAmount;
  final String gstType;
  final String purchaseDate;
  final String? attachmentPath;
  final List<PurchaseItem> items;

  Purchase({
    required this.id,
    required this.invoiceNumber,
    required this.supplier,
    required this.subtotal,
    required this.gstAmount,
    required this.discount,
    required this.finalAmount,
    required this.gstType,
    required this.purchaseDate,
    this.attachmentPath,
    required this.items,
  });

  factory Purchase.fromJson(Map<String, dynamic> json) {
    var itemsList = json['items'] as List;
    List<PurchaseItem> items = itemsList.map((i) => PurchaseItem.fromJson(i)).toList();

    return Purchase(
      id: json['id'],
      invoiceNumber: json['invoiceNumber'],
      supplier: Supplier.fromJson(json['supplier']),
      subtotal: (json['subtotal'] as num).toDouble(),
      gstAmount: (json['gstAmount'] as num).toDouble(),
      discount: (json['discount'] as num).toDouble(),
      finalAmount: (json['finalAmount'] as num).toDouble(),
      gstType: json['gstType'],
      purchaseDate: json['purchaseDate'],
      attachmentPath: json['attachmentPath'],
      items: items,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'invoiceNumber': invoiceNumber,
      'supplier': supplier.toJson(),
      'subtotal': subtotal,
      'gstAmount': gstAmount,
      'discount': discount,
      'finalAmount': finalAmount,
      'gstType': gstType,
      'purchaseDate': purchaseDate,
      'attachmentPath': attachmentPath,
      'items': items.map((i) => i.toJson()).toList(),
    };
  }
}
