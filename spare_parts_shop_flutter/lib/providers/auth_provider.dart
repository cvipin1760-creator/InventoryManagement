import 'package:flutter/foundation.dart';
import 'package:stock_pilot/features/authentication/data/models/account_model.dart';
import 'package:stock_pilot/features/authentication/data/models/security_settings_model.dart';
import '../services/api_service.dart';
import '../services/secure_storage_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService apiService = ApiService();
  final SecureStorageService _secureStorage = SecureStorageService();
  
  List<AccountModel> _accounts = [];
  AccountModel? _activeAccount;
  SecuritySettingsModel _securitySettings = const SecuritySettingsModel();
  bool _isLoading = false;
  bool _isInitialized = false;
  bool _isLocked = false;

  List<AccountModel> get accounts => List.unmodifiable(_accounts);
  AccountModel? get activeAccount => _activeAccount;
  SecuritySettingsModel get securitySettings => _securitySettings;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _activeAccount != null;
  bool get isInitialized => _isInitialized;
  bool get isLocked => _isLocked;

  // Convenience getters for backward compatibility
  String? get username => _activeAccount?.username;
  String? get role => _activeAccount?.role;
  String? get token => _activeAccount?.token;
  int? get userId => _activeAccount?.userId;
  int? get businessId => _activeAccount?.businessId;
  int? get branchId => _activeAccount?.branchId;
  dynamic get features => _activeAccount?.features;
  bool get isSuperAdmin => role == 'SUPER_ADMIN' || role == 'SUPER_MANAGER';
  bool get isAdmin => role == 'ADMIN' || username == 'admin' || isSuperAdmin;

  AuthProvider() {
    _loadFromStorage();
  }

  Future<void> _loadFromStorage() async {
    try {
      _accounts = await _secureStorage.getAllAccounts();
      _activeAccount = await _secureStorage.getActiveAccount();
      _securitySettings = await _secureStorage.getSecuritySettings();
    } catch (e) {
      debugPrint('Error loading from storage: $e');
    } finally {
      _isInitialized = true;
      notifyListeners();
    }
  }

  Future<void> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await apiService.login(username, password);
      
      // Validate required fields from login response
      if (response.token == null || response.username == null || response.role == null) {
        throw Exception('Invalid login response: missing required fields');
      }

      // Create a unique account id (using userId + businessId if available)
      final accountId = '${response.userId}_${response.businessId ?? 'global'}';
      
      final newAccount = AccountModel(
        id: accountId,
        token: response.token!,
        username: response.username!,
        name: response.username,
        role: response.role!,
        userId: response.userId,
        businessId: response.businessId,
        branchId: response.branchId,
        features: response.features,
        isActive: true,
      );

      // Deactivate all other accounts first
      _accounts = _accounts.map((a) => a.copyWith(isActive: false)).toList();
      
      // Add or replace the new account
      _accounts.removeWhere((a) => a.id == accountId);
      _accounts.add(newAccount);
      _activeAccount = newAccount;

      // Save to storage
      await _secureStorage.saveAccounts(_accounts);
      await _secureStorage.setActiveAccountId(accountId);
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> switchAccount(String accountId) async {
    _isLoading = true;
    notifyListeners();

    try {
      final accountIndex = _accounts.indexWhere((a) => a.id == accountId);
      if (accountIndex == -1) return;

      // Update active statuses
      _accounts = _accounts.map((a) {
        return a.copyWith(isActive: a.id == accountId);
      }).toList();

      _activeAccount = _accounts[accountIndex];
      
      // Save to storage
      await _secureStorage.saveAccounts(_accounts);
      await _secureStorage.setActiveAccountId(accountId);
    } catch (e) {
      debugPrint('Error switching account: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> removeAccount(String accountId) async {
    try {
      _accounts.removeWhere((a) => a.id == accountId);
      
      // If we removed the active account, try to activate another one
      if (_activeAccount?.id == accountId) {
        if (_accounts.isNotEmpty) {
          _accounts[0] = _accounts[0].copyWith(isActive: true);
          _activeAccount = _accounts[0];
          await _secureStorage.setActiveAccountId(_accounts[0].id);
        } else {
          _activeAccount = null;
          await _secureStorage.setActiveAccountId(null);
        }
      }

      await _secureStorage.saveAccounts(_accounts);
      notifyListeners();
    } catch (e) {
      debugPrint('Error removing account: $e');
    }
  }

  Future<void> logoutCurrentAccount() async {
    if (_activeAccount == null) return;
    await removeAccount(_activeAccount!.id);
  }

  Future<void> logoutAllAccounts() async {
    _accounts = [];
    _activeAccount = null;
    await _secureStorage.saveAccounts(_accounts);
    await _secureStorage.setActiveAccountId(null);
    notifyListeners();
  }

  Future<void> updateSecuritySettings(SecuritySettingsModel settings) async {
    _securitySettings = settings;
    await _secureStorage.saveSecuritySettings(settings);
    notifyListeners();
  }

  void setLocked(bool isLocked) {
    _isLocked = isLocked;
    notifyListeners();
  }

  Future<void> updateLastActivity() async {
    await _secureStorage.updateLastActivityTimestamp();
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

  // Backward compatibility
  Future<void> logout() async {
    await logoutCurrentAccount();
  }
}
