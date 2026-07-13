import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:stock_pilot/features/authentication/data/models/account_model.dart';
import 'package:stock_pilot/features/authentication/data/models/security_settings_model.dart';

class SecureStorageService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  static const String _keyAccounts = 'accounts';
  static const String _keyActiveAccountId = 'active_account_id';
  static const String _keySecuritySettings = 'security_settings';
  static const String _keyLastActivityTimestamp = 'last_activity_timestamp';

  // ==================== Accounts ====================

  Future<List<AccountModel>> getAllAccounts() async {
    final accountsJson = await _storage.read(key: _keyAccounts);
    if (accountsJson == null) return [];
    try {
      final List<dynamic> list = jsonDecode(accountsJson);
      return list.map((e) => AccountModel.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<void> saveAccounts(List<AccountModel> accounts) async {
    final json = jsonEncode(accounts.map((e) => e.toJson()).toList());
    await _storage.write(key: _keyAccounts, value: json);
  }

  Future<void> addAccount(AccountModel account) async {
    final accounts = await getAllAccounts();
    // Remove existing account with same id if exists
    accounts.removeWhere((a) => a.id == account.id);
    accounts.add(account);
    await saveAccounts(accounts);
  }

  Future<void> removeAccount(String accountId) async {
    final accounts = await getAllAccounts();
    accounts.removeWhere((a) => a.id == accountId);
    await saveAccounts(accounts);
  }

  Future<String?> getActiveAccountId() async {
    return await _storage.read(key: _keyActiveAccountId);
  }

  Future<void> setActiveAccountId(String? accountId) async {
    if (accountId != null) {
      await _storage.write(key: _keyActiveAccountId, value: accountId);
    } else {
      await _storage.delete(key: _keyActiveAccountId);
    }
  }

  Future<AccountModel?> getActiveAccount() async {
    final activeId = await getActiveAccountId();
    if (activeId == null) return null;
    final accounts = await getAllAccounts();
    try {
      return accounts.firstWhere((a) => a.id == activeId);
    } catch (e) {
      return null;
    }
  }

  // ==================== Security Settings ====================

  Future<SecuritySettingsModel> getSecuritySettings() async {
    final settingsJson = await _storage.read(key: _keySecuritySettings);
    if (settingsJson == null) return const SecuritySettingsModel();
    try {
      return SecuritySettingsModel.fromJson(jsonDecode(settingsJson) as Map<String, dynamic>);
    } catch (e) {
      return const SecuritySettingsModel();
    }
  }

  Future<void> saveSecuritySettings(SecuritySettingsModel settings) async {
    final json = jsonEncode(settings.toJson());
    await _storage.write(key: _keySecuritySettings, value: json);
  }

  // ==================== Activity / Lock ====================

  Future<void> updateLastActivityTimestamp() async {
    final now = DateTime.now().millisecondsSinceEpoch.toString();
    await _storage.write(key: _keyLastActivityTimestamp, value: now);
  }

  Future<int?> getLastActivityTimestamp() async {
    final ts = await _storage.read(key: _keyLastActivityTimestamp);
    return ts != null ? int.tryParse(ts) : null;
  }

  // ==================== Legacy (for backward compatibility) ====================

  Future<void> saveToken(String token) async {
    // No-op for backward compatibility, use accounts instead
  }

  Future<String?> getToken() async {
    final activeAccount = await getActiveAccount();
    return activeAccount?.token;
  }

  Future<void> deleteToken() async {
    // No-op, use removeAccount instead
  }

  Future<void> saveBiometricEnabled(bool enabled) async {
    final settings = await getSecuritySettings();
    await saveSecuritySettings(settings.copyWith(enableFingerprint: enabled));
  }

  Future<bool> getBiometricEnabled() async {
    final settings = await getSecuritySettings();
    return settings.enableFingerprint;
  }

  Future<void> saveUsername(String username) async {
    // No-op, use accounts instead
  }

  Future<String?> getUsername() async {
    final activeAccount = await getActiveAccount();
    return activeAccount?.username;
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
