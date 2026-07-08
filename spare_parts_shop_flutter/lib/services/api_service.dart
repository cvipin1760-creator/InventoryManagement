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
import '../models/login_response.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'sqlite_service.dart';

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
    print('=== Login Attempt ===');
    print('Base URL: $baseUrl');
    print('Username: $username');
    final url = Uri.parse('$baseUrl/auth/login');
    print('Request URL: $url');
    final requestBody = {'username': username.trim(), 'password': password.trim()};
    print('Request Body: $requestBody');
    final headers = await _getHeaders();
    print('Headers: $headers');
    
    try {
      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode(requestBody),
      );

      print('Response Status Code: ${response.statusCode}');
      print('Response Body: ${response.body}');

      if (response.statusCode == 200) {
        return LoginResponse.fromJson(jsonDecode(response.body));
      } else {
        try {
          final Map<String, dynamic> errorBody = jsonDecode(response.body);
          if (errorBody['message'] != null) {
            throw Exception(errorBody['message']);
          }
          throw Exception('Login failed with status code: ${response.statusCode}');
        } catch (e) {
          if (e is Exception) {
            rethrow;
          }
          throw Exception('Login failed with status code: ${response.statusCode}');
        }
      }
    } catch (e) {
      print('Login Error: $e');
      if (e.toString().contains('SocketException')) {
        throw Exception('Could not connect to server. Please check your internet connection.');
      }
      rethrow;
    }
  }

  Future<void> initAdmin() async {
    await http.post(
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
    
    final response = await http.get(Uri.parse('$baseUrl/customers'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      await SqliteService().cacheCustomers(body);
      return body.map((dynamic item) => Customer.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load customers');
    }
  }

  Future<Customer> getCustomer(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/customers/$id'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      return Customer.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load customer');
    }
  }

  Future<List<Customer>> searchCustomers(String keyword) async {
    final response = await http.get(
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
    final response = await http.post(
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
    final response = await http.put(
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
    final response = await http.delete(Uri.parse('$baseUrl/customers/$id'), headers: await _getHeaders());

    if (response.statusCode != 200) {
      throw Exception('Failed to delete customer');
    }
  }

  Future<List<Supplier>> getSuppliers() async {
    final response = await http.get(Uri.parse('$baseUrl/suppliers'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Supplier.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load suppliers');
    }
  }

  Future<Supplier> getSupplier(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/suppliers/$id'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      return Supplier.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load supplier');
    }
  }

  Future<List<Supplier>> searchSuppliers(String keyword) async {
    final response = await http.get(
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

    final response = await http.post(
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
    final response = await http.post(
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
    final response = await http.put(
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
    final response = await http.delete(Uri.parse('$baseUrl/suppliers/$id'), headers: await _getHeaders());

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
    
    final response = await http.get(Uri.parse('$baseUrl/products'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      await SqliteService().cacheProducts(body);
      return body.map((dynamic item) => Product.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load products');
    }
  }

  Future<Product> getProduct(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/products/$id'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      return Product.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load product');
    }
  }

  Future<List<Product>> getLowStockProducts() async {
    final response = await http.get(Uri.parse('$baseUrl/products/low-stock'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Product.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load low stock products');
    }
  }

  Future<List<Product>> searchProducts(String keyword) async {
    final response = await http.get(
      Uri.parse('$baseUrl/products/search?keyword=${Uri.encodeComponent(keyword)}'),
      headers: await _getHeaders(),
    );

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
    final response = await http.put(
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
    final response = await http.delete(Uri.parse('$baseUrl/products/$id'), headers: await _getHeaders());

    if (response.statusCode != 200) {
      throw Exception('Failed to delete product');
    }
  }

  Future<Map<String, double>> getCustomerProductPrices(int customerId) async {
    final response = await http.get(
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
    final response = await http.get(Uri.parse('$baseUrl/bills'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Bill.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load bills');
    }
  }

  Future<Bill> getBill(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/bills/$id'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      return Bill.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load bill');
    }
  }

  Future<List<Bill>> getBillsByDateRange(String startDate, String endDate) async {
    final response = await http.get(
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
    final response = await http.get(
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
    final response = await http.get(
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
    final response = await http.post(
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
    final response = await http.put(
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
    final response = await http.post(
      Uri.parse('$baseUrl/bills/$id/send-whatsapp?phone=${Uri.encodeComponent(phone)}'),
      headers: await _getHeaders(),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to send WhatsApp message: ${response.body}');
    }
  }

  Future<String> exportExcel() async {
    final response = await http.get(
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
    final response = await http.get(Uri.parse('$baseUrl/bills/templates'), headers: await _getHeaders());
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load bill templates');
    }
  }

  Future<dynamic> createBillTemplate(Map<String, dynamic> data) async {
    final response = await http.post(
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
    final response = await http.put(
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
    final response = await http.delete(Uri.parse('$baseUrl/bills/templates/$id'), headers: await _getHeaders());
    if (response.statusCode != 200) {
      throw Exception('Failed to delete bill template');
    }
  }

  // --- BRANCHES ---
  Future<List<dynamic>> getBranches() async {
    final response = await http.get(Uri.parse('$baseUrl/branches'), headers: await _getHeaders());
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to load branches');
  }

  Future<dynamic> createBranch(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/branches'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to create branch');
  }

  Future<dynamic> updateBranch(int id, Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl/branches/$id'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to update branch');
  }

  Future<void> deleteBranch(int id) async {
    final response = await http.delete(Uri.parse('$baseUrl/branches/$id'), headers: await _getHeaders());
    if (response.statusCode != 200) throw Exception('Failed to delete branch');
  }

  // --- STAFF ---
  Future<dynamic> createStaff(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/staff'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to create staff');
  }

  Future<dynamic> updateStaff(int id, Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl/auth/staff/$id'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to update staff');
  }

  // --- BUSINESS ---
  Future<dynamic> getBusiness() async {
    final response = await http.get(Uri.parse('$baseUrl/business'), headers: await _getHeaders());
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to get business info');
  }

  Future<dynamic> updateSubscription(int id, String subscriptionPlan) async {
    final response = await http.put(
      Uri.parse('$baseUrl/super-manager/businesses/$id/subscription'),
      headers: await _getHeaders(),
      body: jsonEncode({'subscriptionPlan': subscriptionPlan}),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to update subscription');
  }

  Future<dynamic> toggleSubscriptionStatus(int id, bool isActive) async {
    final response = await http.put(
      Uri.parse('$baseUrl/super-manager/businesses/$id/subscription/status'),
      headers: await _getHeaders(),
      body: jsonEncode({'isActive': isActive}),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to toggle subscription status');
  }

  // --- NOTIFICATIONS ---
  Future<List<dynamic>> getNotifications() async {
    final response = await http.get(Uri.parse('$baseUrl/notifications'), headers: await _getHeaders());
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to load notifications');
  }

  Future<int> getUnreadNotificationCount() async {
    final response = await http.get(Uri.parse('$baseUrl/notifications/unread/count'), headers: await _getHeaders());
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data is int ? data : (data['count'] ?? 0);
    }
    return 0; // Silently fail for badge
  }

  Future<void> markNotificationAsRead(int id) async {
    final response = await http.put(Uri.parse('$baseUrl/notifications/$id/read'), headers: await _getHeaders());
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
    final response = await http.get(Uri.parse('$baseUrl/purchases'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => Purchase.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load purchases');
    }
  }

  Future<Purchase> getPurchase(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/purchases/$id'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      return Purchase.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load purchase');
    }
  }

  Future<List<Purchase>> getPurchasesByDateRange(String startDate, String endDate) async {
    final response = await http.get(
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
    final response = await http.get(
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
    final response = await http.get(
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
    final response = await http.post(
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
    final response = await http.get(
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
    final response = await http.get(
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
    final response = await http.post(
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
    final response = await http.get(Uri.parse('$baseUrl/dashboard/stats'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      return DashboardStats.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load dashboard stats');
    }
  }

  Future<void> register(String username, String email, String password) async {
    final response = await http.post(
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
    final response = await http.post(
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
    final response = await http.get(Uri.parse('$baseUrl/auth/users'), headers: await _getHeaders());

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load users');
    }
  }

  Future<void> createUser(String username, String email, String password, String role, bool enabled) async {
    final response = await http.post(
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
    final response = await http.delete(Uri.parse('$baseUrl/auth/users/$id'), headers: await _getHeaders());

    if (response.statusCode != 200) {
      throw Exception('Failed to delete user');
    }
  }

  Future<void> updateUserRole(int id, String role) async {
    final response = await http.put(
      Uri.parse('$baseUrl/auth/users/$id/role?role=$role'),
      headers: await _getHeaders(),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to update role');
    }
  }

  Future<void> changePassword(String newPassword) async {
    final response = await http.post(
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
    final response = await http.get(Uri.parse('$baseUrl/predictive-analytics'), headers: await _getHeaders());
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load predictive analytics');
    }
  }

  Future<Map<String, dynamic>> getLoyaltyAccount(int customerId) async {
    final response = await http.get(Uri.parse('$baseUrl/loyalty/account/$customerId'), headers: await _getHeaders());
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load loyalty account');
    }
  }

  Future<String> exportTallyXml() async {
    final response = await http.get(Uri.parse('$baseUrl/exports/tally-xml'), headers: await _getHeaders());
    if (response.statusCode == 200) {
      return response.body;
    } else {
      throw Exception('Failed to export Tally XML');
    }
  }
}