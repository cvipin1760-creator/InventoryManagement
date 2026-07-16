import '../core/constants/app_constants.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class ApprovalService {
  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token') ?? '';
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Future<Map<String, dynamic>> requestApproval(String actionType, Map<String, dynamic> details) async {
    final baseUrl = AppConstants.baseUrl;
    final response = await http.post(
      Uri.parse('$baseUrl/approvals/request'),
      headers: await _getHeaders(),
      body: json.encode({
        'actionType': actionType,
        'detailsJson': json.encode(details),
      }),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to request approval');
    }
  }

  Future<List<dynamic>> getPendingRequests() async {
    final baseUrl = AppConstants.baseUrl;
    final response = await http.get(
      Uri.parse('$baseUrl/approvals/pending'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to get pending requests');
    }
  }

  Future<Map<String, dynamic>> resolveRequest(int requestId, bool approved) async {
    final baseUrl = AppConstants.baseUrl;
    final response = await http.post(
      Uri.parse('$baseUrl/approvals/$requestId/resolve'),
      headers: await _getHeaders(),
      body: json.encode({'approved': approved}),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to resolve request');
    }
  }

  Future<Map<String, dynamic>> checkStatus(int requestId) async {
    final baseUrl = AppConstants.baseUrl;
    final response = await http.get(
      Uri.parse('$baseUrl/approvals/$requestId/status'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to check request status');
    }
  }
}
