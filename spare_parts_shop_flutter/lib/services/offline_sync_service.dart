import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:http/http.dart' as http;
import 'sqlite_service.dart';
import '../core/database_helper.dart';
import 'api_service.dart';
import 'dart:convert';

class OfflineSyncService {
  static final OfflineSyncService _instance = OfflineSyncService._internal();
  factory OfflineSyncService() => _instance;
  OfflineSyncService._internal();

  final SqliteService _db = SqliteService();
  bool _isSyncing = false;

  void startListening() {
    Connectivity().onConnectivityChanged.listen((List<ConnectivityResult> results) {
      if (results.isNotEmpty && results.first != ConnectivityResult.none) {
        syncNow();
      }
    });
  }

  Future<void> syncNow() async {
    if (_isSyncing) return;
    _isSyncing = true;
    try {
      final requests = await _db.getQueuedRequests();
      for (var req in requests) {
        try {
          final method = req['method'];
          final endpoint = req['endpoint'];
          final bodyStr = req['body'];
          final headersStr = req['headers'];

          final headers = headersStr != null ? Map<String, String>.from(jsonDecode(headersStr)) : null;
          final uri = Uri.parse(endpoint);

          http.Response? response;
          if (method == 'POST') {
            response = await http.post(uri, headers: headers, body: bodyStr);
          } else if (method == 'PUT') {
            response = await http.put(uri, headers: headers, body: bodyStr);
          } else if (method == 'DELETE') {
            response = await http.delete(uri, headers: headers);
          }

          if (response != null && (response.statusCode >= 200 && response.statusCode < 300)) {
            await _db.deleteQueuedRequest(req['id']);
          }
        } catch (e) {
          // Keep in queue if it fails
          print('Sync failed for request ${req['id']}: $e');
        }
      }

      // Sync specific Offline Bills
      final offlineBills = await DatabaseHelper.instance.getOfflineBills();
      if (offlineBills.isNotEmpty) {
        final apiService = ApiService();
        for (var bill in offlineBills) {
          try {
            await apiService.createBillFromMap(bill['billData']);
            await DatabaseHelper.instance.deleteOfflineBill(bill['id']);
            print('Successfully synced offline bill ${bill['id']}');
          } catch (e) {
            print('Sync failed for offline bill ${bill['id']}: $e');
          }
        }
      }

    } finally {
      _isSyncing = false;
    }
  }
}
