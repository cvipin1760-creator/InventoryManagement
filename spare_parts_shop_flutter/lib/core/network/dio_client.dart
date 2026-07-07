import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:stock_pilot/core/constants/app_constants.dart';

class DioClient {
  final Dio _dio = Dio();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  DioClient() {
    _dio
      ..options.baseUrl = AppConstants.baseUrl
      ..options.connectTimeout = AppConstants.apiTimeout
      ..options.receiveTimeout = AppConstants.apiTimeout
      ..options.responseType = ResponseType.plain
      ..interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) async {
            if (kDebugMode) {
              print('========== API REQUEST ==========');
              print('Method: ${options.method}');
              print('URL: ${options.uri}');
              print('Headers: ${jsonEncode(options.headers)}');
              print('Data: ${jsonEncode(options.data)}');
              print('=================================');
            }
            // Add Token to Headers
            final token = await _storage.read(key: AppConstants.storageKeyToken);
            if (token != null && token.isNotEmpty) {
              options.headers['Authorization'] = 'Bearer $token';
            }
            // Add Branch ID to Headers
            final branchId = await _storage.read(key: 'branchId');
            if (branchId != null && branchId.isNotEmpty) {
              options.headers['X-Branch-ID'] = branchId;
            }
            options.headers['Content-Type'] = 'application/json';
            return handler.next(options);
          },
          onResponse: (response, handler) {
            if (kDebugMode) {
              print('========== API RESPONSE ==========');
              print('Status Code: ${response.statusCode}');
              print('Raw Response: ${response.data}');
              print('Headers: ${response.headers}');
              print('==================================');
            }
            // Try to parse as JSON
            try {
              final jsonData = jsonDecode(response.data);
              response.data = jsonData;
              if (kDebugMode) {
                print('Parsed JSON: $jsonData');
              }
            } catch (e) {
              if (kDebugMode) {
                print('Failed to parse JSON: $e');
                print('Response was not valid JSON!');
              }
            }
            return handler.next(response);
          },
          onError: (error, handler) async {
            if (kDebugMode) {
              print('========== API ERROR ==========');
              print('Type: ${error.type}');
              print('Message: ${error.message}');
              print('Stack Trace: ${error.stackTrace}');
              if (error.response != null) {
                print('Status Code: ${error.response?.statusCode}');
                print('Raw Error Response: ${error.response?.data}');
                print('Error Headers: ${error.response?.headers}');
              }
              print('================================');
            }
            return handler.next(error);
          },
        ),
      );
  }

  Dio get dio => _dio;
}
