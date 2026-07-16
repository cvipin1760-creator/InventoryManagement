import '../core/constants/app_constants.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class QueueService {
  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token') ?? '';
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Future<List<dynamic>> getCounters() async {
    final baseUrl = AppConstants.baseUrl;
    final response = await http.get(
      Uri.parse('$baseUrl/queue/counters'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to get counters');
    }
  }

  Future<Map<String, dynamic>> createCounter(String name) async {
    final baseUrl = AppConstants.baseUrl;
    final response = await http.post(
      Uri.parse('$baseUrl/queue/counters'),
      headers: await _getHeaders(),
      body: json.encode({'name': name}),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to create counter');
    }
  }

  Future<Map<String, dynamic>> assignCashier(int counterId) async {
    final baseUrl = AppConstants.baseUrl;
    final response = await http.post(
      Uri.parse('$baseUrl/queue/counters/$counterId/assign'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to assign cashier');
    }
  }

  Future<Map<String, dynamic>> closeCounter(int counterId) async {
    final baseUrl = AppConstants.baseUrl;
    final response = await http.post(
      Uri.parse('$baseUrl/queue/counters/$counterId/close'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to close counter');
    }
  }

  Future<Map<String, dynamic>> joinQueue(int counterId, String customerName) async {
    final baseUrl = AppConstants.baseUrl;
    final response = await http.post(
      Uri.parse('$baseUrl/queue/counters/$counterId/join'),
      headers: await _getHeaders(),
      body: json.encode({'customerName': customerName}),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to join queue');
    }
  }

  Future<List<dynamic>> getQueueForCounter(int counterId) async {
    final baseUrl = AppConstants.baseUrl;
    final response = await http.get(
      Uri.parse('$baseUrl/queue/counters/$counterId/entries'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to get queue entries');
    }
  }

  Future<Map<String, dynamic>> serveNext(int counterId) async {
    final baseUrl = AppConstants.baseUrl;
    final response = await http.post(
      Uri.parse('$baseUrl/queue/counters/$counterId/serve'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to serve next customer');
    }
  }

  Future<Map<String, dynamic>> completeService(int queueId) async {
    final baseUrl = AppConstants.baseUrl;
    final response = await http.post(
      Uri.parse('$baseUrl/queue/entries/$queueId/complete'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to complete service');
    }
  }
}
