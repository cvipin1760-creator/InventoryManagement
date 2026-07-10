import 'product.dart';

class PurchaseOrderItem {
  final int? id;
  final Product product;
  final int quantity;
  final double unitPrice;

  PurchaseOrderItem({
    this.id,
    required this.product,
    required this.quantity,
    required this.unitPrice,
  });

  factory PurchaseOrderItem.fromJson(Map<String, dynamic> json) {
    return PurchaseOrderItem(
      id: json['id'],
      product: Product.fromJson(json['product']),
      quantity: json['quantity'],
      unitPrice: (json['unitPrice'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'product': product.toJson(),
      'quantity': quantity,
      'unitPrice': unitPrice,
    };
  }
}
