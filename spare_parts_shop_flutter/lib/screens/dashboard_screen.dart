import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../models/dashboard_stats.dart';
import '../constants/app_theme.dart';
import '../providers/auth_provider.dart';
import 'users_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ApiService _apiService = ApiService();
  DashboardStats? _stats;
  List<dynamic> _branches = [];
  dynamic _selectedBranch;
  int _unreadNotifications = 0;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final stats = await _apiService.getDashboardStats();
      final branches = await _apiService.getBranches();
      final unreadCount = await _apiService.getUnreadNotificationCount();
      if (mounted) {
        setState(() {
          _stats = stats;
          _branches = branches;
          _unreadNotifications = unreadCount;
          if (_branches.isNotEmpty) {
            _selectedBranch = _branches.firstWhere((b) => b['isMain'] == true, orElse: () => _branches.first);
          }
          _isLoading = false;
          _errorMessage = null;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _stats = null;
          _branches = [];
          _isLoading = false;
          _errorMessage = e.toString().replaceFirst('Exception: ', '');
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final isAdmin = authProvider.isAdmin;

    return Scaffold(
      appBar: AppBar(
        title: _branches.isEmpty 
          ? const Text('Stock Pilot')
          : DropdownButtonHideUnderline(
              child: DropdownButton<dynamic>(
                value: _selectedBranch,
                dropdownColor: AppTheme.primaryColor,
                icon: const Icon(Icons.arrow_drop_down, color: Colors.white),
                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                items: _branches.map((b) => DropdownMenuItem(value: b, child: Text(b['name']))).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedBranch = val);
                },
              ),
            ),
        actions: [
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.notifications),
                onPressed: () {
                  Navigator.pushNamed(context, '/notifications').then((_) => _loadData());
                },
              ),
              if (_unreadNotifications > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                    child: Text(
                      '$_unreadNotifications',
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
          PopupMenuButton<dynamic>(
            itemBuilder: (context) => [
              PopupMenuItem<dynamic>(
                enabled: false,
                child: ListTile(
                  leading: const Icon(Icons.person_outline),
                  title: Text('Signed in as ${authProvider.username}'),
                  subtitle: Text(authProvider.role ?? ''),
                ),
              ),
              const PopupMenuDivider(),
              if (isAdmin)
                PopupMenuItem<dynamic>(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const UsersScreen(),
                      ),
                    );
                  },
                  child: const ListTile(
                    leading: Icon(Icons.manage_accounts_outlined),
                    title: Text('Manage Users'),
                  ),
                ),
              PopupMenuItem<dynamic>(
                onTap: () {
                  authProvider.logout();
                },
                child: const ListTile(
                  leading: Icon(Icons.logout_outlined),
                  title: Text('Logout'),
                ),
              ),
            ],
          ),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: BoxDecoration(
                color: AppTheme.primaryColor,
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    'Stock Pilot',
                    style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Enterprise Edition',
                    style: TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.dashboard),
              title: const Text('Dashboard'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(FontAwesomeIcons.chartLine),
              title: const Text('Predictive Analytics'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/predictive-analytics');
              },
            ),
            ListTile(
              leading: const Icon(Icons.inventory),
              title: const Text('Products'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/products');
              },
            ),
            ListTile(
              leading: const Icon(Icons.people),
              title: const Text('Customers'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/customers');
              },
            ),
            ListTile(
              leading: const Icon(Icons.local_shipping),
              title: const Text('Suppliers'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/suppliers');
              },
            ),
            ListTile(
              leading: const Icon(Icons.receipt),
              title: const Text('Bills'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/bills');
              },
            ),
            ListTile(
              leading: const Icon(Icons.document_scanner),
              title: const Text('Bill Templates'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/bill-templates');
              },
            ),
            ListTile(
              leading: const Icon(Icons.shopping_cart),
              title: const Text('Purchases'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/purchases');
              },
            ),
            ListTile(
              leading: const Icon(Icons.payment),
              title: const Text('Payments'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/payments');
              },
            ),
            ListTile(
              leading: const Icon(Icons.account_balance),
              title: const Text('Accounting Exports'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/accounting');
              },
            ),
            const Divider(),
            if (isAdmin) ...[
              const Padding(
                padding: EdgeInsets.only(left: 16.0, top: 8.0, bottom: 8.0),
                child: Text('Administration', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
              ),
              ListTile(
                leading: const Icon(Icons.store),
                title: const Text('Branches'),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/branches');
                },
              ),
              ListTile(
                leading: const Icon(Icons.badge),
                title: const Text('Staff & Permissions'),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/staff');
                },
              ),
              ListTile(
                leading: const Icon(Icons.settings),
                title: const Text('Business Settings'),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/business-settings');
                },
              ),
            ],
          ],
        ),
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _errorMessage != null || _stats == null
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.error_outline, size: 60, color: Colors.red[300]),
                        const SizedBox(height: 16),
                        Text(
                          _errorMessage ?? 'No data available',
                          style: const TextStyle(fontSize: 16, color: Colors.red),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton.icon(
                          onPressed: () {
                            setState(() => _isLoading = true);
                            _loadData();
                          },
                          icon: const Icon(Icons.refresh),
                          label: const Text('Tap to Retry'),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                          ),
                        ),
                      ],
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _loadData,
                    child: SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _buildQuickActions(isAdmin),
                          const SizedBox(height: 24),
                          _buildStatsGrid(),
                          const SizedBox(height: 24),
                          _buildChartsSection(),
                        ],
                      ),
                    ),
                  ),
      ),
    );
  }

  Widget _buildQuickActions(bool isAdmin) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.pushNamed(context, '/create-bill');
                },
                icon: const Icon(Icons.add),
                label: const Text('New Bill'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {
                  Navigator.pushNamed(context, '/create-purchase');
                },
                icon: const Icon(Icons.shopping_bag_outlined),
                label: const Text('New Purchase'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ),
          ],
        ),
        if (isAdmin) const SizedBox(height: 16),
        if (isAdmin)
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const UsersScreen(),
                  ),
                );
              },
              icon: const Icon(Icons.manage_accounts_outlined),
              label: const Text('Manage Users'),
            ),
          ),
      ],
    );
  }

  Widget _buildStatsGrid() {
    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = constraints.maxWidth > 1000
            ? 4
            : constraints.maxWidth > 600
                ? 3
                : 2;
        return GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: crossAxisCount,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          children: [
            _buildStatCard(
              'Today\'s Sales',
              '₹${_stats!.todaySales.toStringAsFixed(2)}',
              FontAwesomeIcons.indianRupeeSign,
              AppTheme.secondaryColor,
            ),
            _buildStatCard(
              'Today\'s Bills',
              _stats!.todayBillsCount.toString(),
              FontAwesomeIcons.receipt,
              AppTheme.primaryColor,
            ),
            _buildStatCard(
              'Low Stock',
              _stats!.lowStockCount.toString(),
              FontAwesomeIcons.triangleExclamation,
              AppTheme.errorColor,
            ),
            _buildStatCard(
              'Total Products',
              _stats!.totalProducts.toString(),
              FontAwesomeIcons.box,
              AppTheme.successColor,
            ),
          ],
        );
      },
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                size: 28,
                color: color,
              ),
            ),
            const SizedBox(height: 12),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                title,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
              ),
            ),
            const SizedBox(height: 6),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                value,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChartsSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Recent Trends',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              height: 200,
              child: LineChart(
                LineChartData(
                  gridData: FlGridData(
                    show: true,
                    drawVerticalLine: false,
                  ),
                  titlesData: FlTitlesData(
                    show: true,
                    topTitles: AxisTitles(),
                    rightTitles: AxisTitles(),
                  ),
                  borderData: FlBorderData(show: false),
                  lineBarsData: [
                    LineChartBarData(
                      spots: [
                        const FlSpot(0, 100),
                        const FlSpot(1, 150),
                        const FlSpot(2, 120),
                        const FlSpot(3, 180),
                        const FlSpot(4, 140),
                        const FlSpot(5, 200),
                        const FlSpot(6, 170),
                      ],
                      isCurved: true,
                      color: AppTheme.primaryColor,
                      dotData: FlDotData(show: false),
                      belowBarData: BarAreaData(
                        show: true,
                        color: AppTheme.primaryColor.withValues(alpha: 0.1),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
