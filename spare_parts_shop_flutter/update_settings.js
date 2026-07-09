const fs = require('fs');

let c = fs.readFileSync('lib/screens/business_settings_screen.dart', 'utf8');

c = c.replace(/import '\.\.\/constants\/app_theme\.dart';/, 
`import '../constants/app_theme.dart';
import '../services/secure_storage_service.dart';
import '../services/biometric_service.dart';`);

c = c.replace(/  bool _isLoading = true;/, 
`  bool _isLoading = true;
  bool _biometricEnabled = false;
  bool _biometricAvailable = false;
  final SecureStorageService _storageService = SecureStorageService();
  final BiometricService _biometricService = BiometricService();`);

c = c.replace(/    _loadBusiness\(\);/, 
`    _loadBusiness();
    _loadBiometricSettings();`);

c = c.replace(/  Future<void> _loadBusiness\(\) async \{/, 
`  Future<void> _loadBiometricSettings() async {
    final available = await _biometricService.isBiometricAvailable();
    final enabled = await _storageService.getBiometricEnabled();
    if (mounted) {
      setState(() {
        _biometricAvailable = available;
        _biometricEnabled = enabled;
      });
    }
  }

  Future<void> _toggleBiometric(bool value) async {
    if (value) {
      // Trying to enable it, verify first
      try {
        final authenticated = await _biometricService.authenticate('Authenticate to enable biometric login');
        if (authenticated) {
          await _storageService.saveBiometricEnabled(true);
          setState(() => _biometricEnabled = true);
          if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Biometric login enabled.')));
        }
      } catch (e) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString().replaceAll('Exception: ', ''))));
      }
    } else {
      await _storageService.saveBiometricEnabled(false);
      setState(() => _biometricEnabled = false);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Biometric login disabled.')));
    }
  }

  Future<void> _loadBusiness() async {`);


c = c.replace(/const SizedBox\(height: 20\),/, 
`const SizedBox(height: 20),
                      if (_biometricAvailable)
                        Card(
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          child: Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Security', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                const Divider(height: 32),
                                SwitchListTile(
                                  title: const Text('Login with Biometrics'),
                                  subtitle: const Text('Use fingerprint or face unlock to login quickly'),
                                  value: _biometricEnabled,
                                  onChanged: _toggleBiometric,
                                  activeColor: AppTheme.primaryColor,
                                ),
                              ],
                            ),
                          ),
                        ),
                      const SizedBox(height: 20),`);

fs.writeFileSync('lib/screens/business_settings_screen.dart', c);
console.log('Modified business_settings_screen.dart');
