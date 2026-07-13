import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import 'package:stock_pilot/core/constants/app_constants.dart';
import '../models/customer.dart';
import '../models/supplier.dart';
import '../models/product.dart';
import '../models/bill.dart';
import '../models/purchase.dart';
import '../models/payment.dart';
import '../models/customer_balance.dart';
import '../models/dashboard_stats.dart';
import '../models/admin_dashboard_response.dart';
import '../models/detailed_analytics_response.dart';
import '../models/login_response.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'sqlite_service.dart';
import '../core/exceptions/payment_required_exception.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart' show FlutterSecureStorage;
import 'package:shared_preferences/shared_preferences.dart';
import '../core/navigator_key.dart';

class ApiService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  String get baseUrl => AppConstants.baseUrl;

  static Future<void> loadBaseUrl() async {
    const storage = FlutterSecureStorage();
    final url = await storage.read(key: 'custom_base_url');
    if (url != null && url.isNotEmpty) {
      AppConstants.baseUrl = url;
    }
  }

  Future<void> setBaseUrl(String newUrl) async {
    await _storage.write(key: 'custom_base_url', value: newUrl);
    AppConstants.baseUrl = newUrl;
  }

  Future<Map<String, String>> _getHeaders() async {
    final token = await _storage.read(key: AppConstants.storageKeyToken);
    final branchId = await _storage.read(key: 'active_branch_id');
    final headers = {'Content-Type': 'application/json'};
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    if (branchId != null && branchId.isNotEmpty) {
      headers['X-Branch-ID'] = branchId;
    }
    return headers;
  }
  
  Future<LoginResponse> login(String username, String password) async {
    final url = Uri.parse('$baseUrl/auth/login');
    final requestBody = {'username': username.trim(), 'password': password.trim()};
    
    // _post automatically handles logging, headers, and error checking
    final response = await _post(url, body: jsonEncode(requestBody));
    return LoginResponse.fromJson(jsonDecode(response.body));
  }

  Future<void> initAdmin() async {
    await _post(
      Uri.parse('$baseUrl/auth/init-admin'),
      headers: await _getHeaders(),
    );
  }

  Future<List<Customer>> getCustomers() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    if (connectivityResult.isNotEmpty && connectivityResult.first == ConnectivityResult.none) {
      final cached = await SqliteService().getCachedCustomers();
      return cached.map((dynamic item) => Customer.fromJson(item)).toList();
    }
    
    final response = await _get(Uri.parse('$baseUrl/customers'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      await SqliteService().cacheCustomers(body);
      return body.map((dynamic item) => Customer.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load customers');
    }
  }

  Future<Customer> getCustomer(int id) async {
    final response = await _get(Uri.parse('$baseUrl/customers/$id'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      return Customer.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load customer');
    }
  }

  Future<List<Customer>> searchCustomers(String keyword) async {
    final response = await _get(
      Uri.parse('$baseUrl/customers/search?keyword=${Uri.encodeComponent(keyword)}'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Customer.fromJson(item)).toList();
    } else {
      throw Exception('Failed to search customers');
    }
  }

  Future<Customer> createCustomer(Customer customer) async {
    final response = await _post(
      Uri.parse('$baseUrl/customers'),
      headers: await _getHeaders(),
      body: jsonEncode(customer.toJson()..remove('id')..remove('createdAt')),
    );

    if (response.statusCode == 200) {
      return Customer.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to create customer');
    }
  }

  Future<Customer> updateCustomer(int id, Customer customer) async {
    final response = await _put(
      Uri.parse('$baseUrl/customers/$id'),
      headers: await _getHeaders(),
      body: jsonEncode(customer.toJson()),
    );

    if (response.statusCode == 200) {
      return Customer.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to update customer');
    }
  }

  Future<void> deleteCustomer(int id) async {
    final response = await _delete(Uri.parse('$baseUrl/customers/$id'), headers: await _getHeaders());

    if (response.statusCode != 200) {
      throw Exception('Failed to delete customer');
    }
  }

  Future<List<Supplier>> getSuppliers() async {
    final response = await _get(Uri.parse('$baseUrl/suppliers'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Supplier.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load suppliers');
    }
  }

  Future<Supplier> getSupplier(int id) async {
    final response = await _get(Uri.parse('$baseUrl/suppliers/$id'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      return Supplier.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load supplier');
    }
  }

  Future<List<Supplier>> searchSuppliers(String keyword) async {
    final response = await _get(
      Uri.parse('$baseUrl/suppliers/search?keyword=${Uri.encodeComponent(keyword)}'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Supplier.fromJson(item)).toList();
    } else {
      throw Exception('Failed to search suppliers');
    }
  }

  Future<Bill> createBill(Bill bill) async {
    final body = jsonEncode(bill.toJson()..remove('id')..remove('createdAt'));
    final headers = await _getHeaders();
    final url = '$baseUrl/bills';
    
    final connectivityResult = await Connectivity().checkConnectivity();
    if (connectivityResult.isNotEmpty && connectivityResult.first == ConnectivityResult.none) {
      await SqliteService().queueRequest('POST', url, jsonDecode(body), headers);
      // Return a dummy bill to keep the UI happy
      return Bill(
        id: DateTime.now().millisecondsSinceEpoch,
        invoiceNumber: 'OFFLINE-${DateTime.now().millisecondsSinceEpoch}',
        billDate: DateTime.now().toIso8601String(),
        customer: bill.customer,
        items: bill.items,
        subtotal: bill.subtotal,
        discount: bill.discount,
        gstType: bill.gstType,
        gstAmount: bill.gstAmount,
        finalAmount: bill.finalAmount,
      );
    }

    final response = await _post(
      Uri.parse(url),
      headers: headers,
      body: body,
    );

    if (response.statusCode == 200) {
      return Bill.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to create bill: ${response.body}');
    }
  }

  Future<Supplier> createSupplier(Supplier supplier) async {
    final response = await _post(
      Uri.parse('$baseUrl/suppliers'),
      headers: await _getHeaders(),
      body: jsonEncode(supplier.toJson()..remove('id')..remove('createdAt')),
    );

    if (response.statusCode == 200) {
      return Supplier.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to create supplier');
    }
  }

  Future<Supplier> updateSupplier(int id, Supplier supplier) async {
    final response = await _put(
      Uri.parse('$baseUrl/suppliers/$id'),
      headers: await _getHeaders(),
      body: jsonEncode(supplier.toJson()),
    );

    if (response.statusCode == 200) {
      return Supplier.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to update supplier');
    }
  }

  Future<void> deleteSupplier(int id) async {
    final response = await _delete(Uri.parse('$baseUrl/suppliers/$id'), headers: await _getHeaders());

    if (response.statusCode != 200) {
      throw Exception('Failed to delete supplier');
    }
  }

  Future<List<Product>> getProducts() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    if (connectivityResult.isNotEmpty && connectivityResult.first == ConnectivityResult.none) {
      final cached = await SqliteService().getCachedProducts();
      return cached.map((dynamic item) => Product.fromJson(item)).toList();
    }
    
    final response = await _get(Uri.parse('$baseUrl/products'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      dynamic decoded = jsonDecode(response.body);
      List<dynamic> body = decoded is Map<String, dynamic> && decoded.containsKey('content') ? decoded['content'] : decoded;
      await SqliteService().cacheProducts(body);
      return body.map((dynamic item) => Product.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load products');
    }
  }

  Future<Product> getProduct(int id) async {
    final response = await _get(Uri.parse('$baseUrl/products/$id'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      return Product.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load product');
    }
  }

  Future<List<Product>> getLowStockProducts() async {
    final response = await _get(Uri.parse('$baseUrl/products/low-stock'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      dynamic decoded = jsonDecode(response.body);
      List<dynamic> body = decoded is Map<String, dynamic> && decoded.containsKey('content') ? decoded['content'] : decoded;
      return body.map((dynamic item) => Product.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load low stock products');
    }
  }

  Future<List<Product>> searchProducts(String keyword) async {
    final response = await _get(
      Uri.parse('$baseUrl/products/search?keyword=${Uri.encodeComponent(keyword)}'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      dynamic decoded = jsonDecode(response.body);
      List<dynamic> body = decoded is Map<String, dynamic> && decoded.containsKey('content') ? decoded['content'] : decoded;
      return body.map((dynamic item) => Product.fromJson(item)).toList();
    } else {
      throw Exception('Failed to search products');
    }
  }

  Future<Product> createProduct(Product product) async {
    final response = await _post(
      Uri.parse('$baseUrl/products'),
      headers: await _getHeaders(),
      body: jsonEncode(product.toJson()..remove('id')..remove('createdAt')..remove('updatedAt')),
    );

    if (response.statusCode == 200) {
      return Product.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to create product');
    }
  }

  Future<Product> updateProduct(int id, Product product) async {
    final response = await _put(
      Uri.parse('$baseUrl/products/$id'),
      headers: await _getHeaders(),
      body: jsonEncode(product.toJson()),
    );

    if (response.statusCode == 200) {
      return Product.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to update product');
    }
  }

  Future<void> deleteProduct(int id) async {
    final response = await _delete(Uri.parse('$baseUrl/products/$id'), headers: await _getHeaders());

    if (response.statusCode != 200) {
      throw Exception('Failed to delete product');
    }
  }

  Future<Map<String, double>> getCustomerProductPrices(int customerId) async {
    final response = await _get(
      Uri.parse('$baseUrl/bills/customer-prices?customerId=$customerId'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      Map<String, dynamic> body = jsonDecode(response.body);
      return body.map((key, value) => MapEntry(key, (value as num).toDouble()));
    } else {
      throw Exception('Failed to load customer product prices');
    }
  }

  Future<List<Bill>> getBills() async {
    final response = await _get(Uri.parse('$baseUrl/bills'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Bill.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load bills');
    }
  }

  Future<Bill> getBill(int id) async {
    final response = await _get(Uri.parse('$baseUrl/bills/$id'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      return Bill.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load bill');
    }
  }

  Future<List<Bill>> getBillsByDateRange(String startDate, String endDate) async {
    final response = await _get(
      Uri.parse('$baseUrl/bills/by-date-range?startDate=${Uri.encodeComponent(startDate)}&endDate=${Uri.encodeComponent(endDate)}'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Bill.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load bills by date range');
    }
  }

  Future<List<Bill>> searchBills(String customerName) async {
    final response = await _get(
      Uri.parse('$baseUrl/bills/search?customerName=${Uri.encodeComponent(customerName)}'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Bill.fromJson(item)).toList();
    } else {
      throw Exception('Failed to search bills');
    }
  }

  Future<List<Bill>> searchBillsByProduct(String keyword) async {
    final response = await _get(
      Uri.parse('$baseUrl/bills/search-by-product?keyword=${Uri.encodeComponent(keyword)}'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Bill.fromJson(item)).toList();
    } else {
      throw Exception('Failed to search bills by product');
    }
  }

  Future<Bill> createBillFromMap(Map<String, dynamic> billData) async {
    final response = await _post(
      Uri.parse('$baseUrl/bills'),
      headers: await _getHeaders(),
      body: jsonEncode(billData),
    );

    if (response.statusCode == 200) {
      return Bill.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to create bill');
    }
  }

  Future<Bill> updateBill(int id, Map<String, dynamic> billData) async {
    final response = await _put(
      Uri.parse('$baseUrl/bills/$id'),
      headers: await _getHeaders(),
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

  Future<void> sendBillViaWhatsApp(int id, String phone) async {
    final response = await _post(
      Uri.parse('$baseUrl/bills/$id/send-whatsapp?phone=${Uri.encodeComponent(phone)}'),
      headers: await _getHeaders(),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to send WhatsApp message: ${response.body}');
    }
  }

  Future<String> exportExcel() async {
    final response = await _get(
      Uri.parse('$baseUrl/products/export-excel'),
      headers: await _getHeaders(),
    );
    if (response.statusCode == 200) {
      return response.body; // or save bytes to file
    } else {
      throw Exception('Failed to export Excel');
    }
  }

  Future<String> uploadExcel(dynamic file) async {
    final request = http.MultipartRequest('POST', Uri.parse('$baseUrl/products/upload-excel'));
    final token = await _storage.read(key: AppConstants.storageKeyToken);
    if (token != null && token.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    
    if (file is XFile) {
      request.files.add(await http.MultipartFile.fromPath('file', file.path));
    } else if (file is PlatformFile) {
      if (file.path != null) {
        request.files.add(await http.MultipartFile.fromPath('file', file.path!));
      } else if (file.bytes != null) {
        request.files.add(http.MultipartFile.fromBytes('file', file.bytes!, filename: file.name));
      }
    }
    
    final response = await request.send();
    if (response.statusCode == 200) {
      final resBody = await response.stream.bytesToString();
      return resBody;
    } else {
      throw Exception('Failed to upload Excel');
    }
  }

  Future<List<dynamic>> getBillTemplates() async {
    final response = await _get(Uri.parse('$baseUrl/bills/templates'), headers: await _getHeaders());
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load bill templates');
    }
  }

  Future<dynamic> createBillTemplate(Map<String, dynamic> data) async {
    final response = await _post(
      Uri.parse('$baseUrl/bills/templates'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create bill template');
    }
  }

  Future<dynamic> updateBillTemplate(int id, Map<String, dynamic> data) async {
    final response = await _put(
      Uri.parse('$baseUrl/bills/templates/$id'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to update bill template');
    }
  }

  Future<void> deleteBillTemplate(int id) async {
    final response = await _delete(Uri.parse('$baseUrl/bills/templates/$id'), headers: await _getHeaders());
    if (response.statusCode != 200) {
      throw Exception('Failed to delete bill template');
    }
  }

  // --- BRANCHES ---
  Future<List<dynamic>> getBranches() async {
    final response = await _get(Uri.parse('$baseUrl/branches'), headers: await _getHeaders());
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to load branches');
  }

  Future<dynamic> createBranch(Map<String, dynamic> data) async {
    final response = await _post(
      Uri.parse('$baseUrl/branches'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to create branch');
  }

  Future<dynamic> updateBranch(int id, Map<String, dynamic> data) async {
    final response = await _put(
      Uri.parse('$baseUrl/branches/$id'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to update branch');
  }

  Future<void> deleteBranch(int id) async {
    final response = await _delete(Uri.parse('$baseUrl/branches/$id'), headers: await _getHeaders());
    if (response.statusCode != 200) throw Exception('Failed to delete branch');
  }

  // --- STAFF ---
  Future<dynamic> createStaff(Map<String, dynamic> data) async {
    final response = await _post(
      Uri.parse('$baseUrl/auth/users'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to create staff');
  }

  Future<dynamic> updateStaff(int id, Map<String, dynamic> data) async {
    final response = await _put(
      Uri.parse('$baseUrl/auth/users/$id'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to update staff');
  }

  // --- STOCK TRANSFERS ---
  Future<List<dynamic>> getStockTransfers() async {
    final response = await _get(Uri.parse('$baseUrl/stock-transfers'), headers: await _getHeaders());
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to load stock transfers');
  }

  Future<dynamic> createStockTransfer(Map<String, dynamic> data) async {
    final response = await _post(
      Uri.parse('$baseUrl/stock-transfers'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to create stock transfer');
  }

  Future<dynamic> updateStockTransferStatus(int id, String status) async {
    final response = await _put(
      Uri.parse('$baseUrl/stock-transfers/$id/status'),
      headers: await _getHeaders(),
      body: jsonEncode({'status': status}),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to update stock transfer status');
  }

  // --- BUSINESS ---
  Future<dynamic> getBusiness() async {
    final response = await _get(Uri.parse('$baseUrl/business'), headers: await _getHeaders());
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to get business info');
  }

  Future<dynamic> updateSubscription(int id, String subscriptionPlan) async {
    final response = await _put(
      Uri.parse('$baseUrl/super-manager/businesses/$id/subscription'),
      headers: await _getHeaders(),
      body: jsonEncode({'subscriptionPlan': subscriptionPlan}),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to update subscription');
  }

  Future<dynamic> toggleSubscriptionStatus(int id, bool isActive) async {
    final response = await _put(
      Uri.parse('$baseUrl/super-manager/businesses/$id/subscription/status'),
      headers: await _getHeaders(),
      body: jsonEncode({'isActive': isActive}),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to toggle subscription status');
  }

  // --- NOTIFICATIONS ---
  Future<List<dynamic>> getNotifications() async {
    final response = await _get(Uri.parse('$baseUrl/notifications'), headers: await _getHeaders());
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to load notifications');
  }

  Future<int> getUnreadNotificationCount() async {
    final response = await _get(Uri.parse('$baseUrl/notifications/unread/count'), headers: await _getHeaders());
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data is int ? data : (data['count'] ?? 0);
    }
    return 0; // Silently fail for badge
  }

  Future<void> markNotificationAsRead(int id) async {
    final response = await _put(Uri.parse('$baseUrl/notifications/$id/read'), headers: await _getHeaders());
    if (response.statusCode != 200) throw Exception('Failed to mark notification as read');
  }

  Future<String> uploadBillAttachment(dynamic file) async {
    final request = http.MultipartRequest('POST', Uri.parse('$baseUrl/bills/upload'));
    final token = await _storage.read(key: AppConstants.storageKeyToken);
    if (token != null && token.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    
    if (file is XFile) {
      request.files.add(await http.MultipartFile.fromPath('file', file.path));
    } else if (file is PlatformFile) {
      if (file.path != null) {
        request.files.add(await http.MultipartFile.fromPath('file', file.path!));
      } else if (file.bytes != null) {
        request.files.add(http.MultipartFile.fromBytes('file', file.bytes!, filename: file.name));
      }
    }
    
    final response = await request.send();
    if (response.statusCode == 200) {
      return await response.stream.bytesToString();
    } else {
      throw Exception('Failed to upload attachment');
    }
  }

  Future<List<Purchase>> getPurchases() async {
    final response = await _get(Uri.parse('$baseUrl/purchases'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Purchase.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load purchases');
    }
  }

  Future<Purchase> getPurchase(int id) async {
    final response = await _get(Uri.parse('$baseUrl/purchases/$id'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      return Purchase.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load purchase');
    }
  }

  Future<List<Purchase>> getPurchasesByDateRange(String startDate, String endDate) async {
    final response = await _get(
      Uri.parse('$baseUrl/purchases/by-date-range?startDate=${Uri.encodeComponent(startDate)}&endDate=${Uri.encodeComponent(endDate)}'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Purchase.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load purchases by date range');
    }
  }

  Future<List<Purchase>> searchPurchases(String supplierName) async {
    final response = await _get(
      Uri.parse('$baseUrl/purchases/search?supplierName=${Uri.encodeComponent(supplierName)}'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Purchase.fromJson(item)).toList();
    } else {
      throw Exception('Failed to search purchases');
    }
  }

  Future<List<Purchase>> searchPurchasesByProduct(String keyword) async {
    final response = await _get(
      Uri.parse('$baseUrl/purchases/search-by-product?keyword=${Uri.encodeComponent(keyword)}'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Purchase.fromJson(item)).toList();
    } else {
      throw Exception('Failed to search purchases by product');
    }
  }

  Future<Purchase> createPurchase(Map<String, dynamic> purchaseData) async {
    final response = await _post(
      Uri.parse('$baseUrl/purchases'),
      headers: await _getHeaders(),
      body: jsonEncode(purchaseData),
    );

    if (response.statusCode == 200) {
      return Purchase.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to create purchase');
    }
  }

  Future<List<Payment>> getCustomerPayments(int customerId) async {
    final response = await _get(
      Uri.parse('$baseUrl/payments/customer/$customerId'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Payment.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load payments');
    }
  }

  Future<CustomerBalance> getCustomerBalance(int customerId) async {
    final response = await _get(
      Uri.parse('$baseUrl/payments/customer/$customerId/balance'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      return CustomerBalance.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load customer balance');
    }
  }

  Future<Payment> createPayment(Map<String, dynamic> paymentData) async {
    final response = await _post(
      Uri.parse('$baseUrl/payments'),
      headers: await _getHeaders(),
      body: jsonEncode(paymentData),
    );

    if (response.statusCode == 200) {
      return Payment.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to create payment');
    }
  }

  Future<DashboardStats> getDashboardStats() async {
    final response = await _get(Uri.parse('$baseUrl/dashboard/stats'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      return DashboardStats.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load dashboard stats');
    }
  }

  Future<DetailedAnalyticsResponse> getFullAnalytics() async {
    final response = await _get(Uri.parse('$baseUrl/analytics/full'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      return DetailedAnalyticsResponse.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load full analytics');
    }
  }

  Future<AdminDashboardResponse> getAdminDashboard() async {
    final response = await _get(Uri.parse('$baseUrl/analytics/admin-dashboard'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      return AdminDashboardResponse.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load admin dashboard');
    }
  }

  Future<List<dynamic>> getMyBills() async {
    final response = await _get(Uri.parse('$baseUrl/customers/me/bills'), headers: await _getHeaders());
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load customer bills');
  }

  Future<List<dynamic>> getMyWarranties() async {
    final response = await _get(Uri.parse('$baseUrl/warranties/me'), headers: await _getHeaders());
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load warranties');
  }

  Future<List<dynamic>> getMyEmis() async {
    final response = await _get(Uri.parse('$baseUrl/emis/me'), headers: await _getHeaders());
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load EMIs');
  }

  Future<void> register(String username, String email, String password) async {
    final response = await _post(
      Uri.parse('$baseUrl/auth/register'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'username': username,
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception(response.body);
    }
  }

  Future<void> verifyOtp(String email, String otp) async {
    final response = await _post(
      Uri.parse('$baseUrl/auth/verify-otp'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'email': email,
        'otp': otp,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception(response.body);
    }
  }

  Future<void> resendOtp(String email) async {
    final request = http.MultipartRequest('POST', Uri.parse('$baseUrl/auth/resend-otp'));
    request.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    request.fields['email'] = email;
    final token = await _storage.read(key: AppConstants.storageKeyToken);
    if (token != null && token.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $token';
    }

    final response = await request.send();
    if (response.statusCode != 200) {
      throw Exception(await response.stream.bytesToString());
    }
  }

  Future<List<dynamic>> getUsers() async {
    final response = await _get(Uri.parse('$baseUrl/auth/users'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load users');
    }
  }

  Future<void> createUser(String username, String email, String password, String role, bool enabled) async {
    final response = await _post(
      Uri.parse('$baseUrl/auth/users'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'username': username,
        'email': email,
        'password': password,
        'role': role,
        'enabled': enabled,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception(response.body);
    }
  }

  Future<void> deleteUser(int id) async {
    final response = await _delete(Uri.parse('$baseUrl/auth/users/$id'), headers: await _getHeaders());

    if (response.statusCode != 200) {
      throw Exception('Failed to delete user');
    }
  }

  Future<void> updateUserRole(int id, String role) async {
    final response = await _put(
      Uri.parse('$baseUrl/auth/users/$id/role?role=$role'),
      headers: await _getHeaders(),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to update role');
    }
  }

  Future<void> changePassword(String newPassword) async {
    final response = await _post(
      Uri.parse('$baseUrl/auth/change-password'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'newPassword': newPassword,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception(response.body);
    }
  }

  // SaaS Features

  Future<Map<String, dynamic>> getPredictiveAnalytics() async {
    final response = await _get(Uri.parse('$baseUrl/analytics/predictive'), headers: await _getHeaders());
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load predictive analytics');
    }
  }

  Future<Map<String, dynamic>> getLoyaltyAccount(int customerId) async {
    final response = await _get(Uri.parse('$baseUrl/loyalty/account/$customerId'), headers: await _getHeaders());
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load loyalty account');
    }
  }

  // --- WARRANTIES ---
  Future<List<dynamic>> getWarranties() async {
    final response = await _get(Uri.parse('$baseUrl/warranties'), headers: await _getHeaders());
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to load warranties');
  }

  // --- EMIs ---
  Future<List<dynamic>> getEmis() async {
    final response = await _get(Uri.parse('$baseUrl/emis'), headers: await _getHeaders());
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to load EMIs');
  }

  // --- MARKETING ---
  Future<dynamic> sendBulkWhatsApp(Map<String, dynamic> data) async {
    final response = await _post(
      Uri.parse('$baseUrl/marketing/whatsapp/bulk'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to send bulk WhatsApp');
  }

  Future<dynamic> sendBulkSMS(Map<String, dynamic> data) async {
    final response = await _post(
      Uri.parse('$baseUrl/marketing/sms/bulk'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to send bulk SMS');
  }

  // --- ADMIN NOTIFICATIONS ---
  Future<dynamic> sendAdminNotification(Map<String, dynamic> data) async {
    final response = await _post(
      Uri.parse('$baseUrl/notifications/send'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to send notification');
  }

  // --- Tally Export ---
  Future<String> exportTallyXml({String? startDate, String? endDate}) async {
    final start = startDate ?? DateTime.now().subtract(const Duration(days: 30)).toIso8601String().substring(0, 19);
    final end = endDate ?? DateTime.now().toIso8601String().substring(0, 19);
    final res = await _get(
      Uri.parse('$baseUrl/export/tally?startDate=$start&endDate=$end'),
      headers: await _getHeaders(),
    );
    return res.body;
  }

  // --- QuickBooks Export ---
  Future<String> exportQuickBooksCsv({String? startDate, String? endDate}) async {
    final start = startDate ?? DateTime.now().subtract(const Duration(days: 30)).toIso8601String().substring(0, 19);
    final end = endDate ?? DateTime.now().toIso8601String().substring(0, 19);
    final res = await _get(
      Uri.parse('$baseUrl/export/quickbooks?startDate=$start&endDate=$end'),
      headers: await _getHeaders(),
    );
    return res.body;
  }
  
  // --- B2B Portal ---
  Future<dynamic> b2bLogin(String username, String password) async {
    final res = await _post(
      Uri.parse('$baseUrl/b2b/login'),
      body: jsonEncode({'username': username, 'password': password}),
    );
    return jsonDecode(res.body);
  }
  
  Future<List<Product>> getB2bProducts(int businessId) async {
    final res = await _get(Uri.parse('$baseUrl/b2b/$businessId/products'));
    final data = jsonDecode(res.body);
    List items = data is Map && data.containsKey('content') ? data['content'] : data;
    return items.map((e) => Product.fromJson(e)).toList();
  }
  
  Future<dynamic> b2bPurchase(int businessId, Map<String, dynamic> purchaseData) async {
    final res = await _post(
      Uri.parse('$baseUrl/b2b/$businessId/purchase'),
      body: jsonEncode(purchaseData),
    );
    return jsonDecode(res.body);
  }
  
  // --- Purchase Orders ---
  Future<List<dynamic>> getPurchaseOrders() async {
    final res = await _get(Uri.parse('$baseUrl/purchase-orders'), headers: await _getHeaders());
    final data = jsonDecode(res.body);
    return data is Map && data.containsKey('content') ? data['content'] : data;
  }
  
  Future<dynamic> autoGeneratePurchaseOrders() async {
    final res = await _post(Uri.parse('$baseUrl/purchase-orders/auto'), headers: await _getHeaders());
    return jsonDecode(res.body);
  }
  
  Future<dynamic> updatePurchaseOrderStatus(int id, String status) async {
    final res = await _put(
      Uri.parse('$baseUrl/purchase-orders/$id/status'),
      headers: await _getHeaders(),
      body: jsonEncode({'status': status}),
    );
    return jsonDecode(res.body);
  }
  
  // --- Audit Tasks ---
  Future<List<dynamic>> getAuditTasks() async {
    final res = await _get(Uri.parse('$baseUrl/audit-tasks'), headers: await _getHeaders());
    final data = jsonDecode(res.body);
    return data is Map && data.containsKey('content') ? data['content'] : data;
  }
  
  Future<dynamic> createAuditTask(Map<String, dynamic> task) async {
    final res = await _post(
      Uri.parse('$baseUrl/audit-tasks'),
      headers: await _getHeaders(),
      body: jsonEncode(task),
    );
    return jsonDecode(res.body);
  }
  
  Future<dynamic> updateAuditTask(int id, Map<String, dynamic> task) async {
    final res = await _put(
      Uri.parse('$baseUrl/audit-tasks/$id'),
      headers: await _getHeaders(),
      body: jsonEncode(task),
    );
    return jsonDecode(res.body);
  }

  Future<http.Response> _get(Uri url, {Map<String, String>? headers}) async {
    return _request('GET', url, headers: headers);
  }

  Future<http.Response> _post(Uri url, {Map<String, String>? headers, Object? body, Encoding? encoding}) async {
    return _request('POST', url, headers: headers, body: body, encoding: encoding);
  }

  Future<http.Response> _put(Uri url, {Map<String, String>? headers, Object? body, Encoding? encoding}) async {
    return _request('PUT', url, headers: headers, body: body, encoding: encoding);
  }

  Future<http.Response> _delete(Uri url, {Map<String, String>? headers, Object? body, Encoding? encoding}) async {
    return _request('DELETE', url, headers: headers, body: body, encoding: encoding);
  }

  Future<http.Response> _request(
    String method,
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Encoding? encoding,
  }) async {
    final defaultHeaders = await _getHeaders();
    if (headers != null) {
      defaultHeaders.addAll(headers);
    }
    
    final safeHeaders = Map<String, String>.from(defaultHeaders);
    if (safeHeaders.containsKey('Authorization')) {
      safeHeaders['Authorization'] = 'Bearer [MASKED]';
    }
    
    print('=== API Request ===');
    print('URL: $url');
    print('Method: $method');
    print('Headers: $safeHeaders');
    if (body != null) print('Body: $body');

    http.Response response;
    try {
      switch (method.toUpperCase()) {
        case 'GET':
          response = await http.get(url, headers: defaultHeaders);
          break;
        case 'POST':
          response = await http.post(url, headers: defaultHeaders, body: body, encoding: encoding);
          break;
        case 'PUT':
          response = await http.put(url, headers: defaultHeaders, body: body, encoding: encoding);
          break;
        case 'DELETE':
          response = await http.delete(url, headers: defaultHeaders, body: body, encoding: encoding);
          break;
        default:
          throw Exception('Unsupported HTTP method: $method');
      }
    } catch (e) {
      print('Network Error: $e');
      if (e.toString().contains('SocketException') || e.toString().contains('ClientException') || e.toString().contains('Failed host lookup')) {
        throw Exception('Could not connect to server. Please check your internet connection.');
      }
      rethrow;
    }

    print('=== API Response ===');
    print('Status: ${response.statusCode}');
    if (response.body.length > 500) {
       print('Body: ${response.body.substring(0, 500)}... (truncated)');
    } else {
       print('Body: ${response.body}');
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response;
    } else {
      String errorMessage = 'Request failed with status: ${response.statusCode}';
      try {
        final Map<String, dynamic> errorBody = jsonDecode(response.body);
        if (errorBody['message'] != null) {
          errorMessage = errorBody['message'];
        }
      } catch (_) {}
      
      switch (response.statusCode) {
        case 401:
        case 403:
          // Token expired or forbidden — clear credentials and redirect to login
          await _clearStorageAndLogout();
          throw Exception('Session expired. Please log in again.');
        case 402:
          throw PaymentRequiredException('Payment Required: $errorMessage');
        case 404:
          throw Exception('Not Found: $errorMessage');
        case 500:
          throw Exception('Server Error: $errorMessage');
        default:
          throw Exception(errorMessage);
      }
    }
  }
  Future<void> _clearStorageAndLogout() async {
    try {
      const storage = FlutterSecureStorage();
      await storage.delete(key: AppConstants.storageKeyToken);
      await storage.delete(key: 'role');
      await storage.delete(key: 'userId');
      await storage.delete(key: 'businessId');
      await storage.delete(key: 'active_branch_id');
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
    } catch (_) {}
    // Navigate to login from anywhere in the app
    navigatorKey.currentState?.pushNamedAndRemoveUntil('/login', (_) => false);
  }
}
