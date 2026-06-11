import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/customer.dart';
import '../models/supplier.dart';
import '../models/product.dart';
import '../models/bill.dart';
import '../models/bill_item.dart';
import '../models/purchase.dart';
import '../models/purchase_item.dart';
import '../models/payment.dart';
import '../models/customer_balance.dart';
import '../models/dashboard_stats.dart';
import '../models/login_response.dart';

class ApiService {
  static const String baseUrl = 'https://inventorymanagement-afhl.onrender.com/api';

  // Auth
  Future&lt;LoginResponse&gt; login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username.trim(), 'password': password.trim()}),
    );

    if (response.statusCode == 200) {
      return LoginResponse.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to login: ${response.body}');
    }
  }

  Future&lt;void&gt; initAdmin() async {
    await http.post(
      Uri.parse('$baseUrl/auth/init-admin'),
      headers: {'Content-Type': 'application/json'},
    );
  }

  // Customers
  Future&lt;List&lt;Customer&gt;&gt; getCustomers() async {
    final response = await http.get(Uri.parse('$baseUrl/customers'));

    if (response.statusCode == 200) {
      List&lt;dynamic&gt; body = jsonDecode(response.body);
      return body.map((dynamic item) =&gt; Customer.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load customers');
    }
  }

  Future&lt;Customer&gt; getCustomer(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/customers/$id'));

    if (response.statusCode == 200) {
      return Customer.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load customer');
    }
  }

  Future&lt;Customer&gt; createCustomer(Customer customer) async {
    final response = await http.post(
      Uri.parse('$baseUrl/customers'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(customer.toJson()..remove('id')..remove('createdAt')),
    );

    if (response.statusCode == 200) {
      return Customer.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to create customer');
    }
  }

  Future&lt;Customer&gt; updateCustomer(int id, Customer customer) async {
    final response = await http.put(
      Uri.parse('$baseUrl/customers/$id'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(customer.toJson()),
    );

    if (response.statusCode == 200) {
      return Customer.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to update customer');
    }
  }

  Future&lt;void&gt; deleteCustomer(int id) async {
    final response = await http.delete(Uri.parse('$baseUrl/customers/$id'));

    if (response.statusCode != 200) {
      throw Exception('Failed to delete customer');
    }
  }

  // Suppliers
  Future&lt;List&lt;Supplier&gt;&gt; getSuppliers() async {
    final response = await http.get(Uri.parse('$baseUrl/suppliers'));

    if (response.statusCode == 200) {
      List&lt;dynamic&gt; body = jsonDecode(response.body);
      return body.map((dynamic item) =&gt; Supplier.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load suppliers');
    }
  }

  Future&lt;Supplier&gt; getSupplier(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/suppliers/$id'));

    if (response.statusCode == 200) {
      return Supplier.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load supplier');
    }
  }

  Future&lt;Supplier&gt; createSupplier(Supplier supplier) async {
    final response = await http.post(
      Uri.parse('$baseUrl/suppliers'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(supplier.toJson()..remove('id')..remove('createdAt')),
    );

    if (response.statusCode == 200) {
      return Supplier.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to create supplier');
    }
  }

  Future&lt;Supplier&gt; updateSupplier(int id, Supplier supplier) async {
    final response = await http.put(
      Uri.parse('$baseUrl/suppliers/$id'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(supplier.toJson()),
    );

    if (response.statusCode == 200) {
      return Supplier.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to update supplier');
    }
  }

  Future&lt;void&gt; deleteSupplier(int id) async {
    final response = await http.delete(Uri.parse('$baseUrl/suppliers/$id'));

    if (response.statusCode != 200) {
      throw Exception('Failed to delete supplier');
    }
  }

  // Products
  Future&lt;List&lt;Product&gt;&gt; getProducts() async {
    final response = await http.get(Uri.parse('$baseUrl/products'));

    if (response.statusCode == 200) {
      List&lt;dynamic&gt; body = jsonDecode(response.body);
      return body.map((dynamic item) =&gt; Product.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load products');
    }
  }

  Future&lt;Product&gt; getProduct(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/products/$id'));

    if (response.statusCode == 200) {
      return Product.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load product');
    }
  }

  Future&lt;List&lt;Product&gt;&gt; getLowStockProducts() async {
    final response = await http.get(Uri.parse('$baseUrl/products/low-stock'));

    if (response.statusCode == 200) {
      List&lt;dynamic&gt; body = jsonDecode(response.body);
      return body.map((dynamic item) =&gt; Product.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load low stock products');
    }
  }

  Future&lt;Product&gt; createProduct(Product product) async {
    final response = await http.post(
      Uri.parse('$baseUrl/products'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(product.toJson()..remove('id')..remove('createdAt')..remove('updatedAt')),
    );

    if (response.statusCode == 200) {
      return Product.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to create product');
    }
  }

  Future&lt;Product&gt; updateProduct(int id, Product product) async {
    final response = await http.put(
      Uri.parse('$baseUrl/products/$id'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(product.toJson()),
    );

    if (response.statusCode == 200) {
      return Product.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to update product');
    }
  }

  Future&lt;void&gt; deleteProduct(int id) async {
    final response = await http.delete(Uri.parse('$baseUrl/products/$id'));

    if (response.statusCode != 200) {
      throw Exception('Failed to delete product');
    }
  }

  Future&lt;List&lt;Product&gt;&gt; searchProducts(String keyword) async {
    final response = await http.get(Uri.parse('$baseUrl/products/search?keyword=${Uri.encodeComponent(keyword)}'));

    if (response.statusCode == 200) {
      List&lt;dynamic&gt; body = jsonDecode(response.body);
      return body.map((dynamic item) =&gt; Product.fromJson(item)).toList();
    } else {
      throw Exception('Failed to search products');
    }
  }

  Future&lt;Map&lt;String, double&gt;&gt; getCustomerProductPrices(int customerId) async {
    final response = await http.get(Uri.parse('$baseUrl/bills/customer-prices?customerId=$customerId'));

    if (response.statusCode == 200) {
      Map&lt;String, dynamic&gt; body = jsonDecode(response.body);
      return body.map((key, value) =&gt; MapEntry(key, (value as num).toDouble()));
    } else {
      throw Exception('Failed to load customer product prices');
    }
  }

  // Bills
  Future&lt;List&lt;Bill&gt;&gt; getBills() async {
    final response = await http.get(Uri.parse('$baseUrl/bills'));

    if (response.statusCode == 200) {
      List&lt;dynamic&gt; body = jsonDecode(response.body);
      return body.map((dynamic item) =&gt; Bill.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load bills');
    }
  }

  Future&lt;Bill&gt; getBill(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/bills/$id'));

    if (response.statusCode == 200) {
      return Bill.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load bill');
    }
  }

  Future&lt;Bill&gt; createBill(Map&lt;String, dynamic&gt; billData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/bills'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(billData),
    );

    if (response.statusCode == 200) {
      return Bill.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to create bill');
    }
  }

  Future&lt;Bill&gt; updateBill(int id, Map&lt;String, dynamic&gt; billData) async {
    final response = await http.put(
      Uri.parse('$baseUrl/bills/$id'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(billData),
    );

    if (response.statusCode == 200) {
      return Bill.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to update bill');
    }
  }

  Future&lt;void&gt; downloadInvoicePdf(int id) async {
    // TODO: Implement PDF download
  }

  // Purchases
  Future&lt;List&lt;Purchase&gt;&gt; getPurchases() async {
    final response = await http.get(Uri.parse('$baseUrl/purchases'));

    if (response.statusCode == 200) {
      List&lt;dynamic&gt; body = jsonDecode(response.body);
      return body.map((dynamic item) =&gt; Purchase.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load purchases');
    }
  }

  Future&lt;Purchase&gt; getPurchase(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/purchases/$id'));

    if (response.statusCode == 200) {
      return Purchase.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load purchase');
    }
  }

  Future&lt;Purchase&gt; createPurchase(Map&lt;String, dynamic&gt; purchaseData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/purchases'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(purchaseData),
    );

    if (response.statusCode == 200) {
      return Purchase.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to create purchase');
    }
  }

  // Payments
  Future&lt;List&lt;Payment&gt;&gt; getCustomerPayments(int customerId) async {
    final response = await http.get(Uri.parse('$baseUrl/payments/customer/$customerId'));

    if (response.statusCode == 200) {
      List&lt;dynamic&gt; body = jsonDecode(response.body);
      return body.map((dynamic item) =&gt; Payment.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load payments');
    }
  }

  Future&lt;CustomerBalance&gt; getCustomerBalance(int customerId) async {
    final response = await http.get(Uri.parse('$baseUrl/payments/customer/$customerId/balance'));

    if (response.statusCode == 200) {
      return CustomerBalance.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load customer balance');
    }
  }

  Future&lt;Payment&gt; createPayment(Map&lt;String, dynamic&gt; paymentData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/payments'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(paymentData),
    );

    if (response.statusCode == 200) {
      return Payment.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to create payment');
    }
  }

  // Dashboard
  Future&lt;DashboardStats&gt; getDashboardStats() async {
    final response = await http.get(Uri.parse('$baseUrl/dashboard/stats'));

    if (response.statusCode == 200) {
      return DashboardStats.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load dashboard stats');
    }
  }
}
