import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:stock_pilot/core/constants/app_constants.dart';
import '../services/api_service.dart';
import '../models/login_response.dart';

class AuthProvider with ChangeNotifier {
  final ApiService apiService = ApiService();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  String? _username;
  String? _role;
  String? _token;
  int? _userId;
  int? _businessId;
  int? _branchId;
  dynamic _features;
  bool _isLoading = false;
  bool _isInitialized = false;

  String? get username => _username;
  String? get role => _role;
  String? get token => _token;
  int? get userId => _userId;
  int? get businessId => _businessId;
  int? get branchId => _branchId;
  dynamic get features => _features;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _username != null && _token != null;
  bool get isInitialized => _isInitialized;

  AuthProvider() {
    _loadFromStorage();
  }

  Future<void> _loadFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _username = prefs.getString('username');
      _role = await _storage.read(key: 'role');
      final userIdStr = await _storage.read(key: 'userId');
      _userId = userIdStr != null ? int.tryParse(userIdStr) : null;
      final businessIdStr = await _storage.read(key: 'businessId');
      _businessId = businessIdStr != null ? int.tryParse(businessIdStr) : null;
      final branchIdStr = await _storage.read(key: 'active_branch_id');
      _branchId = branchIdStr != null ? int.tryParse(branchIdStr) : null;
      _token = await _storage.read(key: AppConstants.storageKeyToken);
    } catch (e) {
      debugPrint('Error loading from storage: $e');
    } finally {
      _isInitialized = true;
      notifyListeners();
    }
  }

  Future<void> _saveToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (_username != null) {
        await prefs.setString('username', _username!);
      }
      if (_role != null) {
        await _storage.write(key: 'role', value: _role!);
      }
      if (_userId != null) {
        await _storage.write(key: 'userId', value: _userId.toString());
      }
      if (_businessId != null) {
        await _storage.write(key: 'businessId', value: _businessId.toString());
      }
      if (_branchId != null) {
        await _storage.write(key: 'active_branch_id', value: _branchId.toString());
      }
      if (_token != null) {
        await _storage.write(key: AppConstants.storageKeyToken, value: _token!);
      }
    } catch (e) {
      debugPrint('Error saving to storage: $e');
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
      _userId = response.userId;
      _businessId = response.businessId;
      _branchId = response.branchId;
      _features = response.features;
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
    _userId = null;
    _businessId = null;
    _branchId = null;
    _features = null;

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
      await _storage.delete(key: AppConstants.storageKeyToken);
      await _storage.delete(key: 'role');
      await _storage.delete(key: 'userId');
      await _storage.delete(key: 'businessId');
      await _storage.delete(key: 'active_branch_id');
    } catch (e) {
      debugPrint('Error clearing storage: $e');
    }

    notifyListeners();
  }

  Future<void> changePassword(String newPassword) async {
    _isLoading = true;
    notifyListeners();
    try {
      await apiService.changePassword(newPassword);
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> initAdmin() async {
    await apiService.initAdmin();
  }

  bool get isAdmin => _role == 'ADMIN' || _username == 'admin';
  bool get isSuperAdmin => _role == 'SUPER_ADMIN' || _role == 'SUPER_MANAGER';
}
