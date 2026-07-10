import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'package:intl/intl.dart';

class CustomerEmiScreen extends StatefulWidget {
  const CustomerEmiScreen({super.key});

  @override
  State<CustomerEmiScreen> createState() => _CustomerEmiScreenState();
}

class _CustomerEmiScreenState extends State<CustomerEmiScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<dynamic> _emis = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    try {
      final data = await _apiService.getEmis();
      setState(() { _emis = data; _isLoading = false; });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('EMI Options'),
        actions: [IconButton(icon: const Icon(Icons.refresh), onPressed: _load)],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Pre-approved limit banner
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [theme.colorScheme.primary, theme.colorScheme.primary.withOpacity(0.7)],
                        ),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Column(
                        children: [
                          Icon(Icons.account_balance_wallet, size: 40, color: Colors.white70),
                          SizedBox(height: 8),
                          Text('Pre-Approved Limit', style: TextStyle(color: Colors.white70, fontSize: 14)),
                          SizedBox(height: 4),
                          Text('₹50,000', style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                          SizedBox(height: 8),
                          Text(
                            'Convert any purchase above ₹5,000 into easy EMIs at checkout.',
                            style: TextStyle(color: Colors.white60, fontSize: 12),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text('Active EMIs', style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    if (_emis.isEmpty)
                      Card(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: const Padding(
                          padding: EdgeInsets.all(32),
                          child: Center(child: Text('No active EMIs found.', style: TextStyle(color: Colors.grey))),
                        ),
                      )
                    else
                      ..._emis.map((emi) {
                        final total = (emi['totalEmis'] as num?)?.toInt() ?? 1;
                        final paid = (emi['emisPaid'] as num?)?.toInt() ?? 0;
                        final progress = total > 0 ? paid / total : 0.0;
                        final emiAmount = (emi['emiAmount'] as num?)?.toDouble() ?? 0.0;
                        final remaining = (emi['emisRemaining'] as num?)?.toInt() ?? 0;
                        final nextDate = emi['nextEmiDate'] != null
                            ? DateFormat.yMMMd().format(DateTime.parse(emi['nextEmiDate']))
                            : 'N/A';

                        return Card(
                          margin: const EdgeInsets.only(bottom: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        emi['planName'] ?? 'Purchase Finance',
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                      ),
                                    ),
                                    Text(
                                      '₹${emiAmount.toStringAsFixed(0)} / mo',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: theme.colorScheme.primary,
                                        fontSize: 16,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('Progress ($paid/$total months)', style: const TextStyle(fontSize: 13, color: Colors.grey)),
                                    Text('${(progress * 100).round()}% Paid', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(4),
                                  child: LinearProgressIndicator(
                                    value: progress,
                                    minHeight: 10,
                                    backgroundColor: Colors.grey[200],
                                    valueColor: AlwaysStoppedAnimation(theme.colorScheme.primary),
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Row(
                                  children: [
                                    _emiStat(Icons.schedule, Colors.orange, 'Next Due', nextDate),
                                    const SizedBox(width: 16),
                                    _emiStat(Icons.account_balance_wallet, Colors.blue, 'Remaining', '₹${(emiAmount * remaining).toStringAsFixed(0)}'),
                                    const SizedBox(width: 16),
                                    _emiStat(Icons.check_circle, Colors.green, 'Total Paid', '₹${(emiAmount * paid).toStringAsFixed(0)}'),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                    const SizedBox(height: 8),
                    Card(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: const Padding(
                        padding: EdgeInsets.all(20),
                        child: Column(
                          children: [
                            Text('Looking for new financing?', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            SizedBox(height: 8),
                            Text(
                              'We are partnering with top financial institutions to bring you instant EMI approvals. Stay tuned!',
                              style: TextStyle(color: Colors.grey),
                              textAlign: TextAlign.center,
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

  Widget _emiStat(IconData icon, Color color, String label, String value) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
          Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
