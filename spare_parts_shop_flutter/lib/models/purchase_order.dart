import 'supplier.dart';
import 'purchase_order_item.dart';

class PurchaseOrder {
  final int? id;
  final Supplier supplier;
  final String orderDate;
  final String status;
  final double totalAmount;
  final List<PurchaseOrderItem> items;

  PurchaseOrder({
    this.id,
    required this.supplier,
    required this.orderDate,
    required this.status,
    required this.totalAmount,
    required this.items,
  });

  factory PurchaseOrder.fromJson(Map<String, dynamic> json) {
    var list = json['items'] as List? ?? [];
    List<PurchaseOrderItem> itemsList = list.map((i) => PurchaseOrderItem.fromJson(i)).toList();
    
    return PurchaseOrder(
      id: json['id'],
      supplier: Supplier.fromJson(json['supplier']),
      orderDate: json['orderDate'],
      status: json['status'],
      totalAmount: (json['totalAmount'] as num).toDouble(),
      items: itemsList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'supplier': supplier.toJson(),
      'orderDate': orderDate,
      'status': status,
      'totalAmount': totalAmount,
      'items': items.map((i) => i.toJson()).toList(),
    };
  }
}
