import 'package:dio/dio.dart';
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
            // Add Token to Headers
            final token = await _storage.read(key: AppConstants.storageKeyToken);
            if (token != null && token.isNotEmpty) {
              options.headers['Authorization'] = 'Bearer $token';
            }
            options.headers['Content-Type'] = 'application/json';
            return handler.next(options);
          },
          onResponse: (response, handler) {
            return handler.next(response);
          },
          onError: (error, handler) async {
            return handler.next(error);
          },
        ),
      );
  }

  Dio get dio => _dio;
}
