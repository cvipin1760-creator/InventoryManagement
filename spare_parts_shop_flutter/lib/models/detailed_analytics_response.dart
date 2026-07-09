class DetailedAnalyticsResponse {
  final List<MonthlyRevenue> revenueData;
  final AnalyticsMetrics? metrics;
  final List<TopProduct> topProducts;

  DetailedAnalyticsResponse({
    required this.revenueData,
    this.metrics,
    required this.topProducts,
  });

  factory DetailedAnalyticsResponse.fromJson(Map<String, dynamic> json) {
    return DetailedAnalyticsResponse(
      revenueData: (json['revenueData'] as List?)
              ?.map((e) => MonthlyRevenue.fromJson(e))
              .toList() ??
          [],
      metrics: json['metrics'] != null ? AnalyticsMetrics.fromJson(json['metrics']) : null,
      topProducts: (json['topProducts'] as List?)
              ?.map((e) => TopProduct.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class MonthlyRevenue {
  final String month;
  final double revenue;

  MonthlyRevenue({required this.month, required this.revenue});

  factory MonthlyRevenue.fromJson(Map<String, dynamic> json) {
    return MonthlyRevenue(
      month: json['month'] ?? '',
      revenue: (json['revenue'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class AnalyticsMetrics {
  final String totalRevenue;
  final String totalSales;
  final String totalCustomers;
  final String lowStockItems;

  AnalyticsMetrics({
    required this.totalRevenue,
    required this.totalSales,
    required this.totalCustomers,
    required this.lowStockItems,
  });

  factory AnalyticsMetrics.fromJson(Map<String, dynamic> json) {
    return AnalyticsMetrics(
      totalRevenue: json['totalRevenue'] ?? '0',
      totalSales: json['totalSales'] ?? '0',
      totalCustomers: json['totalCustomers'] ?? '0',
      lowStockItems: json['lowStockItems'] ?? '0',
    );
  }
}

class TopProduct {
  final String name;
  final String sales;
  final String category;

  TopProduct({required this.name, required this.sales, required this.category});

  factory TopProduct.fromJson(Map<String, dynamic> json) {
    return TopProduct(
      name: json['name'] ?? '',
      sales: json['sales'] ?? '',
      category: json['category'] ?? '',
    );
  }
}
