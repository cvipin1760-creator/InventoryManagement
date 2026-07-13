import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/payment.dart';
import '../models/customer.dart';
import '../models/customer_balance.dart';

class PaymentsScreen extends StatefulWidget {
  const PaymentsScreen({super.key});

  @override
  State<PaymentsScreen> createState() => _PaymentsScreenState();
}

class _PaymentsScreenState extends State<PaymentsScreen> {
  final ApiService _apiService = ApiService();
  List<Customer> _customers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCustomers();
  }

  Future<void> _loadCustomers() async {
    try {
      final customers = await _apiService.getCustomers();
      if (mounted) {
        setState(() {
          _customers = customers;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load customers: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payments')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _customers.isEmpty
              ? const Center(child: Text('No customers found'))
              : ListView.builder(
                  itemCount: _customers.length,
                  itemBuilder: (context, index) {
                    final customer = _customers[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.blue.shade50,
                          child: Text(customer.name.substring(0, 1).toUpperCase()),
                        ),
                        title: Text(customer.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text(customer.phone),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                        onTap: () => _showCustomerPayments(customer),
                      ),
                    );
                  },
                ),
    );
  }

  Future<void> _showCustomerPayments(Customer customer) async {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => CustomerPaymentsScreen(customer: customer),
      ),
    );
  }
}

class CustomerPaymentsScreen extends StatefulWidget {
  final Customer customer;
  const CustomerPaymentsScreen({super.key, required this.customer});

  @override
  State<CustomerPaymentsScreen> createState() => _CustomerPaymentsScreenState();
}

class _CustomerPaymentsScreenState extends State<CustomerPaymentsScreen> {
  final ApiService _apiService = ApiService();
  List<Payment> _payments = [];
  CustomerBalance? _balance;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final payments = await _apiService.getCustomerPayments(widget.customer.id);
      final balance = await _apiService.getCustomerBalance(widget.customer.id);
      if (mounted) {
        setState(() {
          _payments = payments;
          _balance = balance;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load data: $e')),
        );
      }
    }
  }

  Future<void> _recordPayment() async {
    final amountController = TextEditingController();
    final noteController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Record Payment'),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: amountController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(
                  labelText: 'Amount (₹)',
                  prefixIcon: Icon(Icons.currency_rupee),
                  border: OutlineInputBorder(),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Enter amount';
                  if (double.tryParse(val) == null || double.parse(val) <= 0) {
                    return 'Enter valid amount';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: noteController,
                decoration: const InputDecoration(
                  labelText: 'Note (e.g., Cash, UPI, Cheque)',
                  prefixIcon: Icon(Icons.notes),
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (formKey.currentState?.validate() ?? false) {
                Navigator.pop(context);
                setState(() => _isLoading = true);
                try {
                  await _apiService.createPayment({
                    'customerId': widget.customer.id,
                    'amount': double.parse(amountController.text),
                    'note': noteController.text.trim(),
                  });
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Payment recorded successfully!'), backgroundColor: Colors.green),
                    );
                  }
                  _loadData();
                } catch (e) {
                  if (mounted) {
                    setState(() => _isLoading = false);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed to record payment: $e'), backgroundColor: Colors.red),
                    );
                  }
                }
              }
            },
            child: const Text('Record'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: Text('${widget.customer.name}\'s Payments')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (_balance != null) ...[
                      Card(
                        elevation: 0,
                        color: theme.colorScheme.primaryContainer.withOpacity(0.2),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            children: [
                              const Text('Remaining Balance', style: TextStyle(color: Colors.grey, fontSize: 13)),
                              const SizedBox(height: 4),
                              Text(
                                '₹${_balance!.remainingAmount.toStringAsFixed(2)}',
                                style: TextStyle(
                                  fontSize: 32,
                                  fontWeight: FontWeight.bold,
                                  color: _balance!.remainingAmount > 0 ? Colors.red : Colors.green,
                                ),
                              ),
                              const SizedBox(height: 16),
                              Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      children: [
                                        const Text('Total Billed', style: TextStyle(color: Colors.grey, fontSize: 11)),
                                        Text('₹${_balance!.totalBilled.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                  ),
                                  Container(width: 1, height: 24, color: Colors.grey.shade300),
                                  Expanded(
                                    child: Column(
                                      children: [
                                        const Text('Total Paid', style: TextStyle(color: Colors.grey, fontSize: 11)),
                                        Text('₹${_balance!.totalPaid.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                    Text(
                      'Payment History',
                      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    if (_payments.isEmpty)
                      const Card(
                        child: Padding(
                          padding: EdgeInsets.all(32.0),
                          child: Center(child: Text('No payments recorded yet', style: TextStyle(color: Colors.grey))),
                        ),
                      )
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _payments.length,
                        itemBuilder: (context, index) {
                          final payment = _payments[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 8),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: Colors.green.shade50,
                                child: const Icon(Icons.check_circle_outline, color: Colors.green),
                              ),
                              title: Text(
                                '₹${payment.amount.toStringAsFixed(2)}',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              subtitle: Text(
                                payment.note.isNotEmpty ? payment.note : 'Payment received',
                              ),
                              trailing: Text(
                                payment.paymentDate.length >= 10
                                    ? payment.paymentDate.substring(0, 10)
                                    : payment.paymentDate,
                                style: const TextStyle(color: Colors.grey, fontSize: 12),
                              ),
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _recordPayment,
        label: const Text('Record Payment'),
        icon: const Icon(Icons.add),
      ),
    );
  }
}
