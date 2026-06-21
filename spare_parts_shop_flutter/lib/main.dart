import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:stock_pilot/constants/app_theme.dart';
import 'package:stock_pilot/providers/auth_provider.dart';
import 'package:stock_pilot/providers/theme_provider.dart';
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

void main() {
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
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return MaterialApp(
            title: 'Stock Pilot',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: themeProvider.themeMode,
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
