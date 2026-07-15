import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:stock_pilot/core/providers/theme_provider.dart';
import 'package:provider/provider.dart' as provider;
import 'package:stock_pilot/providers/auth_provider.dart';
import 'package:stock_pilot/services/biometric_service.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final BiometricService _biometricService = BiometricService();
  bool _isFingerprintAvailable = false;
  bool _isFaceUnlockAvailable = false;

  @override
  void initState() {
    super.initState();
    _checkBiometricAvailability();
  }

  Future<void> _checkBiometricAvailability() async {
    final fingerprintAvailable = await _biometricService.isFingerprintAvailable();
    final faceUnlockAvailable = await _biometricService.isFaceUnlockAvailable();
    if (mounted) {
      setState(() {
        _isFingerprintAvailable = fingerprintAvailable;
        _isFaceUnlockAvailable = faceUnlockAvailable;
      });
    }
  }

  Future<void> _showAccountSwitcher(BuildContext context, AuthProvider authProvider) async {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.4,
        maxChildSize: 0.8,
        expand: false,
        builder: (context, scrollController) => Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Switch Account',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 24),
              Expanded(
                child: ListView.builder(
                  controller: scrollController,
                  itemCount: authProvider.accounts.length + 1,
                  itemBuilder: (context, index) {
                    if (index == authProvider.accounts.length) {
                      return ListTile(
                        leading: const CircleAvatar(
                          child: Icon(Icons.add),
                        ),
                        title: const Text('Add Another Account'),
                        onTap: () async {
                          Navigator.pop(context);
                          await authProvider.logoutCurrentAccount();
                          if (!authProvider.isAuthenticated && mounted) {
                            Navigator.pushAndRemoveUntil(context, '/', (route) => false);
                          }
                        },
                      );
                    }
                    final account = authProvider.accounts[index];
                    final displayName = account.name ?? account.username;
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: account.isActive 
                            ? Theme.of(context).colorScheme.primary 
                            : Colors.grey[300],
                        child: Text(
                          displayName.isNotEmpty 
                              ? displayName[0].toUpperCase() 
                              : 'U',
                          style: TextStyle(
                            color: account.isActive ? Colors.white : Colors.black,
                          ),
                        ),
                      ),
                      title: Text(displayName),
                      subtitle: Text('${account.username} • ${account.role}'),
                      trailing: account.isActive 
                          ? Icon(Icons.check_circle, color: Theme.of(context).colorScheme.primary) 
                          : const SizedBox.shrink(),
                      onTap: () {
                        Navigator.pop(context);
                        authProvider.switchAccount(account.id);
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authProvider = provider.Provider.of<AuthProvider>(context);
    
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Settings',
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 24),
              
              // User Profile Section
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      GestureDetector(
                        onTap: () => _showAccountSwitcher(context, authProvider),
                        child: Stack(
                          children: [
                            CircleAvatar(
                              radius: 30,
                              backgroundColor: theme.colorScheme.primary,
                              child: Text(
                                authProvider.username?.isNotEmpty == true 
                                    ? authProvider.username![0].toUpperCase() 
                                    : 'U',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            if (authProvider.accounts.length > 1)
                              Positioned(
                                bottom: 0,
                                right: 0,
                                child: Container(
                                  padding: const EdgeInsets.all(2),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: theme.colorScheme.primary,
                                      width: 2,
                                    ),
                                  ),
                                  child: Icon(
                                    Icons.switch_account,
                                    size: 16,
                                    color: theme.colorScheme.primary,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              authProvider.username ?? 'User',
                              style: theme.textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              authProvider.role ?? 'Role',
                              style: theme.textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      ),
                      if (authProvider.accounts.length > 1)
                        TextButton(
                          onPressed: () => _showAccountSwitcher(context, authProvider),
                          child: const Text('Switch'),
                        ),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Security Section
              Card(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        'Security',
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    if (_isFingerprintAvailable)
                      SwitchListTile(
                        secondary: const FaIcon(FontAwesomeIcons.fingerprint),
                        title: const Text('Enable Fingerprint Login'),
                        value: authProvider.securitySettings.enableFingerprint,
                        onChanged: (value) async {
                          if (value) {
                            try {
                              final authenticated = await _biometricService.authenticate(
                                reason: 'Authenticate to enable fingerprint login',
                              );
                              if (authenticated && mounted) {
                                authProvider.updateSecuritySettings(
                                  authProvider.securitySettings.copyWith(enableFingerprint: value),
                                );
                              }
                            } catch (e) {
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text(e.toString())),
                                );
                              }
                            }
                          } else {
                            authProvider.updateSecuritySettings(
                              authProvider.securitySettings.copyWith(enableFingerprint: value),
                            );
                          }
                        },
                      ),
                    if (_isFaceUnlockAvailable)
                      SwitchListTile(
                        secondary: const FaIcon(FontAwesomeIcons.faceSmile),
                        title: const Text('Enable Face Unlock'),
                        value: authProvider.securitySettings.enableFaceUnlock,
                        onChanged: (value) async {
                          if (value) {
                            try {
                              final authenticated = await _biometricService.authenticate(
                                reason: 'Authenticate to enable face unlock',
                              );
                              if (authenticated && mounted) {
                                authProvider.updateSecuritySettings(
                                  authProvider.securitySettings.copyWith(enableFaceUnlock: value),
                                );
                              }
                            } catch (e) {
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text(e.toString())),
                                );
                              }
                            }
                          } else {
                            authProvider.updateSecuritySettings(
                              authProvider.securitySettings.copyWith(enableFaceUnlock: value),
                            );
                          }
                        },
                      ),
                    SwitchListTile(
                      secondary: const Icon(Icons.lock_open),
                      title: const Text('Require Authentication on App Open'),
                      value: authProvider.securitySettings.requireAuthOnAppOpen,
                      onChanged: (value) {
                        authProvider.updateSecuritySettings(
                          authProvider.securitySettings.copyWith(requireAuthOnAppOpen: value),
                        );
                      },
                    ),
                    SwitchListTile(
                      secondary: const Icon(Icons.security),
                      title: const Text('Require Authentication Before Viewing Sensitive Data'),
                      value: authProvider.securitySettings.requireAuthBeforeSensitiveData,
                      onChanged: (value) {
                        authProvider.updateSecuritySettings(
                          authProvider.securitySettings.copyWith(requireAuthBeforeSensitiveData: value),
                        );
                      },
                    ),
                    const Divider(),
                    ListTile(
                      leading: const Icon(Icons.lock_clock),
                      title: const Text('Auto-Lock After Inactivity'),
                      subtitle: Text('${authProvider.securitySettings.autoLockInactivitySeconds} seconds'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () async {
                        final result = await showDialog<int>(
                          context: context,
                          builder: (context) => SimpleDialog(
                            title: const Text('Auto-Lock Duration'),
                            children: [30, 60, 120, 300, 600]
                                .map((seconds) => SimpleDialogOption(
                                      child: Text('$seconds seconds'),
                                      onPressed: () => Navigator.pop(context, seconds),
                                    ))
                                .toList(),
                          ),
                        );
                        if (result != null) {
                          authProvider.updateSecuritySettings(
                            authProvider.securitySettings.copyWith(autoLockInactivitySeconds: result),
                          );
                        }
                      },
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 16),
              
              // Theme Section
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: ListTile(
                    leading: FaIcon(
                      theme.brightness == Brightness.light
                          ? FontAwesomeIcons.sun
                          : FontAwesomeIcons.moon,
                    ),
                    title: const Text('Theme'),
                    subtitle: Text(
                      theme.brightness == Brightness.light ? 'Light' : 'Dark',
                    ),
                    trailing: Switch(
                      value: theme.brightness == Brightness.dark,
                      onChanged: (_) => ref.read(themeModeProvider.notifier).toggleTheme(),
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: 16),
              
              // Other Settings
              Card(
                child: Column(
                  children: [
                    ListTile(
                      leading: const FaIcon(FontAwesomeIcons.bell),
                      title: const Text('Notifications'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Notifications settings coming soon')),
                        );
                      },
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const FaIcon(FontAwesomeIcons.database),
                      title: const Text('Backup & Restore'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Backup & Restore coming soon')),
                        );
                      },
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const FaIcon(FontAwesomeIcons.circleQuestion),
                      title: const Text('Help & Support'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Help & Support coming soon')),
                        );
                      },
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const FaIcon(FontAwesomeIcons.circleInfo),
                      title: const Text('About'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        showAboutDialog(
                          context: context,
                          applicationName: 'Stock Pilot',
                          applicationVersion: '1.0.0',
                          applicationIcon: const FlutterLogo(size: 48),
                        );
                      },
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Account Actions
              Card(
                child: Column(
                  children: [
                    ListTile(
                      leading: const FaIcon(FontAwesomeIcons.rightFromBracket, color: Colors.orange),
                      title: const Text('Logout Current Account'),
                      onTap: () {
                        showDialog(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: const Text('Logout'),
                            content: const Text('Are you sure you want to logout this account?'),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(context),
                                child: const Text('Cancel'),
                              ),
                              TextButton(
                                  onPressed: () async {
                                    Navigator.pop(context);
                                    await authProvider.logoutCurrentAccount();
                                    if (!authProvider.isAuthenticated && mounted) {
                                      Navigator.pushNamedAndRemoveUntil(context, '/', (route) => false);
                                    }
                                  },
                                child: const Text('Logout'),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const FaIcon(FontAwesomeIcons.signOutAlt, color: Colors.red),
                      title: const Text('Logout All Accounts'),
                      onTap: () {
                        showDialog(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: const Text('Logout All'),
                            content: const Text('Are you sure you want to logout all accounts?'),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(context),
                                child: const Text('Cancel'),
                              ),
                              TextButton(
                                  onPressed: () async {
                                    Navigator.pop(context);
                                    await authProvider.logoutAllAccounts();
                                    if (!authProvider.isAuthenticated && mounted) {
                                      Navigator.pushNamedAndRemoveUntil(context, '/', (route) => false);
                                    }
                                  },
                                child: const Text('Logout All'),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
