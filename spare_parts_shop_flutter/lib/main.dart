import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:stock_pilot/constants/app_theme.dart';
import 'package:stock_pilot/providers/auth_provider.dart';
import 'package:stock_pilot/providers/theme_provider.dart';
import 'package:stock_pilot/providers/subscription_provider.dart';
import 'package:stock_pilot/screens/bills_screen.dart';
import 'package:stock_pilot/screens/create_bill_screen.dart';
import 'package:stock_pilot/screens/create_purchase_screen.dart';
import 'package:stock_pilot/screens/customers_screen.dart';
import 'package:stock_pilot/screens/dashboard_screen.dart';
import 'package:stock_pilot/screens/login_screen.dart';
import 'package:stock_pilot/screens/payments_screen.dart';
import 'package:stock_pilot/screens/products_screen.dart';
import 'package:stock_pilot/screens/customer_dashboard_screen.dart';
import 'package:stock_pilot/screens/customer_purchases_screen.dart';
import 'package:stock_pilot/screens/purchases_screen.dart';
import 'package:stock_pilot/screens/register_screen.dart';
import 'package:stock_pilot/screens/suppliers_screen.dart';
import 'package:stock_pilot/screens/predictive_analytics_screen.dart';
import 'package:stock_pilot/screens/accounting_screen.dart';
import 'package:stock_pilot/screens/bill_templates_screen.dart';
import 'package:stock_pilot/screens/branches_screen.dart';
import 'package:stock_pilot/screens/stock_transfers_screen.dart';
import 'package:stock_pilot/screens/staff_screen.dart';
import 'package:stock_pilot/screens/business_settings_screen.dart';
import 'package:stock_pilot/screens/notifications_screen.dart';
import 'package:stock_pilot/screens/subscription_billing_screen.dart';
import 'package:stock_pilot/screens/reports_screen.dart';
import 'package:stock_pilot/screens/marketing_screen.dart';
import 'package:stock_pilot/screens/role_management_screen.dart';
import 'package:stock_pilot/screens/feature_permissions_screen.dart';
import 'package:stock_pilot/screens/payment_settings_screen.dart';
import 'package:stock_pilot/screens/customer_products_screen.dart';
import 'package:stock_pilot/screens/support_tickets_screen.dart';
import 'package:stock_pilot/screens/support_screen.dart';
import 'package:stock_pilot/screens/audit_tasks_screen.dart';
import 'package:stock_pilot/screens/b2b_shop_screen.dart';
import 'package:stock_pilot/screens/purchase_orders_screen.dart';
import 'package:stock_pilot/screens/users_screen.dart';
import 'package:stock_pilot/screens/super_admin/subscriptions_screen.dart';
import 'package:stock_pilot/screens/super_admin/super_reports_screen.dart';
import 'package:stock_pilot/screens/super_admin/admin_management_screen.dart';
import 'package:stock_pilot/screens/quick_pos_screen.dart';
import 'package:stock_pilot/screens/shift_screen.dart';
import 'package:stock_pilot/screens/queue_dashboard_screen.dart';
import 'package:stock_pilot/screens/manager_approvals_screen.dart';
import 'package:stock_pilot/screens/self_checkout_screen.dart';
import 'package:stock_pilot/screens/app_store_screen.dart';
import 'package:stock_pilot/screens/printer_settings_screen.dart';
import 'package:stock_pilot/screens/emis_screen.dart';
import 'package:stock_pilot/screens/warranties_screen.dart';
import 'package:stock_pilot/screens/customer_emi_screen.dart';
import 'package:stock_pilot/screens/send_notifications_screen.dart';
import 'package:stock_pilot/services/api_service.dart';
import 'package:stock_pilot/services/fcm_service.dart';
import 'package:stock_pilot/services/offline_sync_service.dart';
import 'package:stock_pilot/services/biometric_service.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:stock_pilot/core/navigator_key.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
    await FCMService().init();
  } catch (e) {
    debugPrint("Firebase init error (likely missing google-services.json): $e");
  }
  
  OfflineSyncService().startListening();
  
  await ApiService.loadBaseUrl();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => SubscriptionProvider()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return MaterialApp(
            navigatorKey: navigatorKey,
            title: 'Stock Pilot',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: ThemeMode.system,
            initialRoute: '/',
            routes: {
              '/': (context) => const AuthWrapper(),
              '/login': (context) => const LoginScreen(),
              '/dashboard': (context) => const DashboardScreen(),
              '/products': (context) => const ProductsScreen(),
              '/customers': (context) => const CustomersScreen(),
              '/suppliers': (context) => const SuppliersScreen(),
              '/staff': (context) => const StaffScreen(),
              '/branches': (context) => const BranchesScreen(),
              '/stock-transfers': (context) => const StockTransfersScreen(),
              '/payments': (context) => const PaymentsScreen(),
              '/bills': (context) => const BillsScreen(),
              '/purchases': (context) => const PurchasesScreen(),
              '/create-bill': (context) => const CreateBillScreen(),
              '/create-purchase': (context) => const CreatePurchaseScreen(),
              '/register': (context) => const RegisterScreen(),
              '/predictive-analytics': (context) => const PredictiveAnalyticsScreen(),
              '/accounting': (context) => const AccountingScreen(),
              '/bill-templates': (context) => const BillTemplatesScreen(),
              '/branches': (context) => const BranchesScreen(),
              '/staff': (context) => const StaffScreen(),
              '/business-settings': (context) => const BusinessSettingsScreen(),
              '/notifications': (context) => const NotificationsScreen(),
              '/billing': (context) => const BillingScreen(),
              '/reports': (context) => const ReportsScreen(),
              '/marketing': (context) => const MarketingScreen(),
              '/warranties': (context) => const WarrantiesScreen(),
              '/customer-emi': (context) => const CustomerEmiScreen(),
              '/send-notifications': (context) => const SendNotificationsScreen(),
              '/customer-dashboard': (context) => const CustomerDashboardScreen(),
              '/customer-purchases': (context) => const CustomerPurchasesScreen(),
                '/quick-pos': (context) => const QuickPosScreen(),
                '/emis': (context) => const EmisScreen(),
                '/role-management': (context) => const RoleManagementScreen(),
                '/feature-permissions': (context) => const FeaturePermissionsScreen(),
                '/payment-settings': (context) => const PaymentSettingsScreen(),
                '/customer-products': (context) => const CustomerProductsScreen(),
                '/support-tickets': (context) => const SupportTicketsScreen(),
                '/support': (context) => const SupportScreen(),
                '/audit-tasks': (context) => const AuditTasksScreen(),
                '/b2b-shop': (context) => const B2BShopScreen(),
                '/purchase-orders': (context) => const PurchaseOrdersScreen(),
                '/subscription-billing': (context) => const BillingScreen(),
                '/users': (context) => const UsersScreen(),
                '/printer-settings': (context) => const PrinterSettingsScreen(),
                '/shift-management': (context) => const ShiftScreen(),
                '/queue-dashboard': (context) => const QueueDashboardScreen(),
                '/manager-approvals': (context) => const ManagerApprovalsScreen(),
                '/self-checkout': (context) => const SelfCheckoutScreen(),
                '/superadmin/subscriptions': (context) => const SubscriptionsScreen(),
                '/superadmin/reports': (context) => const SuperReportsScreen(),
                '/superadmin/admins': (context) => const AdminManagementScreen(),
                '/app-store': (context) => const AppStoreScreen(),
            },
          );
        },
      ),
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> with WidgetsBindingObserver {
  final BiometricService _biometricService = BiometricService();
  bool _isAuthenticating = false;
  DateTime? _lastPausedTime;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    // Try to create default admin on app start
    Future.microtask(() async {
      try {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        await authProvider.initAdmin();
      } catch (e) {
        // Ignore, admin might already exist
      }
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (state == AppLifecycleState.paused) {
      _lastPausedTime = DateTime.now();
    } else if (state == AppLifecycleState.resumed) {
      if (_lastPausedTime != null && authProvider.isAuthenticated) {
        final inactivityDuration = DateTime.now().difference(_lastPausedTime!);
        if (inactivityDuration.inSeconds >= authProvider.securitySettings.autoLockInactivitySeconds &&
            (authProvider.securitySettings.enableFingerprint || 
             authProvider.securitySettings.enableFaceUnlock ||
             authProvider.securitySettings.requireAuthOnAppOpen)) {
          authProvider.setLocked(true);
          _authenticate(authProvider);
        }
      }
    }
  }

  Future<void> _authenticate(AuthProvider authProvider) async {
    if (_isAuthenticating) return;
    _isAuthenticating = true;
    try {
      final success = await _biometricService.authenticate(
        reason: 'Authenticate to access Stock Pilot',
      );
      if (success && mounted) {
        authProvider.setLocked(false);
        await authProvider.updateLastActivity();
      }
    } catch (e) {
      debugPrint('Authentication error: $e');
    } finally {
      _isAuthenticating = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, child) {
        if (!auth.isInitialized) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }
        
        if (auth.isAuthenticated) {
          if (auth.isLocked) {
            return Scaffold(
              body: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.lock, size: 80, color: Colors.grey),
                    const SizedBox(height: 24),
                    Text(
                      'Stock Pilot is locked',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: () => _authenticate(auth),
                      icon: const Icon(Icons.fingerprint),
                      label: const Text('Authenticate to Unlock'),
                    ),
                  ],
                ),
              ),
            );
          }
          
          // Check if we need to authenticate on app open
          if (auth.securitySettings.requireAuthOnAppOpen ||
              auth.securitySettings.enableFingerprint ||
              auth.securitySettings.enableFaceUnlock) {
            Future.microtask(() => _authenticate(auth));
          }
          
          if (auth.account?.role == 'CUSTOMER') {
            return const CustomerDashboardScreen();
          }
          
          return const DashboardScreen();
        } else {
          return const LoginScreen();
        }
      },
    );
  }
}
