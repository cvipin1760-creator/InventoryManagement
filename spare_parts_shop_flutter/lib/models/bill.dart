import 'customer.dart';
import 'bill_item.dart';
import 'emi.dart';
import 'warranty.dart';

class Bill {
  final int id;
  final String invoiceNumber;
  final Customer customer;
  final double subtotal;
  final double gstAmount;
  final double discount;
  final double finalAmount;
  final String gstType;
  final String paymentMode;
  final String billDate;
  final List<BillItem> items;
  final List<EMI>? emis;
  final List<Warranty>? warranties;

  Bill({
    required this.id,
    required this.invoiceNumber,
    required this.customer,
    required this.subtotal,
    required this.gstAmount,
    required this.discount,
    required this.finalAmount,
    required this.gstType,
    required this.paymentMode,
    required this.billDate,
    required this.items,
    this.emis,
    this.warranties,
  });

  factory Bill.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'];
    List<BillItem> items = (rawItems != null)
        ? (rawItems as List).map((i) => BillItem.fromJson(i)).toList()
        : [];

    final rawEmis = json['emis'];
    List<EMI>? emis = (rawEmis != null)
        ? (rawEmis as List).map((e) => EMI.fromJson(e)).toList()
        : null;

    final rawWarranties = json['warranties'];
    List<Warranty>? warranties = (rawWarranties != null)
        ? (rawWarranties as List).map((w) => Warranty.fromJson(w)).toList()
        : null;

    return Bill(
      id: json['id'],
      invoiceNumber: json['invoiceNumber'],
      customer: Customer.fromJson(json['customer']),
      subtotal: (json['subtotal'] as num).toDouble(),
      gstAmount: (json['gstAmount'] as num).toDouble(),
      discount: (json['discount'] as num).toDouble(),
      finalAmount: (json['finalAmount'] as num).toDouble(),
      gstType: json['gstType'],
      paymentMode: json['paymentMode'] ?? 'FULL',
      billDate: json['billDate'],
      items: items,
      emis: emis,
      warranties: warranties,
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
      'paymentMode': paymentMode,
      'billDate': billDate,
      'items': items.map((i) => i.toJson()).toList(),
      'emis': emis?.map((e) => e.toJson()).toList(),
      'warranties': warranties?.map((w) => w.toJson()).toList(),
    };
  }
}
