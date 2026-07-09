class AdminDashboardResponse {
  final double todaySales;
  final double netProfit;
  final int totalCustomers;
  final int newCustomers;
  final int totalProducts;
  final int lowStockCount;
  final int outOfStockCount;
  final int deadStockCount;
  final int customerGrowthPercent;
  final List<DailyRevenue> revenueData;
  final List<CustomerData> customerData;
  final List<Activity> recentActivity;
  final List<NotificationAlert> notifications;

  AdminDashboardResponse({
    required this.todaySales,
    required this.netProfit,
    required this.totalCustomers,
    required this.newCustomers,
    required this.totalProducts,
    required this.lowStockCount,
    required this.outOfStockCount,
    required this.deadStockCount,
    required this.customerGrowthPercent,
    required this.revenueData,
    required this.customerData,
    required this.recentActivity,
    required this.notifications,
  });

  factory AdminDashboardResponse.fromJson(Map<String, dynamic> json) {
    return AdminDashboardResponse(
      todaySales: (json['todaySales'] as num?)?.toDouble() ?? 0.0,
      netProfit: (json['netProfit'] as num?)?.toDouble() ?? 0.0,
      totalCustomers: json['totalCustomers'] ?? 0,
      newCustomers: json['newCustomers'] ?? 0,
      totalProducts: json['totalProducts'] ?? 0,
      lowStockCount: json['lowStockCount'] ?? 0,
      outOfStockCount: json['outOfStockCount'] ?? 0,
      deadStockCount: json['deadStockCount'] ?? 0,
      customerGrowthPercent: json['customerGrowthPercent'] ?? 0,
      revenueData: (json['revenueData'] as List?)
              ?.map((e) => DailyRevenue.fromJson(e))
              .toList() ??
          [],
      customerData: (json['customerData'] as List?)
              ?.map((e) => CustomerData.fromJson(e))
              .toList() ??
          [],
      recentActivity: (json['recentActivity'] as List?)
              ?.map((e) => Activity.fromJson(e))
              .toList() ??
          [],
      notifications: (json['notifications'] as List?)
              ?.map((e) => NotificationAlert.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class DailyRevenue {
  final String name;
  final double revenue;
  final double profit;

  DailyRevenue({required this.name, required this.revenue, required this.profit});

  factory DailyRevenue.fromJson(Map<String, dynamic> json) {
    return DailyRevenue(
      name: json['name'] ?? '',
      revenue: (json['revenue'] as num?)?.toDouble() ?? 0.0,
      profit: (json['profit'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class CustomerData {
  final String name;
  final int value;

  CustomerData({required this.name, required this.value});

  factory CustomerData.fromJson(Map<String, dynamic> json) {
    return CustomerData(
      name: json['name'] ?? '',
      value: json['value'] ?? 0,
    );
  }
}

class Activity {
  final String time;
  final String text;
  final String color;

  Activity({required this.time, required this.text, required this.color});

  factory Activity.fromJson(Map<String, dynamic> json) {
    return Activity(
      time: json['time'] ?? '',
      text: json['text'] ?? '',
      color: json['color'] ?? '',
    );
  }
}

class NotificationAlert {
  final String title;
  final String desc;
  final String color;

  NotificationAlert({required this.title, required this.desc, required this.color});

  factory NotificationAlert.fromJson(Map<String, dynamic> json) {
    return NotificationAlert(
      title: json['title'] ?? '',
      desc: json['desc'] ?? '',
      color: json['color'] ?? '',
    );
  }
}
