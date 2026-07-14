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
  final String? createdAt;
  final String? updatedAt;

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
    this.createdAt,
    this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name']?.toString() ?? '',
      partNumber: json['partNumber']?.toString() ?? '',
      costPrice: (json['costPrice'] as num?)?.toDouble() ?? 0.0,
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      gstPercent: (json['gstPercent'] as num?)?.toDouble() ?? 0.0,
      quantity: (json['quantity'] as num?)?.toInt() ?? 0,
      lowStockThreshold: (json['lowStockThreshold'] as num?)?.toInt() ?? 10,
      attachmentPath: json['attachmentPath']?.toString(),
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString(),
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
