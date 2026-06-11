import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/customer.dart';
import '../models/supplier.dart';
import '../models/product.dart';
import '../models/bill.dart';
import '../models/purchase.dart';
import '../models/payment.dart';
import '../models/customer_balance.dart';
import '../models/dashboard_stats.dart';
import '../models/login_response.dart';

class ApiService {
  static const String baseUrl = 'https://inventorymanagement-afhl.onrender.com/api';

  Future<LoginResponse> login(String username, String password) async {
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

  Future<void> initAdmin() async {
    await http.post(
      Uri.parse('$baseUrl/auth/init-admin'),
      headers: {'Content-Type': 'application/json'},
    );
  }

  Future<List<Customer>> getCustomers() async {
    final response = await http.get(Uri.parse('$baseUrl/customers'));

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Customer.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load customers');
    }
  }

  Future<Customer> getCustomer(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/customers/$id'));

    if (response.statusCode == 200) {
      return Customer.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load customer');
    }
  }

  Future<List<Customer>> searchCustomers(String keyword) async {
    final response = await http.get(Uri.parse('$baseUrl/customers/search?keyword=${Uri.encodeComponent(keyword)}'));

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Customer.fromJson(item)).toList();
    } else {
      throw Exception('Failed to search customers');
    }
  }

  Future<Customer> createCustomer(Customer customer) async {
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

  Future<Customer> updateCustomer(int id, Customer customer) async {
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

  Future<void> deleteCustomer(int id) async {
    final response = await http.delete(Uri.parse('$baseUrl/customers/$id'));

    if (response.statusCode != 200) {
      throw Exception('Failed to delete customer');
    }
  }

  Future<List<Supplier>> getSuppliers() async {
    final response = await http.get(Uri.parse('$baseUrl/suppliers'));

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Supplier.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load suppliers');
    }
  }

  Future<Supplier> getSupplier(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/suppliers/$id'));

    if (response.statusCode == 200) {
      return Supplier.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load supplier');
    }
  }

  Future<List<Supplier>> searchSuppliers(String keyword) async {
    final response = await http.get(Uri.parse('$baseUrl/suppliers/search?keyword=${Uri.encodeComponent(keyword)}'));

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Supplier.fromJson(item)).toList();
    } else {
      throw Exception('Failed to search suppliers');
    }
  }

  Future<Supplier> createSupplier(Supplier supplier) async {
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

  Future<Supplier> updateSupplier(int id, Supplier supplier) async {
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

  Future<void> deleteSupplier(int id) async {
    final response = await http.delete(Uri.parse('$baseUrl/suppliers/$id'));

    if (response.statusCode != 200) {
      throw Exception('Failed to delete supplier');
    }
  }

  Future<List<Product>> getProducts() async {
    final response = await http.get(Uri.parse('$baseUrl/products'));

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Product.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load products');
    }
  }

  Future<Product> getProduct(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/products/$id'));

    if (response.statusCode == 200) {
      return Product.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load product');
    }
  }

  Future<List<Product>> getLowStockProducts() async {
    final response = await http.get(Uri.parse('$baseUrl/products/low-stock'));

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Product.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load low stock products');
    }
  }

  Future<List<Product>> searchProducts(String keyword) async {
    final response = await http.get(Uri.parse('$baseUrl/products/search?keyword=${Uri.encodeComponent(keyword)}'));

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Product.fromJson(item)).toList();
    } else {
      throw Exception('Failed to search products');
    }
  }

  Future<Product> createProduct(Product product) async {
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

  Future<Product> updateProduct(int id, Product product) async {
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

  Future<void> deleteProduct(int id) async {
    final response = await http.delete(Uri.parse('$baseUrl/products/$id'));

    if (response.statusCode != 200) {
      throw Exception('Failed to delete product');
    }
  }

  Future<Map<String, double>> getCustomerProductPrices(int customerId) async {
    final response = await http.get(Uri.parse('$baseUrl/bills/customer-prices?customerId=$customerId'));

    if (response.statusCode == 200) {
      Map<String, dynamic> body = jsonDecode(response.body);
      return body.map((key, value) => MapEntry(key, (value as num).toDouble()));
    } else {
      throw Exception('Failed to load customer product prices');
    }
  }

  Future<List<Bill>> getBills() async {
    final response = await http.get(Uri.parse('$baseUrl/bills'));

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Bill.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load bills');
    }
  }

  Future<Bill> getBill(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/bills/$id'));

    if (response.statusCode == 200) {
      return Bill.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load bill');
    }
  }

  Future<List<Bill>> getBillsByDateRange(String startDate, String endDate) async {
    final response = await http.get(Uri.parse('$baseUrl/bills/by-date-range?startDate=${Uri.encodeComponent(startDate)}&endDate=${Uri.encodeComponent(endDate)}'));

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Bill.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load bills by date range');
    }
  }

  Future<List<Bill>> searchBills(String customerName) async {
    final response = await http.get(Uri.parse('$baseUrl/bills/search?customerName=${Uri.encodeComponent(customerName)}'));

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Bill.fromJson(item)).toList();
    } else {
      throw Exception('Failed to search bills');
    }
  }

  Future<List<Bill>> searchBillsByProduct(String keyword) async {
    final response = await http.get(Uri.parse('$baseUrl/bills/search-by-product?keyword=${Uri.encodeComponent(keyword)}'));

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Bill.fromJson(item)).toList();
    } else {
      throw Exception('Failed to search bills by product');
    }
  }

  Future<Bill> createBill(Map<String, dynamic> billData) async {
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

  Future<Bill> updateBill(int id, Map<String, dynamic> billData) async {
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

  Future<void> downloadInvoicePdf(int id) async {
    // TODO: Implement PDF download
  }

  Future<List<Purchase>> getPurchases() async {
    final response = await http.get(Uri.parse('$baseUrl/purchases'));

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Purchase.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load purchases');
    }
  }

  Future<Purchase> getPurchase(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/purchases/$id'));

    if (response.statusCode == 200) {
      return Purchase.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load purchase');
    }
  }

  Future<List<Purchase>> getPurchasesByDateRange(String startDate, String endDate) async {
    final response = await http.get(Uri.parse('$baseUrl/purchases/by-date-range?startDate=${Uri.encodeComponent(startDate)}&endDate=${Uri.encodeComponent(endDate)}'));

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Purchase.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load purchases by date range');
    }
  }

  Future<List<Purchase>> searchPurchases(String supplierName) async {
    final response = await http.get(Uri.parse('$baseUrl/purchases/search?supplierName=${Uri.encodeComponent(supplierName)}'));

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Purchase.fromJson(item)).toList();
    } else {
      throw Exception('Failed to search purchases');
    }
  }

  Future<List<Purchase>> searchPurchasesByProduct(String keyword) async {
    final response = await http.get(Uri.parse('$baseUrl/purchases/search-by-product?keyword=${Uri.encodeComponent(keyword)}'));

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Purchase.fromJson(item)).toList();
    } else {
      throw Exception('Failed to search purchases by product');
    }
  }

  Future<Purchase> createPurchase(Map<String, dynamic> purchaseData) async {
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

  Future<List<Payment>> getCustomerPayments(int customerId) async {
    final response = await http.get(Uri.parse('$baseUrl/payments/customer/$customerId'));

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Payment.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load payments');
    }
  }

  Future<CustomerBalance> getCustomerBalance(int customerId) async {
    final response = await http.get(Uri.parse('$baseUrl/payments/customer/$customerId/balance'));

    if (response.statusCode == 200) {
      return CustomerBalance.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load customer balance');
    }
  }

  Future<Payment> createPayment(Map<String, dynamic> paymentData) async {
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

  Future<DashboardStats> getDashboardStats() async {
    final response = await http.get(Uri.parse('$baseUrl/dashboard/stats'));

    if (response.statusCode == 200) {
      return DashboardStats.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load dashboard stats');
    }
  }
}