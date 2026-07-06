import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:stock_pilot/core/providers/theme_provider.dart';

class ReportsScreen extends ConsumerWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Reports',
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 24),
              
              // Report Categories Grid
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                children: [
                  _buildReportCard(
                    context,
                    icon: FontAwesomeIcons.fileInvoiceDollar,
                    title: 'Sales Reports',
                    subtitle: 'Daily, weekly, monthly sales',
                    color: Colors.blue,
                  ),
                  _buildReportCard(
                    context,
                    icon: FontAwesomeIcons.cartShopping,
                    title: 'Purchase Reports',
                    subtitle: 'Purchase history & analysis',
                    color: Colors.green,
                  ),
                  _buildReportCard(
                    context,
                    icon: FontAwesomeIcons.boxesStacked,
                    title: 'Inventory Reports',
                    subtitle: 'Stock levels & movements',
                    color: Colors.orange,
                  ),
                  _buildReportCard(
                    context,
                    icon: FontAwesomeIcons.userGroup,
                    title: 'Customer Reports',
                    subtitle: 'Customer activity & stats',
                    color: Colors.purple,
                  ),
                  _buildReportCard(
                    context,
                    icon: FontAwesomeIcons.moneyBillTransfer,
                    title: 'Payment Reports',
                    subtitle: 'Payments received & pending',
                    color: Colors.teal,
                  ),
                  _buildReportCard(
                    context,
                    icon: FontAwesomeIcons.chartPie,
                    title: 'Tax Reports',
                    subtitle: 'GST & tax summaries',
                    color: Colors.red,
                  ),
                ],
              ),
              
              const SizedBox(height: 32),
              
              // Quick Actions
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Quick Actions',
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ListTile(
                        leading: const FaIcon(FontAwesomeIcons.fileExport),
                        title: const Text('Export All Data'),
                        subtitle: const Text('Download CSV/Excel files'),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Export feature coming soon')),
                          );
                        },
                      ),
                      const Divider(height: 1),
                      ListTile(
                        leading: const FaIcon(FontAwesomeIcons.calendarDays),
                        title: const Text('Custom Date Range'),
                        subtitle: const Text('Generate reports for specific dates'),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Custom date range coming soon')),
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
    );
  }

  Widget _buildReportCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
  }) {
    final theme = Theme.of(context);
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('$title coming soon')),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: FaIcon(
                  icon,
                  color: color,
                  size: 32,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                textAlign: TextAlign.center,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurface.withOpacity(0.6),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
