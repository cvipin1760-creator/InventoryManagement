import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:stock_pilot/core/constants/app_colors.dart';
import 'package:stock_pilot/core/providers/theme_provider.dart';
import 'package:stock_pilot/core/widgets/kpi_card.dart';

class CustomerDashboard extends ConsumerWidget {
  const CustomerDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Welcome Back!',
                      style: theme.textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    IconButton(
                      onPressed: () => ref.read(themeModeProvider.notifier).toggleTheme(),
                      icon: FaIcon(
                        theme.brightness == Brightness.light
                            ? FontAwesomeIcons.moon
                            : FontAwesomeIcons.sun,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 1.2,
                  children: [
                    KpiCard(
                      title: 'Total Purchases',
                      value: '12',
                      icon: FontAwesomeIcons.cartShopping,
                      iconColor: AppColors.primary,
                    ),
                    KpiCard(
                      title: 'Active Warranties',
                      value: '3',
                      icon: FontAwesomeIcons.shield,
                      iconColor: AppColors.success,
                    ),
                    KpiCard(
                      title: 'Active EMI',
                      value: '1',
                      icon: FontAwesomeIcons.moneyBillTransfer,
                      iconColor: AppColors.secondary,
                    ),
                    KpiCard(
                      title: 'Total Spent',
                      value: '₹45,800',
                      icon: FontAwesomeIcons.receipt,
                      iconColor: AppColors.warning,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
