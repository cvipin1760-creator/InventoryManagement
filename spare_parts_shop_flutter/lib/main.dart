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
import 'package:stock_pilot/screens/purchases_screen.dart';
import 'package:stock_pilot/screens/register_screen.dart';
import 'package:stock_pilot/screens/suppliers_screen.dart';
import 'package:stock_pilot/screens/predictive_analytics_screen.dart';
import 'package:stock_pilot/screens/accounting_screen.dart';
import 'package:stock_pilot/screens/bill_templates_screen.dart';
import 'package:stock_pilot/screens/branches_screen.dart';
import 'package:stock_pilot/screens/staff_screen.dart';
import 'package:stock_pilot/screens/business_settings_screen.dart';
import 'package:stock_pilot/screens/notifications_screen.dart';
import 'package:stock_pilot/screens/subscription_billing_screen.dart';
import 'package:stock_pilot/services/api_service.dart';
import 'package:stock_pilot/services/fcm_service.dart';
import 'package:stock_pilot/services/offline_sync_service.dart';
import 'package:firebase_core/firebase_core.dart';

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
              '/bills': (context) => const BillsScreen(),
              '/purchases': (context) => const PurchasesScreen(),
              '/payments': (context) => const PaymentsScreen(),
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

class _AuthWrapperState extends State<AuthWrapper> {
  @override
  void initState() {
    super.initState();
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
          return const DashboardScreen();
        } else {
          return const LoginScreen();
        }
      },
    );
  }
}
