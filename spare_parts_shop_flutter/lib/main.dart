
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';
import 'constants/app_config.dart';
import 'constants/app_theme.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/customers_screen.dart';
import 'screens/suppliers_screen.dart';
import 'screens/products_screen.dart';
import 'screens/bills_screen.dart';
import 'screens/create_bill_screen.dart';
import 'screens/purchases_screen.dart';
import 'screens/create_purchase_screen.dart';
import 'screens/payments_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final themeProvider = ThemeProvider();
  await themeProvider.loadTheme();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => themeProvider),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, child) {
        return MaterialApp(
          title: '${AppConfig.appName} - ${AppConfig.tagline}',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: themeProvider.themeMode,
          initialRoute: '/',
          routes: {
            '/': (context) => const SplashScreen(),
            '/login': (context) => const LoginScreen(),
            '/dashboard': (context) => const MainScreen(),
            '/create-bill': (context) => const CreateBillScreen(),
            '/create-purchase': (context) => const CreatePurchaseScreen(),
          },
        );
      },
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = const [
    DashboardScreen(),
    CustomersScreen(),
    SuppliersScreen(),
    ProductsScreen(),
    BillsScreen(),
    PurchasesScreen(),
    PaymentsScreen(),
  ];

  final List<String> _titles = const [
    'Dashboard',
    'Customers',
    'Suppliers',
    'Products',
    'Bills',
    'Purchases',
    'Payments',
  ];

  final List<IconData> _icons = const [
    Icons.dashboard,
    Icons.people,
    Icons.local_shipping,
    Icons.inventory,
    Icons.receipt,
    Icons.shopping_cart,
    Icons.payment,
  ];

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth > 1000) {
          return _buildDesktopLayout();
        } else if (constraints.maxWidth > 600) {
          return _buildTabletLayout();
        } else {
          return _buildMobileLayout();
        }
      },
    );
  }

  Widget _buildMobileLayout() {
    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_selectedIndex]),
        actions: [
          Consumer<ThemeProvider>(
            builder: (context, themeProvider, child) {
              return IconButton(
                icon: Icon(
                  themeProvider.themeMode == ThemeMode.dark
                      ? Icons.light_mode
                      : Icons.dark_mode,
                ),
                onPressed: () => themeProvider.toggleTheme(),
              );
            },
          ),
          Consumer<AuthProvider>(
            builder: (context, authProvider, child) {
              return IconButton(
                icon: const Icon(Icons.logout),
                onPressed: () async {
                  await authProvider.logout();
                  if (mounted) {
                    Navigator.pushReplacementNamed(context, '/login');
                  }
                },
              );
            },
          ),
        ],
      ),
      body: _screens[_selectedIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        destinations: _titles
            .asMap()
            .entries
            .map((e) => NavigationDestination(
                  icon: Icon(_icons[e.key]),
                  label: e.value,
                ))
            .toList(),
      ),
    );
  }

  Widget _buildTabletLayout() {
    return Scaffold(
      body: Row(
        children: [
          NavigationRail(
            selectedIndex: _selectedIndex,
            onDestinationSelected: (index) {
              setState(() {
                _selectedIndex = index;
              });
            },
            labelType: NavigationRailLabelType.all,
            destinations: _titles
                .asMap()
                .entries
                .map((e) => NavigationRailDestination(
                      icon: Icon(_icons[e.key]),
                      selectedIcon: Icon(_icons[e.key]),
                      label: Text(e.value),
                    ))
                .toList(),
          ),
          Expanded(
            child: Column(
              children: [
                AppBar(
                  title: Text(_titles[_selectedIndex]),
                  actions: [
                    Consumer<ThemeProvider>(
                      builder: (context, themeProvider, child) {
                        return IconButton(
                          icon: Icon(
                            themeProvider.themeMode == ThemeMode.dark
                                ? Icons.light_mode
                                : Icons.dark_mode,
                          ),
                          onPressed: () => themeProvider.toggleTheme(),
                        );
                      },
                    ),
                    Consumer<AuthProvider>(
                      builder: (context, authProvider, child) {
                        return IconButton(
                          icon: const Icon(Icons.logout),
                          onPressed: () async {
                            await authProvider.logout();
                            if (mounted) {
                              Navigator.pushReplacementNamed(context, '/login');
                            }
                          },
                        );
                      },
                    ),
                  ],
                ),
                Expanded(child: _screens[_selectedIndex]),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDesktopLayout() {
    return Scaffold(
      body: Row(
        children: [
          NavigationDrawer(
            selectedIndex: _selectedIndex,
            onDestinationSelected: (index) {
              setState(() {
                _selectedIndex = index;
              });
            },
            children: [
              DrawerHeader(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      AppConfig.appName,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    Text(
                      AppConfig.tagline,
                      style: Theme.of(context).textTheme.labelLarge?.copyWith(
                            color: Colors.grey[600],
                          ),
                    ),
                  ],
                ),
              ),
              ..._titles
                  .asMap()
                  .entries
                  .map((e) => NavigationDrawerDestination(
                        icon: Icon(_icons[e.key]),
                        label: Text(e.value),
                      ))
                  .toList(),
            ],
          ),
          Expanded(
            child: Column(
              children: [
                AppBar(
                  title: Text(_titles[_selectedIndex]),
                  actions: [
                    Consumer<ThemeProvider>(
                      builder: (context, themeProvider, child) {
                        return IconButton(
                          icon: Icon(
                            themeProvider.themeMode == ThemeMode.dark
                                ? Icons.light_mode
                                : Icons.dark_mode,
                          ),
                          onPressed: () => themeProvider.toggleTheme(),
                        );
                      },
                    ),
                    Consumer<AuthProvider>(
                      builder: (context, authProvider, child) {
                        return IconButton(
                          icon: const Icon(Icons.logout),
                          onPressed: () async {
                            await authProvider.logout();
                            if (mounted) {
                              Navigator.pushReplacementNamed(context, '/login');
                            }
                          },
                        );
                      },
                    ),
                  ],
                ),
                Expanded(child: _screens[_selectedIndex]),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
