import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_theme.dart';

class PrinterSettingsScreen extends StatefulWidget {
  const PrinterSettingsScreen({super.key});

  @override
  State<PrinterSettingsScreen> createState() => _PrinterSettingsScreenState();
}

class _PrinterSettingsScreenState extends State<PrinterSettingsScreen> {
  bool _autoPrint = false;
  String _printerType = 'A4'; // 'A4' or '80mm'
  
  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _autoPrint = prefs.getBool('auto_print') ?? false;
      _printerType = prefs.getString('printer_type') ?? 'A4';
    });
  }

  Future<void> _saveSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('auto_print', _autoPrint);
    await prefs.setString('printer_type', _printerType);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Printer Settings Saved')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Printer Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          SwitchListTile(
            title: const Text('Auto-Print on Bill Creation'),
            subtitle: const Text('Instantly print receipt when a bill is saved via Quick POS'),
            value: _autoPrint,
            activeColor: AppTheme.primaryColor,
            onChanged: (val) {
              setState(() => _autoPrint = val);
              _saveSettings();
            },
          ),
          const Divider(),
          ListTile(
            title: const Text('Printer Type / Paper Size'),
            subtitle: const Text('Select the default paper format for invoices'),
          ),
          RadioListTile<String>(
            title: const Text('A4 Standard Printer'),
            value: 'A4',
            groupValue: _printerType,
            activeColor: AppTheme.primaryColor,
            onChanged: (val) {
              if (val != null) {
                setState(() => _printerType = val);
                _saveSettings();
              }
            },
          ),
          RadioListTile<String>(
            title: const Text('80mm Thermal Receipt Printer'),
            value: '80mm',
            groupValue: _printerType,
            activeColor: AppTheme.primaryColor,
            onChanged: (val) {
              if (val != null) {
                setState(() => _printerType = val);
                _saveSettings();
              }
            },
          ),
        ],
      ),
    );
  }
}
