import 'package:flutter/foundation.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import '../services/api_service.dart';
import '../services/secure_storage_service.dart';
import '../services/biometric_service.dart';

class AuthRepository {
  final ApiService _apiService;
  final SecureStorageService _storageService;
  final BiometricService _biometricService;

  AuthRepository({
    required ApiService apiService,
    required SecureStorageService storageService,
    required BiometricService biometricService,
  })  : _apiService = apiService,
        _storageService = storageService,
        _biometricService = biometricService;

  Future<void> saveBiometricPreference(bool enabled) async {
    await _storageService.saveBiometricEnabled(enabled);
  }

  Future<bool> getBiometricPreference() async {
    return await _storageService.getBiometricEnabled();
  }

  Future<bool> isBiometricReady() async {
    final isEnabled = await getBiometricPreference();
    if (!isEnabled) return false;

    final token = await _storageService.getToken();
    if (token == null || token.isEmpty) return false;

    if (JwtDecoder.isExpired(token)) {
      debugPrint('JWT token is expired. Manual login required.');
      return false;
    }

    final isAvailable = await _biometricService.isBiometricAvailable();
    return isAvailable;
  }

  Future<bool> loginWithBiometrics() async {
    try {
      final isAuthenticated = await _biometricService.authenticate('Authenticate to access StockPilot');
      return isAuthenticated;
    } catch (e) {
      rethrow;
    }
  }

  Future<String?> getSavedToken() async {
    return await _storageService.getToken();
  }
}
