
import 'bill.dart';
import 'product.dart';
import 'customer.dart';

class Warranty {
  final int id;
  final Bill bill;
  final Product product;
  final Customer customer;
  final String? serialNumber;
  final String? modelNumber;
  final String warrantyType;
  final String warrantyStartDate;
  final String warrantyEndDate;
  final int? warrantyPeriodMonths;
  final String? warrantyNotes;
  final String? warrantyTerms;
  final String createdAt;

  Warranty({
    required this.id,
    required this.bill,
    required this.product,
    required this.customer,
    this.serialNumber,
    this.modelNumber,
    required this.warrantyType,
    required this.warrantyStartDate,
    required this.warrantyEndDate,
    this.warrantyPeriodMonths,
    this.warrantyNotes,
    this.warrantyTerms,
    required this.createdAt,
  });

  factory Warranty.fromJson(Map<String, dynamic> json) {
    return Warranty(
      id: json['id'],
      bill: Bill.fromJson(json['bill']),
      product: Product.fromJson(json['product']),
      customer: Customer.fromJson(json['customer']),
      serialNumber: json['serialNumber'],
      modelNumber: json['modelNumber'],
      warrantyType: json['warrantyType'],
      warrantyStartDate: json['warrantyStartDate'],
      warrantyEndDate: json['warrantyEndDate'],
      warrantyPeriodMonths: json['warrantyPeriodMonths'],
      warrantyNotes: json['warrantyNotes'],
      warrantyTerms: json['warrantyTerms'],
      createdAt: json['createdAt'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'bill': bill.toJson(),
      'product': product.toJson(),
      'customer': customer.toJson(),
      'serialNumber': serialNumber,
      'modelNumber': modelNumber,
      'warrantyType': warrantyType,
      'warrantyStartDate': warrantyStartDate,
      'warrantyEndDate': warrantyEndDate,
      'warrantyPeriodMonths': warrantyPeriodMonths,
      'warrantyNotes': warrantyNotes,
      'warrantyTerms': warrantyTerms,
      'createdAt': createdAt,
    };
  }
}
