import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:stock_pilot/core/constants/app_constants.dart';
import 'package:stock_pilot/core/providers/theme_provider.dart';
import 'package:stock_pilot/features/authentication/domain/providers/auth_provider.dart';

class MainScreen extends ConsumerWidget {
  final StatefulNavigationShell navigationShell;

  const MainScreen({
    super.key,
    required this.navigationShell,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);
    final theme = Theme.of(context);

    if (authState is! AuthAuthenticated) {
      return const Scaffold();
    }

    final userRole = authState.user.role;

    List<NavigationDestination> _getNavItems() {
      switch (userRole) {
        case AppConstants.roleSuperAdmin:
          return const [
            NavigationDestination(
              icon: Icon(FontAwesomeIcons.gaugeHigh),
              label: 'Dashboard',
            ),
            NavigationDestination(
              icon: Icon(FontAwesomeIcons.building),
              label: 'Businesses',
            ),
            NavigationDestination(
              icon: Icon(FontAwesomeIcons.users),
              label: 'Admins',
            ),
            NavigationDestination(
              icon: Icon(FontAwesomeIcons.gear),
              label: 'Settings',
            ),
          ];
        case AppConstants.roleCustomer:
          return const [
            NavigationDestination(
              icon: Icon(FontAwesomeIcons.gaugeHigh),
              label: 'Dashboard',
            ),
            NavigationDestination(
              icon: Icon(FontAwesomeIcons.fileInvoiceDollar),
              label: 'Bills',
            ),
            NavigationDestination(
              icon: Icon(FontAwesomeIcons.box),
              label: 'Products',
            ),
            NavigationDestination(
              icon: Icon(FontAwesomeIcons.shield),
              label: 'Warranty',
            ),
          ];
        default:
          return const [
            NavigationDestination(
              icon: Icon(FontAwesomeIcons.gaugeHigh),
              label: 'Dashboard',
            ),
            NavigationDestination(
              icon: Icon(FontAwesomeIcons.box),
              label: 'Products',
            ),
            NavigationDestination(
              icon: Icon(FontAwesomeIcons.receipt),
              label: 'Bills',
            ),
            NavigationDestination(
              icon: Icon(FontAwesomeIcons.users),
              label: 'Customers',
            ),
            NavigationDestination(
              icon: Icon(FontAwesomeIcons.cartShopping),
              label: 'Purchases',
            ),
            NavigationDestination(
              icon: Icon(FontAwesomeIcons.truck),
              label: 'Suppliers',
            ),
            NavigationDestination(
              icon: Icon(FontAwesomeIcons.moneyBillTransfer),
              label: 'Payments',
            ),
            NavigationDestination(
              icon: Icon(FontAwesomeIcons.chartLine),
              label: 'Analytics',
            ),
            NavigationDestination(
              icon: Icon(FontAwesomeIcons.fileLines),
              label: 'Reports',
            ),
            NavigationDestination(
              icon: Icon(FontAwesomeIcons.gear),
              label: 'Settings',
            ),
          ];
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Stock Pilot'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          IconButton(
            onPressed: () => ref.read(themeModeProvider.notifier).toggleTheme(),
            icon: FaIcon(
              theme.brightness == Brightness.light
                  ? FontAwesomeIcons.moon
                  : FontAwesomeIcons.sun,
            ),
          ),
          PopupMenuButton(
            itemBuilder: (context) => [
              PopupMenuItem(
                child: const ListTile(
                  leading: Icon(Icons.settings_outlined),
                  title: Text('Settings'),
                ),
                onTap: () => context.go(AppConstants.settingsRoute),
              ),
              PopupMenuItem(
                child: const ListTile(
                  leading: Icon(Icons.logout_outlined),
                  title: Text('Logout'),
                ),
                onTap: () => ref.read(authNotifierProvider.notifier).logout(),
              ),
            ],
          ),
        ],
      ),
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: navigationShell.goBranch,
        destinations: _getNavItems(),
      ),
    );
  }
}
