
class EMIInstallment {
  final int id;
  final int emiId;
  final int installmentNumber;
  final String dueDate;
  final double amount;
  final String status;
  final String? paidDate;
  final String? paymentMethod;
  final double lateFee;
  final String? remarks;
  final String createdAt;

  EMIInstallment({
    required this.id,
    required this.emiId,
    required this.installmentNumber,
    required this.dueDate,
    required this.amount,
    required this.status,
    this.paidDate,
    this.paymentMethod,
    required this.lateFee,
    this.remarks,
    required this.createdAt,
  });

  factory EMIInstallment.fromJson(Map<String, dynamic> json) {
    return EMIInstallment(
      id: json['id'],
      emiId: json['emi']['id'],
      installmentNumber: json['installmentNumber'],
      dueDate: json['dueDate'],
      amount: (json['amount'] as num).toDouble(),
      status: json['status'],
      paidDate: json['paidDate'],
      paymentMethod: json['paymentMethod'],
      lateFee: (json['lateFee'] as num).toDouble(),
      remarks: json['remarks'],
      createdAt: json['createdAt'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'emiId': emiId,
      'installmentNumber': installmentNumber,
      'dueDate': dueDate,
      'amount': amount,
      'status': status,
      'paidDate': paidDate,
      'paymentMethod': paymentMethod,
      'lateFee': lateFee,
      'remarks': remarks,
      'createdAt': createdAt,
    };
  }
}
