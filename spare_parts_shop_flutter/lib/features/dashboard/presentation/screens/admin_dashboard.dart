import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:stock_pilot/core/constants/app_colors.dart';
import 'package:stock_pilot/core/providers/theme_provider.dart';
import 'package:stock_pilot/core/widgets/kpi_card.dart';

class AdminDashboard extends ConsumerWidget {
  const AdminDashboard({super.key});

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
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Good Morning!',
                          style: theme.textTheme.titleLarge?.copyWith(
                            color: theme.colorScheme.onSurface.withOpacity(0.7),
                          ),
                        ),
                        Text(
                          'Business Overview',
                          style: theme.textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
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
                      title: "Today's Sales",
                      value: '₹5,840',
                      icon: FontAwesomeIcons.indianRupeeSign,
                      iconColor: AppColors.success,
                      change: '+12%',
                      isPositive: true,
                    ),
                    KpiCard(
                      title: 'Total Products',
                      value: '248',
                      icon: FontAwesomeIcons.boxesStacked,
                      iconColor: AppColors.primary,
                    ),
                    KpiCard(
                      title: 'Low Stock',
                      value: '18',
                      icon: FontAwesomeIcons.triangleExclamation,
                      iconColor: AppColors.warning,
                    ),
                    KpiCard(
                      title: 'Customers',
                      value: '128',
                      icon: FontAwesomeIcons.users,
                      iconColor: AppColors.secondary,
                      change: '+8%',
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
                          'Recent Bills',
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
                                child: Text('C${index + 1}'),
                              ),
                              title: Text('Customer ${index + 1}'),
                              subtitle: Text('Invoice #100${index + 1}'),
                              trailing: Text(
                                '₹${1200 + index * 250}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
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
