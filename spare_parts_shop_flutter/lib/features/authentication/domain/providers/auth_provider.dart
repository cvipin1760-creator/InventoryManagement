import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:stock_pilot/core/constants/app_constants.dart';
import 'package:stock_pilot/core/network/dio_client.dart';
import 'package:stock_pilot/features/authentication/data/models/feature_permissions_model.dart';
import 'package:stock_pilot/features/authentication/data/models/login_response_model.dart';
import 'package:stock_pilot/features/authentication/data/models/user_model.dart';

final authNotifierProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  final storage = const FlutterSecureStorage();
  return AuthNotifier(dioClient, storage);
});

final dioClientProvider = Provider((ref) => DioClient());

class AuthNotifier extends StateNotifier<AuthState> {
  final DioClient _dioClient;
  final FlutterSecureStorage _storage;

  AuthNotifier(this._dioClient, this._storage) : super(AuthInitial()) {
    _checkAuthState();
  }

  Future<void> _checkAuthState() async {
    final userStr = await _storage.read(key: AppConstants.storageKeyUser);
    final username = await _storage.read(key: 'username');
    final role = await _storage.read(key: 'role');
    final businessIdStr = await _storage.read(key: 'businessId');
    final branchIdStr = await _storage.read(key: 'branchId');
    final featuresStr = await _storage.read(key: 'features');

    if (userStr != null) {
      final user = UserModel(
        id: int.tryParse(userStr) ?? 0,
        username: username ?? '',
        role: role ?? '',
        businessId: businessIdStr != null ? int.tryParse(businessIdStr) : null,
      );
      
      FeaturePermissionsModel? features;
      if (featuresStr != null) {
        try {
          features = FeaturePermissionsModel.fromJson(
          jsonDecode(featuresStr) as Map<String, dynamic>,
        );
        } catch (e) {
          features = null;
        }
      }
      
      state = AuthAuthenticated(user: user, features: features);
    } else {
      state = AuthUnauthenticated();
    }
  }

  Future<void> login(String username, String password) async {
    state = AuthLoading();
    try {
      print('========== LOGIN ATTEMPT ==========');
      print('Username: ${username.trim()}');
      
      final response = await _dioClient.dio.post(
        '/auth/login',
        data: {
          'username': username.trim(),
          'password': password.trim(),
        },
      );
      
      print('Login Response Type: ${response.data.runtimeType}');
      print('Login Response Data: ${response.data}');
      
      final loginResponse = LoginResponseModel.fromJson(response.data);
      
      // Create UserModel from the loginResponse
      final user = UserModel(
        id: loginResponse.userId ?? 0,
        username: loginResponse.username ?? '',
        role: loginResponse.role ?? '',
        businessId: loginResponse.businessId,
      );

      // Save user details and token
      if (loginResponse.token != null) {
        await _storage.write(
          key: AppConstants.storageKeyToken,
          value: loginResponse.token!,
        );
      }
      await _storage.write(
        key: AppConstants.storageKeyUser,
        value: user.id.toString(),
      );
      await _storage.write(key: 'username', value: user.username);
      await _storage.write(key: 'role', value: user.role);
      if (user.businessId != null) {
        await _storage.write(key: 'businessId', value: user.businessId.toString());
      }
      if (loginResponse.branchId != null) {
        await _storage.write(key: 'branchId', value: loginResponse.branchId.toString());
      }
      if (loginResponse.configuration != null) {
        await _storage.write(
          key: 'configuration',
          value: jsonEncode(loginResponse.configuration),
        );
      }
      
      state = AuthAuthenticated(
        user: user,
        configuration: loginResponse.configuration,
      );
    } on DioException catch (e) {
      String errorMessage = 'An error occurred. Please try again.';
      if (e.type == DioExceptionType.connectionError || 
          e.type == DioExceptionType.connectionTimeout) {
        errorMessage = 'Could not connect to server. Please check your internet connection or server address.';
      } else if (e.type == DioExceptionType.receiveTimeout || 
                 e.type == DioExceptionType.sendTimeout) {
        errorMessage = 'Connection timed out. Please try again.';
      } else if (e.response != null) {
        if (e.response!.statusCode == 401) {
          errorMessage = 'Invalid username or password.';
        } else if (e.response!.data is Map && 
                   e.response!.data['message'] != null) {
          errorMessage = e.response!.data['message'];
        }
      }
      state = AuthError(errorMessage);
    } catch (e) {
      print('Login Error: $e');
      state = AuthError('An unexpected error occurred. Please try again.');
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: AppConstants.storageKeyToken);
    await _storage.delete(key: AppConstants.storageKeyUser);
    await _storage.delete(key: 'username');
    await _storage.delete(key: 'role');
    await _storage.delete(key: 'businessId');
    await _storage.delete(key: 'branchId');
    await _storage.delete(key: 'configuration');
    state = AuthUnauthenticated();
  }
}

sealed class AuthState {}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthAuthenticated extends AuthState {
  final UserModel user;
  final dynamic configuration;

  AuthAuthenticated({
    required this.user,
    this.configuration,
  });
}

class AuthUnauthenticated extends AuthState {}

class AuthError extends AuthState {
  final String message;

  AuthError(this.message);
}
