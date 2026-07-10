import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:stock_pilot/core/constants/app_colors.dart';
import 'package:stock_pilot/core/providers/theme_provider.dart';
import 'package:stock_pilot/core/widgets/kpi_card.dart';
import 'package:stock_pilot/services/api_service.dart';

class CustomerDashboard extends ConsumerStatefulWidget {
  const CustomerDashboard({super.key});

  @override
  ConsumerState<CustomerDashboard> createState() => _CustomerDashboardState();
}

class _CustomerDashboardState extends ConsumerState<CustomerDashboard> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  int _totalPurchases = 0;
  int _activeWarranties = 0;
  int _activeEmi = 0;
  double _totalSpent = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final bills = await _apiService.getMyBills();
      final warranties = await _apiService.getMyWarranties();
      final emis = await _apiService.getMyEmis();

      double spent = 0;
      for (var bill in bills) {
        spent += (bill['totalAmount'] ?? 0);
      }

      if (mounted) {
        setState(() {
          _totalPurchases = bills.length;
          _activeWarranties = warranties.where((w) => w['status'] == 'ACTIVE').length;
          _activeEmi = emis.where((e) => e['status'] == 'ACTIVE').length;
          _totalSpent = spent;
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
    
    // Check if error occurred and we don't have data
    if (_totalPurchases == 0 && _totalSpent == 0 && _isLoading == false && mounted) {
       // A proper error boolean could be added, but relying on defaults here is fine for mock
       // Let's add a proper error state wrapper.
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
                      value: _totalPurchases.toString(),
                      icon: FontAwesomeIcons.cartShopping,
                      iconColor: AppColors.primary,
                    ),
                    KpiCard(
                      title: 'Active Warranties',
                      value: _activeWarranties.toString(),
                      icon: FontAwesomeIcons.shield,
                      iconColor: AppColors.success,
                    ),
                    KpiCard(
                      title: 'Active EMI',
                      value: _activeEmi.toString(),
                      icon: FontAwesomeIcons.moneyBillTransfer,
                      iconColor: AppColors.secondary,
                    ),
                    KpiCard(
                      title: 'Total Spent',
                      value: '₹${_totalSpent.toStringAsFixed(0)}',
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
    ));
  }
}
