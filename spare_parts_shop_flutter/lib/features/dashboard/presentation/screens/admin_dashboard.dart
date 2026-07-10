import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:stock_pilot/core/constants/app_colors.dart';
import 'package:stock_pilot/core/providers/theme_provider.dart';
import 'package:stock_pilot/core/widgets/kpi_card.dart';
import 'package:stock_pilot/models/admin_dashboard_response.dart';
import 'package:stock_pilot/services/api_service.dart';

class AdminDashboard extends ConsumerStatefulWidget {
  const AdminDashboard({super.key});

  @override
  ConsumerState<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends ConsumerState<AdminDashboard> {
  final ApiService _apiService = ApiService();
  AdminDashboardResponse? _stats;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final data = await _apiService.getAdminDashboard();
      if (mounted) {
        setState(() {
          _stats = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    
    if (_stats == null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Failed to load dashboard'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  setState(() => _isLoading = true);
                  _loadData();
                },
                child: const Text('Tap to Retry'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadData,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
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
                      value: '₹${_stats!.todaySales.toStringAsFixed(0)}',
                      icon: FontAwesomeIcons.indianRupeeSign,
                      iconColor: AppColors.success,
                      change: '+12%',
                      isPositive: true,
                    ),
                    KpiCard(
                      title: 'Total Products',
                      value: _stats!.totalProducts.toString(),
                      icon: FontAwesomeIcons.boxesStacked,
                      iconColor: AppColors.primary,
                    ),
                    KpiCard(
                      title: 'Low Stock',
                      value: _stats!.lowStockCount.toString(),
                      icon: FontAwesomeIcons.triangleExclamation,
                      iconColor: AppColors.warning,
                    ),
                    KpiCard(
                      title: 'Customers',
                      value: _stats!.totalCustomers.toString(),
                      icon: FontAwesomeIcons.users,
                      iconColor: AppColors.secondary,
                      change: '+${_stats!.customerGrowthPercent}%',
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
                          itemCount: _stats!.recentActivity.length,
                          separatorBuilder: (context, index) => const Divider(),
                          itemBuilder: (context, index) {
                            final activity = _stats!.recentActivity[index];
                            return ListTile(
                              leading: CircleAvatar(
                                backgroundColor: AppColors.primary.withOpacity(0.1),
                                child: Icon(FontAwesomeIcons.bolt, size: 16, color: AppColors.primary),
                              ),
                              title: Text(activity.text),
                              subtitle: Text(activity.time),
                              trailing: Text(
                                activity.color,
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
    ));
  }
}
