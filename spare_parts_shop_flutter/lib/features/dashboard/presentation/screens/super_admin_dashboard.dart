import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:stock_pilot/core/constants/app_colors.dart';
import 'package:stock_pilot/core/providers/theme_provider.dart';
import 'package:stock_pilot/core/widgets/kpi_card.dart';

class SuperAdminDashboard extends ConsumerWidget {
  const SuperAdminDashboard({super.key});

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
                      'Platform Overview',
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
                      title: 'Total Businesses',
                      value: '284',
                      icon: FontAwesomeIcons.building,
                      iconColor: AppColors.primary,
                      change: '+12%',
                      isPositive: true,
                    ),
                    KpiCard(
                      title: 'Active Businesses',
                      value: '267',
                      icon: FontAwesomeIcons.gaugeHigh,
                      iconColor: AppColors.success,
                    ),
                    KpiCard(
                      title: 'Monthly Revenue',
                      value: '₹1,24,580',
                      icon: FontAwesomeIcons.indianRupeeSign,
                      iconColor: AppColors.secondary,
                      change: '+15%',
                      isPositive: true,
                    ),
                    KpiCard(
                      title: 'Total Users',
                      value: '1,240',
                      icon: FontAwesomeIcons.users,
                      iconColor: AppColors.warning,
                      change: '+22%',
                      isPositive: true,
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Card(
                  elevation: 0,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Recent Activity',
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: 4,
                          separatorBuilder: (context, index) => const Divider(),
                          itemBuilder: (context, index) {
                            return ListTile(
                              leading: CircleAvatar(
                                backgroundColor: AppColors.primary.withOpacity(0.1),
                                child: Icon(
                                  index % 2 == 0
                                      ? FontAwesomeIcons.squarePlus
                                      : FontAwesomeIcons.bell,
                                  color: AppColors.primary,
                                ),
                              ),
                              title: Text(
                                index % 2 == 0
                                    ? 'New Admin Registered'
                                    : 'New Purchase Order',
                              ),
                              subtitle: Text('${(index + 1) * 2} minutes ago'),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
