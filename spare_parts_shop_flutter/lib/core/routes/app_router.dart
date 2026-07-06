import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:stock_pilot/core/constants/app_constants.dart';
import 'package:stock_pilot/features/admins/presentation/screens/admins_screen.dart';
import 'package:stock_pilot/features/analytics/presentation/screens/analytics_screen.dart';
import 'package:stock_pilot/features/authentication/domain/providers/auth_provider.dart';
import 'package:stock_pilot/features/authentication/presentation/screens/login_screen.dart';
import 'package:stock_pilot/features/authentication/presentation/screens/splash_screen.dart';
import 'package:stock_pilot/features/bills/presentation/screens/bills_screen.dart';
import 'package:stock_pilot/features/billing/presentation/screens/billing_screen.dart';
import 'package:stock_pilot/features/businesses/presentation/screens/businesses_screen.dart';
import 'package:stock_pilot/features/customers/presentation/screens/customers_screen.dart';
import 'package:stock_pilot/features/dashboard/presentation/screens/admin_dashboard.dart';
import 'package:stock_pilot/features/dashboard/presentation/screens/customer_dashboard.dart';
import 'package:stock_pilot/features/dashboard/presentation/screens/super_admin_dashboard.dart';
import 'package:stock_pilot/features/main/presentation/screens/main_screen.dart';
import 'package:stock_pilot/features/payments/presentation/screens/payments_screen.dart';
import 'package:stock_pilot/features/products/presentation/screens/products_screen.dart';
import 'package:stock_pilot/features/purchases/presentation/screens/purchases_screen.dart';
import 'package:stock_pilot/features/reports/presentation/screens/reports_screen.dart';
import 'package:stock_pilot/features/settings/presentation/screens/settings_screen.dart';
import 'package:stock_pilot/features/suppliers/presentation/screens/suppliers_screen.dart';
import 'package:stock_pilot/features/warranty/presentation/screens/warranty_screen.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authNotifierProvider);

  return GoRouter(
    initialLocation: AppConstants.splashRoute,
    redirect: (context, state) {
      if (authState is AuthLoading) {
        return AppConstants.splashRoute;
      }

      if (authState is AuthAuthenticated) {
        final user = (authState as AuthAuthenticated).user;
        if (state.uri.path == AppConstants.splashRoute ||
            state.uri.path == AppConstants.loginRoute) {
          return AppConstants.dashboardRoute;
        }
        return null;
      }

      if (authState is AuthUnauthenticated) {
        if (state.uri.path != AppConstants.loginRoute &&
            state.uri.path != AppConstants.splashRoute) {
          return AppConstants.loginRoute;
        }
        return null;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: AppConstants.splashRoute,
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: AppConstants.loginRoute,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainScreen(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppConstants.dashboardRoute,
                name: 'dashboard',
                builder: (context, state) {
                  final authState = ref.read(authNotifierProvider);
                  if (authState is AuthAuthenticated) {
                    final role = authState.user.role;
                    if (role == AppConstants.roleSuperAdmin) {
                      return const SuperAdminDashboard();
                    } else if (role == AppConstants.roleCustomer) {
                      return const CustomerDashboard();
                    } else {
                      return const AdminDashboard();
                    }
                  }
                  return const LoginScreen();
                },
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppConstants.productsRoute,
                name: 'products',
                builder: (context, state) {
                  final authState = ref.read(authNotifierProvider);
                  if (authState is AuthAuthenticated) {
                    final role = authState.user.role;
                    if (role == AppConstants.roleSuperAdmin) {
                      return const BusinessesScreen();
                    } else if (role == AppConstants.roleCustomer) {
                      return const BillsScreen();
                    } else {
                      return const ProductsScreen();
                    }
                  }
                  return const LoginScreen();
                },
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppConstants.billsRoute,
                name: 'bills',
                builder: (context, state) {
                  final authState = ref.read(authNotifierProvider);
                  if (authState is AuthAuthenticated) {
                    final role = authState.user.role;
                    if (role == AppConstants.roleSuperAdmin) {
                      return const AdminsScreen();
                    } else if (role == AppConstants.roleCustomer) {
                      return const ProductsScreen();
                    } else {
                      return const BillsScreen();
                    }
                  }
                  return const LoginScreen();
                },
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppConstants.customersRoute,
                name: 'customers',
                builder: (context, state) {
                  final authState = ref.read(authNotifierProvider);
                  if (authState is AuthAuthenticated) {
                    final role = authState.user.role;
                    if (role == AppConstants.roleSuperAdmin) {
                      return const SettingsScreen();
                    } else if (role == AppConstants.roleCustomer) {
                      return const WarrantyScreen();
                    } else {
                      return const CustomersScreen();
                    }
                  }
                  return const LoginScreen();
                },
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppConstants.purchasesRoute,
                name: 'purchases',
                builder: (context, state) {
                  final authState = ref.read(authNotifierProvider);
                  if (authState is AuthAuthenticated) {
                    return const PurchasesScreen();
                  }
                  return const LoginScreen();
                },
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppConstants.suppliersRoute,
                name: 'suppliers',
                builder: (context, state) {
                  final authState = ref.read(authNotifierProvider);
                  if (authState is AuthAuthenticated) {
                    return const SuppliersScreen();
                  }
                  return const LoginScreen();
                },
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppConstants.paymentsRoute,
                name: 'payments',
                builder: (context, state) {
                  final authState = ref.read(authNotifierProvider);
                  if (authState is AuthAuthenticated) {
                    return const PaymentsScreen();
                  }
                  return const LoginScreen();
                },
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppConstants.analyticsRoute,
                name: 'analytics',
                builder: (context, state) {
                  final authState = ref.read(authNotifierProvider);
                  if (authState is AuthAuthenticated) {
                    return const AnalyticsScreen();
                  }
                  return const LoginScreen();
                },
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppConstants.reportsRoute,
                name: 'reports',
                builder: (context, state) {
                  final authState = ref.read(authNotifierProvider);
                  if (authState is AuthAuthenticated) {
                    return const ReportsScreen();
                  }
                  return const LoginScreen();
                },
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppConstants.settingsRoute,
                name: 'settings',
                builder: (context, state) {
                  final authState = ref.read(authNotifierProvider);
                  if (authState is AuthAuthenticated) {
                    return const SettingsScreen();
                  }
                  return const LoginScreen();
                },
              ),
            ],
          ),
        ],
      ),
    ],
  );
});
