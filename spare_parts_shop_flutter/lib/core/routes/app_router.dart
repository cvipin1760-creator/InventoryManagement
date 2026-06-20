import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:stock_pilot/core/constants/app_constants.dart';
import 'package:stock_pilot/features/authentication/domain/providers/auth_provider.dart';
import 'package:stock_pilot/features/authentication/presentation/screens/login_screen.dart';
import 'package:stock_pilot/features/authentication/presentation/screens/splash_screen.dart';
import 'package:stock_pilot/features/dashboard/presentation/screens/admin_dashboard.dart';
import 'package:stock_pilot/features/dashboard/presentation/screens/customer_dashboard.dart';
import 'package:stock_pilot/features/dashboard/presentation/screens/super_admin_dashboard.dart';
import 'package:stock_pilot/features/main/presentation/screens/main_screen.dart';

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
        ],
      ),
    ],
  );
});
