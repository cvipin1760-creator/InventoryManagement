import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import 'package:intl/intl.dart';

class BarcodeHistoryScreen extends StatefulWidget {
  const BarcodeHistoryScreen({Key? key}) : super(key: key);

  @override
  State<BarcodeHistoryScreen> createState() => _BarcodeHistoryScreenState();
}

class _BarcodeHistoryScreenState extends State<BarcodeHistoryScreen> {
  bool _isLoading = false;
  List<dynamic> _history = [];

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() => _isLoading = true);
    try {
      final api = context.read<ApiService>();
      final res = await api.getBarcodeHistory();
      setState(() {
        _history = res;
      });
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Print History')),
      body: _isLoading && _history.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : _history.isEmpty
              ? const Center(child: Text('No print history found.'))
              : ListView.builder(
                  itemCount: _history.length,
                  itemBuilder: (context, index) {
                    final h = _history[index];
                    final date = DateTime.parse(h['printTime']).toLocal();
                    return ListTile(
                      leading: const Icon(Icons.print),
                      title: Text('Product ID: ${h['product']?['name'] ?? 'Unknown'}'),
                      subtitle: Text('Copies: ${h['copiesPrinted']} | User ID: ${h['user']?['username'] ?? 'Unknown'}'),
                      trailing: Text(DateFormat.yMMMd().add_jm().format(date)),
                    );
                  },
                ),
    );
  }
}
