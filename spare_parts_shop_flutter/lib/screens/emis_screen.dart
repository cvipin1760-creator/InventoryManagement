import 'package:flutter/material.dart';
import '../services/api_service.dart';


class EmisScreen extends StatefulWidget {
  const EmisScreen({super.key});

  @override
  State<EmisScreen> createState() => _EmisScreenState();
}

class _EmisScreenState extends State<EmisScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<dynamic> _emis = [];

  @override
  void initState() {
    super.initState();
    _loadEmis();
  }

  Future<void> _loadEmis() async {
    try {
      // Assuming GET /api/emis exists or we fetch from /api/bills and filter
      // For now we simulate fetching all EMIs
      final response = await _apiService.get('/emis');
      if (mounted) {
        setState(() {
          _emis = response is List ? response : [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        // Error handling fallback, maybe endpoint doesn't exist yet
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not load EMIs: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage EMIs'),
      ),
      
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _emis.isEmpty
              ? const Center(child: Text('No EMIs found'))
              : ListView.builder(
                  itemCount: _emis.length,
                  itemBuilder: (context, index) {
                    final emi = _emis[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: ListTile(
                        leading: const CircleAvatar(
                          child: Icon(Icons.credit_card),
                        ),
                        title: Text('Bill #${emi['billId']} - ₹${emi['amount']}'),
                        subtitle: Text('Status: ${emi['status']}'),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                        onTap: () {
                          // Show EMI details
                        },
                      ),
                    );
                  },
                ),
    );
  }
}
