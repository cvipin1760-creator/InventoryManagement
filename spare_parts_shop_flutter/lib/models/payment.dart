import 'customer.dart';
import 'bill.dart';

class Payment {
  final int id;
  final Customer customer;
  final Bill? bill;
  final double amount;
  final String paymentDate;
  final String? note;

  Payment({
    required this.id,
    required this.customer,
    this.bill,
    required this.amount,
    required this.paymentDate,
    this.note,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'],
      customer: Customer.fromJson(json['customer']),
      bill: json['bill'] != null ? Bill.fromJson(json['bill']) : null,
      amount: (json['amount'] as num).toDouble(),
      paymentDate: json['paymentDate'],
      note: json['note'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customer': customer.toJson(),
      'bill': bill?.toJson(),
      'amount': amount,
      'paymentDate': paymentDate,
      'note': note,
    };
  }
}
