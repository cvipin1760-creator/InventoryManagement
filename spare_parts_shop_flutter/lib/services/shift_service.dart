import '../core/constants/app_constants.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class ShiftService {
  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token') ?? '';
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Future<Map<String, dynamic>?> getCurrentShift() async {
    final baseUrl = AppConstants.baseUrl;
    final response = await http.get(
      Uri.parse('$baseUrl/shifts/current'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      if (response.body.isEmpty) return null;
      return json.decode(response.body);
    } else if (response.statusCode == 204) {
      return null;
    } else {
      throw Exception('Failed to get current shift');
    }
  }

  Future<Map<String, dynamic>> startShift(double openingBalance, String notes) async {
    final baseUrl = AppConstants.baseUrl;
    final response = await http.post(
      Uri.parse('$baseUrl/shifts/start'),
      headers: await _getHeaders(),
      body: json.encode({
        'openingBalance': openingBalance,
        'notes': notes,
      }),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to start shift');
    }
  }

  Future<Map<String, dynamic>> endShift(int shiftId, double closingBalance, String notes) async {
    final baseUrl = AppConstants.baseUrl;
    final response = await http.post(
      Uri.parse('$baseUrl/shifts/$shiftId/end'),
      headers: await _getHeaders(),
      body: json.encode({
        'closingBalance': closingBalance,
        'notes': notes,
      }),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to end shift');
    }
  }

  Future<Map<String, dynamic>> adjustCash(int shiftId, double amount, String type, String reason) async {
    final baseUrl = AppConstants.baseUrl;
    final response = await http.post(
      Uri.parse('$baseUrl/shifts/$shiftId/adjust-cash'),
      headers: await _getHeaders(),
      body: json.encode({
        'amount': amount,
        'type': type, // 'ADD' or 'REMOVE'
        'reason': reason,
      }),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to adjust cash');
    }
  }
}
