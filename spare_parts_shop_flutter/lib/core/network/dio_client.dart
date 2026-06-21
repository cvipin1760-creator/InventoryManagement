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
      ..interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) async {
            if (kDebugMode) {
              print('Request: ${options.method} ${options.uri}');
              print('Headers: ${options.headers}');
              print('Data: ${options.data}');
            }
            // Add Token to Headers
            final token = await _storage.read(key: AppConstants.storageKeyToken);
            if (token != null && token.isNotEmpty) {
              options.headers['Authorization'] = 'Bearer $token';
            }
            options.headers['Content-Type'] = 'application/json';
            return handler.next(options);
          },
          onResponse: (response, handler) {
            if (kDebugMode) {
              print('Response: ${response.statusCode}');
              print('Data: ${response.data}');
            }
            return handler.next(response);
          },
          onError: (error, handler) async {
            if (kDebugMode) {
              print('Error: ${error.type}');
              print('Error Message: ${error.message}');
              if (error.response != null) {
                print('Status Code: ${error.response?.statusCode}');
                print('Response Data: ${error.response?.data}');
              }
            }
            return handler.next(error);
          },
        ),
      );
  }

  Dio get dio => _dio;
}
