import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/bill.dart';
import 'create_bill_screen.dart';

class BillsScreen extends StatefulWidget {
  const BillsScreen({super.key});

  @override
  State<BillsScreen> createState() => _BillsScreenState();
}

class _BillsScreenState extends State<BillsScreen> {
  final ApiService _apiService = ApiService();
  List<Bill> _bills = [];
  List<Bill> _filteredBills = [];
  bool _isLoading = true;
  final TextEditingController _searchController = TextEditingController();
  String _searchMode = 'customer'; // 'customer' or 'product'
  DateTimeRange? _dateRange;

  @override
  void initState() {
    super.initState();
    _loadBills();
  }

  Future<void> _loadBills() async {
    try {
      final bills = await _apiService.getBills();
      setState(() {
        _bills = bills;
        _filteredBills = bills;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load bills: $e')),
        );
      }
    }
  }

  Future<void> _searchBills(String query) async {
    if (query.isEmpty) {
      setState(() {
        _filteredBills = _bills;
      });
      return;
    }
    try {
      List<Bill> results;
      if (_searchMode == 'customer') {
        results = await _apiService.searchBills(query);
      } else {
        results = await _apiService.searchBillsByProduct(query);
      }
      setState(() {
        _filteredBills = results;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to search bills: $e')),
        );
      }
    }
  }

  Future<void> _filterByDateRange() async {
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() {
        _dateRange = picked;
      });
      try {
        final results = await _apiService.getBillsByDateRange(
          picked.start.toIso8601String().split('T')[0],
          picked.end.toIso8601String().split('T')[0],
        );
        setState(() {
          _filteredBills = results;
        });
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to filter bills by date: $e')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        icon: const Icon(Icons.add),
        label: const Text('Create Bill'),
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const CreateBillScreen()),
          ).then((_) => _loadBills());
        },
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Bills',
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        decoration: InputDecoration(
                          hintText: 'Search...',
                          prefixIcon: const Icon(Icons.search),
                          suffixIcon: IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              _loadBills();
                            },
                          ),
                        ),
                        onChanged: _searchBills,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey[300]!),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _searchMode,
                          items: const [
                            DropdownMenuItem(value: 'customer', child: Text('Customer')),
                            DropdownMenuItem(value: 'product', child: Text('Product')),
                          ],
                          onChanged: (value) {
                            if (value != null) {
                              setState(() {
                                _searchMode = value;
                              });
                              _searchBills(_searchController.text);
                            }
                          },
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton.filled(
                      icon: const Icon(Icons.filter_list),
                      onPressed: _filterByDateRange,
                    ),
                  ],
                ),
                if (_dateRange != null) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.blue[50],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.date_range, color: Colors.blue),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Filtered: ${_dateRange!.start.toLocal().toString().split(' ')[0]} - ${_dateRange!.end.toLocal().toString().split(' ')[0]}',
                            style: const TextStyle(color: Colors.blue),
                          ),
                        ),
                        TextButton(
                          onPressed: () {
                            setState(() {
                              _dateRange = null;
                            });
                            _loadBills();
                          },
                          child: const Text('Clear'),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredBills.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.receipt_long, size: 80, color: Colors.grey[300]),
                            const SizedBox(height: 16),
                            Text(
                              'No bills found',
                              style: TextStyle(fontSize: 18, color: Colors.grey[600]),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        separatorBuilder: (context, index) => const SizedBox(height: 12),
                        itemCount: _filteredBills.length,
                        itemBuilder: (context, index) {
                          final bill = _filteredBills[index];
                          return Card(
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          bill.invoiceNumber,
                                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          'Customer: ${bill.customer.name}',
                                          style: TextStyle(color: Colors.grey[600]),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                        'Date: ${bill.billDate}',
                                        style: TextStyle(color: Colors.grey[500], fontSize: 12),
                                      ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Text(
                                    '₹${bill.finalAmount.toStringAsFixed(2)}',
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.blue,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  IconButton(
                                    icon: const Icon(Icons.edit, color: Colors.grey),
                                    onPressed: () {
                                      // Navigate to edit bill screen
                                    },
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.download, color: Colors.grey),
                                    onPressed: () {
                                      _apiService.downloadInvoicePdf(bill.id);
                                    },
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}