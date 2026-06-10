class CustomerBalance {
  final int customerId;
  final double totalBilled;
  final double totalPaid;
  final double remainingAmount;

  CustomerBalance({
    required this.customerId,
    required this.totalBilled,
    required this.totalPaid,
    required this.remainingAmount,
  });

  factory CustomerBalance.fromJson(Map<String, dynamic> json) {
    return CustomerBalance(
      customerId: json['customerId'],
      totalBilled: (json['totalBilled'] as num).toDouble(),
      totalPaid: (json['totalPaid'] as num).toDouble(),
      remainingAmount: (json['remainingAmount'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'customerId': customerId,
      'totalBilled': totalBilled,
      'totalPaid': totalPaid,
      'remainingAmount': remainingAmount,
    };
  }
}
