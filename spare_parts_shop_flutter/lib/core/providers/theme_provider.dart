import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:stock_pilot/core/constants/app_constants.dart';
import 'package:stock_pilot/core/theme/app_theme.dart';

final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, ThemeMode>((ref) {
  return ThemeModeNotifier();
});

class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  ThemeModeNotifier() : super(ThemeMode.light) {
    _loadThemeMode();
  }

  Future<void> _loadThemeMode() async {
    final prefs = await SharedPreferences.getInstance();
    final themeModeStr = prefs.getString(AppConstants.storageKeyThemeMode);
    if (themeModeStr != null) {
      state = _getThemeModeFromString(themeModeStr);
    } else {
      state = ThemeMode.light;
    }
  }

  ThemeMode _getThemeModeFromString(String themeMode) {
    switch (themeMode) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      default:
        return ThemeMode.system;
    }
  }

  Future<void> toggleTheme() async {
    final prefs = await SharedPreferences.getInstance();
    if (state == ThemeMode.light) {
      state = ThemeMode.dark;
      await prefs.setString(AppConstants.storageKeyThemeMode, 'dark');
    } else {
      state = ThemeMode.light;
      await prefs.setString(AppConstants.storageKeyThemeMode, 'light');
    }
  }
}
