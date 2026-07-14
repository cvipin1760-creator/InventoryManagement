
import 'customer.dart';
import 'bill.dart';

class EMI {
  final int id;
  final Bill bill;
  final Customer customer;
  final double totalAmount;
  final double downPayment;
  final double loanAmount;
  final int totalEmis;
  final double emiAmount;
  final int emisPaid;
  final int emisRemaining;
  final double paidAmount;
  final double remainingAmount;
  final double interestRate;
  final double processingFee;
  final String firstEmiDate;
  final String nextEmiDate;
  final String? emiNotes;
  final List<dynamic>? installments;
  final String createdAt;

  EMI({
    required this.id,
    required this.bill,
    required this.customer,
    required this.totalAmount,
    required this.downPayment,
    required this.loanAmount,
    required this.totalEmis,
    required this.emiAmount,
    required this.emisPaid,
    required this.emisRemaining,
    required this.paidAmount,
    required this.remainingAmount,
    required this.interestRate,
    required this.processingFee,
    required this.firstEmiDate,
    required this.nextEmiDate,
    this.emiNotes,
    this.installments,
    required this.createdAt,
  });

  factory EMI.fromJson(Map<String, dynamic> json) {
    return EMI(
      id: json['id'],
      bill: Bill.fromJson(json['bill']),
      customer: Customer.fromJson(json['customer']),
      totalAmount: (json['totalAmount'] as num).toDouble(),
      downPayment: (json['downPayment'] as num).toDouble(),
      loanAmount: (json['loanAmount'] as num).toDouble(),
      totalEmis: json['totalEmis'],
      emiAmount: (json['emiAmount'] as num).toDouble(),
      emisPaid: json['emisPaid'],
      emisRemaining: json['emisRemaining'],
      paidAmount: (json['paidAmount'] as num).toDouble(),
      remainingAmount: (json['remainingAmount'] as num).toDouble(),
      interestRate: (json['interestRate'] as num).toDouble(),
      processingFee: (json['processingFee'] as num).toDouble(),
      firstEmiDate: json['firstEmiDate'],
      nextEmiDate: json['nextEmiDate'],
      emiNotes: json['emiNotes'],
      installments: json['installments'],
      createdAt: json['createdAt'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'bill': bill.toJson(),
      'customer': customer.toJson(),
      'totalAmount': totalAmount,
      'downPayment': downPayment,
      'loanAmount': loanAmount,
      'totalEmis': totalEmis,
      'emiAmount': emiAmount,
      'emisPaid': emisPaid,
      'emisRemaining': emisRemaining,
      'paidAmount': paidAmount,
      'remainingAmount': remainingAmount,
      'interestRate': interestRate,
      'processingFee': processingFee,
      'firstEmiDate': firstEmiDate,
      'nextEmiDate': nextEmiDate,
      'emiNotes': emiNotes,
      'installments': installments,
      'createdAt': createdAt,
    };
  }
}
