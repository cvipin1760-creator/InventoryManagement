import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter/foundation.dart';

class BiometricService {
  final LocalAuthentication _auth = LocalAuthentication();

  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _auth.getAvailableBiometrics();
    } catch (e) {
      debugPrint("Error getting available biometrics: $e");
      return [];
    }
  }

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

  Future<bool> isFingerprintAvailable() async {
    final biometrics = await getAvailableBiometrics();
    return biometrics.contains(BiometricType.fingerprint) || biometrics.contains(BiometricType.weak);
  }

  Future<bool> isFaceUnlockAvailable() async {
    final biometrics = await getAvailableBiometrics();
    return biometrics.contains(BiometricType.face) || biometrics.contains(BiometricType.strong);
  }

  Future<bool> authenticate({
    String reason = 'Authenticate to access Stock Pilot',
    bool biometricOnly = false,
  }) async {
    try {
      return await _auth.authenticate(
        localizedReason: reason,
        biometricOnly: biometricOnly,
      );
    } on PlatformException catch (e) {
      debugPrint('Biometric Error: ${e.code} - ${e.message}');
      String errorMessage;
      switch (e.code) {
        case 'NotEnrolled':
          errorMessage = 'No biometrics enrolled on this device. Please set it up in your device settings.';
          break;
        case 'LockedOut':
          errorMessage = 'Biometric authentication is temporarily locked out due to too many failed attempts.';
          break;
        case 'PermanentlyLockedOut':
          errorMessage = 'Biometric authentication is permanently locked out. Please use your PIN/Password to unlock.';
          break;
        case 'PasscodeNotSet':
          errorMessage = 'Device passcode is not set. Please secure your device first.';
          break;
        case 'OtherOperatingSystem':
          errorMessage = 'Biometric authentication is not supported on this OS.';
          break;
        case 'NotAvailable':
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

  Future<void> stopAuthentication() async {
    try {
      await _auth.stopAuthentication();
    } catch (e) {
      debugPrint('Error stopping authentication: $e');
    }
  }
}
