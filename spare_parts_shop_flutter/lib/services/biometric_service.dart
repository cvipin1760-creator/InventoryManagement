import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';
import 'package:local_auth/error_codes.dart' as auth_error;
import 'package:flutter/foundation.dart';

class BiometricService {
  final LocalAuthentication _auth = LocalAuthentication();

  Future<bool> isBiometricAvailable() async {
    try {
      final bool canAuthenticateWithBiometrics = await _auth.canCheckBiometrics;
      final bool isSupported = await _auth.isDeviceSupported();
      return canAuthenticateWithBiometrics && isSupported;
    } catch (e) {
      debugPrint("Error checking biometric availability: $e");
      return false;
    }
  }

  Future<bool> authenticate(String reason) async {
    try {
      return await _auth.authenticate(
        localizedReason: reason,
        options: const AuthenticationOptions(
          biometricOnly: true,
          stickyAuth: true,
          sensitiveTransaction: true,
          useErrorDialogs: true,
        ),
      );
    } on PlatformException catch (e) {
      debugPrint('Biometric Error: ${e.code} - ${e.message}');
      String errorMessage;
      switch (e.code) {
        case auth_error.notEnrolled:
          errorMessage = 'No biometrics enrolled on this device. Please set it up in your device settings.';
          break;
        case auth_error.lockedOut:
          errorMessage = 'Biometric authentication is temporarily locked out due to too many failed attempts.';
          break;
        case auth_error.permanentlyLockedOut:
          errorMessage = 'Biometric authentication is permanently locked out. Please use your PIN/Password to unlock.';
          break;
        case auth_error.passcodeNotSet:
          errorMessage = 'Device passcode is not set. Please secure your device first.';
          break;
        case auth_error.otherOperatingSystem:
          errorMessage = 'Biometric authentication is not supported on this OS.';
          break;
        case auth_error.notAvailable:
          errorMessage = 'Biometric hardware is currently unavailable.';
          break;
        case 'uiUnavailable':
          errorMessage = 'System UI for biometrics is unavailable.';
          break;
        case 'userCanceled':
        case 'systemCanceled':
          errorMessage = 'Authentication canceled.';
          break;
        default:
          errorMessage = 'Authentication failed: ${e.message}';
      }
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception('An unexpected error occurred during authentication.');
    }
  }
}
