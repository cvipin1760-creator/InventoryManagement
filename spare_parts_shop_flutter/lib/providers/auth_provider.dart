import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:stock_pilot/core/constants/app_constants.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService apiService = ApiService();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  String? _username;
  String? _role;
  String? _token;
  bool _isLoading = false;

  String? get username => _username;
  String? get role => _role;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _username != null;

  AuthProvider() {
    _loadFromStorage();
  }

  Future<void> _loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    _username = prefs.getString('username');
    _role = prefs.getString('role');
    _token = await _storage.read(key: AppConstants.storageKeyToken);
    notifyListeners();
  }

  Future<void> _saveToStorage() async {
    final prefs = await SharedPreferences.getInstance();
    if (_username != null) {
      await prefs.setString('username', _username!);
    }
    if (_role != null) {
      await prefs.setString('role', _role!);
    }
    if (_token != null) {
      await _storage.write(key: AppConstants.storageKeyToken, value: _token!);
    }
  }

  Future<void> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await apiService.login(username, password);
      _username = response.username;
      _role = response.role;
      _token = response.token;
      await _saveToStorage();
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _username = null;
    _role = null;
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    await _storage.delete(key: AppConstants.storageKeyToken);
    notifyListeners();
  }

  Future<void> initAdmin() async {
    await apiService.initAdmin();
  }

  bool get isAdmin => _role == 'ADMIN' || _username == 'admin';
}
