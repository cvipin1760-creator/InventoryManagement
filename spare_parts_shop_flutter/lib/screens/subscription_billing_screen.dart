import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../constants/app_theme.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class BillingScreen extends StatefulWidget {
  const BillingScreen({super.key});

  @override
  State<BillingScreen> createState() => _BillingScreenState();
}

class _BillingScreenState extends State<BillingScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = false;

  final List<Map<String, dynamic>> _plans = [
    {
      'name': 'Basic',
      'price': '₹999/mo',
      'features': [
        '1 Branch',
        'Up to 3 Users',
        '500 Invoices/month',
        'Basic Support',
      ],
      'color': Colors.blue,
    },
    {
      'name': 'Premium',
      'price': '₹2999/mo',
      'features': [
        'Up to 3 Branches',
        'Up to 10 Users',
        '2000 Invoices/month',
        'Priority Support',
        'Advanced Analytics',
      ],
      'color': Colors.purple,
      'isPopular': true,
    },
    {
      'name': 'Enterprise',
      'price': '₹5999/mo',
      'features': [
        'Unlimited Branches',
        'Unlimited Users',
        'Unlimited Invoices',
        '24/7 Dedicated Support',
        'Custom Integrations',
      ],
      'color': Colors.orange,
    },
  ];

  Future<void> _upgradePlan(String planName) async {
    setState(() => _isLoading = true);
    try {
      // Mocking payment checkout session
      await Future.delayed(const Duration(seconds: 1)); 
      
      // Navigate to payment mock screen or trigger backend upgrade
      // For now we'll just hit the upgrade endpoint directly to simulate successful payment
      final response = await _apiService.updateSubscription(0, planName); // 0 is dummy id, backend uses TenantContext
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Successfully upgraded to $planName plan!'), backgroundColor: AppTheme.successColor),
        );
        Navigator.pushReplacementNamed(context, '/dashboard');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to process payment: $e'), backgroundColor: AppTheme.errorColor),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Subscription & Billing'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'Choose Your Plan',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Upgrade your subscription to unlock more features and grow your business.',
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 32),
                  LayoutBuilder(
                    builder: (context, constraints) {
                      if (constraints.maxWidth > 800) {
                        return Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: _plans.map((plan) => Expanded(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 8.0),
                              child: _buildPlanCard(plan),
                            ),
                          )).toList(),
                        );
                      } else {
                        return Column(
                          children: _plans.map((plan) => Padding(
                            padding: const EdgeInsets.only(bottom: 16.0),
                            child: _buildPlanCard(plan),
                          )).toList(),
                        );
                      }
                    },
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildPlanCard(Map<String, dynamic> plan) {
    final bool isPopular = plan['isPopular'] ?? false;
    final Color color = plan['color'];

    return Card(
      elevation: isPopular ? 8 : 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: isPopular ? BorderSide(color: color, width: 2) : BorderSide.none,
      ),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            if (isPopular)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'MOST POPULAR',
                  style: TextStyle(
                    color: color,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            Text(
              plan['name'],
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Text(
              plan['price'],
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: color),
            ),
            const SizedBox(height: 24),
            const Divider(),
            const SizedBox(height: 16),
            ...List.generate(
              plan['features'].length,
              (index) => Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: Row(
                  children: [
                    Icon(Icons.check_circle, color: color, size: 20),
                    const SizedBox(width: 12),
                    Expanded(child: Text(plan['features'][index])),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => _upgradePlan(plan['name']),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isPopular ? color : Theme.of(context).cardColor,
                  foregroundColor: isPopular ? Colors.white : color,
                  side: BorderSide(color: color),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Select Plan', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
