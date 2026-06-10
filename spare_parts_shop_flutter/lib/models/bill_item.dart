import 'product.dart';

class BillItem {
  final int id;
  final Product product;
  final int quantity;
  final double price;
  final double gstPercent;
  final double itemTotal;
  final double discount;

  BillItem({
    required this.id,
    required this.product,
    required this.quantity,
    required this.price,
    required this.gstPercent,
    required this.itemTotal,
    required this.discount,
  });

  factory BillItem.fromJson(Map<String, dynamic> json) {
    return BillItem(
      id: json['id'],
      product: Product.fromJson(json['product']),
      quantity: json['quantity'],
      price: (json['price'] as num).toDouble(),
      gstPercent: (json['gstPercent'] as num).toDouble(),
      itemTotal: (json['itemTotal'] as num).toDouble(),
      discount: (json['discount'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product': product.toJson(),
      'quantity': quantity,
      'price': price,
      'gstPercent': gstPercent,
      'itemTotal': itemTotal,
      'discount': discount,
    };
  }
}
