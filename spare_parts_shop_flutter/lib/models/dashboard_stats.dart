class DashboardStats {
  final double todaySales;
  final double weeklySales;
  final double monthlySales;
  final int todayBillsCount;
  final int lowStockCount;

  DashboardStats({
    required this.todaySales,
    required this.weeklySales,
    required this.monthlySales,
    required this.todayBillsCount,
    required this.lowStockCount,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      todaySales: (json['todaySales'] as num).toDouble(),
      weeklySales: (json['weeklySales'] as num).toDouble(),
      monthlySales: (json['monthlySales'] as num).toDouble(),
      todayBillsCount: json['todayBillsCount'],
      lowStockCount: json['lowStockCount'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'todaySales': todaySales,
      'weeklySales': weeklySales,
      'monthlySales': monthlySales,
      'todayBillsCount': todayBillsCount,
      'lowStockCount': lowStockCount,
    };
  }
}
