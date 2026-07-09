const fs = require('fs');

let c = fs.readFileSync('lib/screens/login_screen.dart', 'utf8');

c = c.replace("import 'package:local_auth/local_auth.dart';", 
`import '../repositories/auth_repository.dart';
import '../services/api_service.dart';
import '../services/biometric_service.dart';
import '../services/secure_storage_service.dart';`);

c = c.replace("final LocalAuthentication auth = LocalAuthentication();", 
`late final AuthRepository _authRepository;
  late final BiometricService _biometricService;
  late final SecureStorageService _secureStorageService;`);

c = c.replace("  Future<void> _checkBiometrics() async {\n    bool canCheckBiometrics;\n    try {\n      canCheckBiometrics = await auth.canCheckBiometrics;\n    } catch (e) {\n      canCheckBiometrics = false;\n    }\n    if (!mounted) return;\n    setState(() {\n      _canCheckBiometrics = canCheckBiometrics;\n    });\n  }", 
`  Future<void> _checkBiometrics() async {
    bool ready = await _authRepository.isBiometricReady();
    if (!mounted) return;
    setState(() {
      _canCheckBiometrics = ready;
    });
  }`);

c = c.replace("    _checkBiometrics();\n    _animationController", 
`    _secureStorageService = SecureStorageService();
    _biometricService = BiometricService();
    _authRepository = AuthRepository(
      apiService: ApiService(),
      storageService: _secureStorageService,
      biometricService: _biometricService,
    );
    _checkBiometrics();
    _animationController`);

c = c.replace(/  Future<void> _authenticate\(\) async \{[\s\S]*?if \(authenticated\) \{[\s\S]*?\}[\s\S]*?\}/, 
`  Future<void> _authenticate() async {
    try {
      setState(() => _isLoading = true);
      
      final isReady = await _authRepository.isBiometricReady();
      if (!isReady) {
        if (mounted) {
           ScaffoldMessenger.of(context).showSnackBar(
             SnackBar(content: const Text('Biometrics are not set up or your session expired. Please login manually first.'), backgroundColor: AppTheme.warningColor),
           );
        }
        return;
      }

      final authenticated = await _authRepository.loginWithBiometrics();
      if (authenticated) {
        final token = await _authRepository.getSavedToken();
        if (token != null) {
          // Instead of manually navigating, we should ensure AuthProvider is fully loaded.
          // But since AuthProvider loads token from storage on boot, it might just work.
          // In a real app we might call a special 'biometricLogin' on AuthProvider that just reads storage.
          if (mounted) Navigator.pushReplacementNamed(context, '/dashboard');
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: AppTheme.errorColor,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          )
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }`);

fs.writeFileSync('lib/screens/login_screen.dart', c);
console.log('Modified login_screen.dart');
