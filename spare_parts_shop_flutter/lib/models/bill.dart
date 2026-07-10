import 'customer.dart';
import 'bill_item.dart';

class Bill {
  final int id;
  final String invoiceNumber;
  final Customer customer;
  final double subtotal;
  final double gstAmount;
  final double discount;
  final double finalAmount;
  final String gstType;
  final String billDate;
  final List<BillItem> items;

  Bill({
    required this.id,
    required this.invoiceNumber,
    required this.customer,
    required this.subtotal,
    required this.gstAmount,
    required this.discount,
    required this.finalAmount,
    required this.gstType,
    required this.billDate,
    required this.items,
  });

  factory Bill.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'];
    List<BillItem> items = (rawItems != null)
        ? (rawItems as List).map((i) => BillItem.fromJson(i)).toList()
        : [];

    return Bill(
      id: json['id'],
      invoiceNumber: json['invoiceNumber'],
      customer: Customer.fromJson(json['customer']),
      subtotal: (json['subtotal'] as num).toDouble(),
      gstAmount: (json['gstAmount'] as num).toDouble(),
      discount: (json['discount'] as num).toDouble(),
      finalAmount: (json['finalAmount'] as num).toDouble(),
      gstType: json['gstType'],
      billDate: json['billDate'],
      items: items,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'invoiceNumber': invoiceNumber,
      'customer': customer.toJson(),
      'subtotal': subtotal,
      'gstAmount': gstAmount,
      'discount': discount,
      'finalAmount': finalAmount,
      'gstType': gstType,
      'billDate': billDate,
      'items': items.map((i) => i.toJson()).toList(),
    };
  }
}
