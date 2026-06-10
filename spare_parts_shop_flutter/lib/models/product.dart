class Product {
  final int id;
  final String name;
  final String partNumber;
  final double costPrice;
  final double price;
  final double gstPercent;
  final int quantity;
  final int lowStockThreshold;
  final String? attachmentPath;
  final String createdAt;
  final String updatedAt;

  Product({
    required this.id,
    required this.name,
    required this.partNumber,
    required this.costPrice,
    required this.price,
    required this.gstPercent,
    required this.quantity,
    required this.lowStockThreshold,
    this.attachmentPath,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      partNumber: json['partNumber'],
      costPrice: (json['costPrice'] as num).toDouble(),
      price: (json['price'] as num).toDouble(),
      gstPercent: (json['gstPercent'] as num).toDouble(),
      quantity: json['quantity'],
      lowStockThreshold: json['lowStockThreshold'],
      attachmentPath: json['attachmentPath'],
      createdAt: json['createdAt'],
      updatedAt: json['updatedAt'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'partNumber': partNumber,
      'costPrice': costPrice,
      'price': price,
      'gstPercent': gstPercent,
      'quantity': quantity,
      'lowStockThreshold': lowStockThreshold,
      'attachmentPath': attachmentPath,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}
