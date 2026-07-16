import 'package:flutter/material.dart';
import '../services/shift_service.dart';
import '../constants/app_theme.dart';

class ShiftScreen extends StatefulWidget {
  const ShiftScreen({super.key});

  @override
  State<ShiftScreen> createState() => _ShiftScreenState();
}

class _ShiftScreenState extends State<ShiftScreen> {
  final ShiftService _shiftService = ShiftService();
  Map<String, dynamic>? _currentShift;
  bool _isLoading = true;

  final TextEditingController _openingBalanceController = TextEditingController(text: '0');
  final TextEditingController _notesController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadShift();
  }

  Future<void> _loadShift() async {
    setState(() => _isLoading = true);
    try {
      final shift = await _shiftService.getCurrentShift();
      setState(() {
        _currentShift = shift;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _startShift() async {
    final double amount = double.tryParse(_openingBalanceController.text) ?? 0;
    setState(() => _isLoading = true);
    try {
      await _shiftService.startShift(amount, _notesController.text);
      _openingBalanceController.clear();
      _notesController.clear();
      await _loadShift();
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error starting shift: $e')));
      }
    }
  }

  Future<void> _endShiftDialog() async {
    final TextEditingController closingBalanceController = TextEditingController(text: '0');
    final TextEditingController closingNotesController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Close Register'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: closingBalanceController,
              decoration: const InputDecoration(labelText: 'Actual Cash in Drawer'),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 10),
            TextField(
              controller: closingNotesController,
              decoration: const InputDecoration(labelText: 'Closing Notes'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              setState(() => _isLoading = true);
              try {
                final double amount = double.tryParse(closingBalanceController.text) ?? 0;
                await _shiftService.endShift(_currentShift!['id'], amount, closingNotesController.text);
                await _loadShift();
              } catch (e) {
                setState(() => _isLoading = false);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error closing shift: $e')));
                }
              }
            },
            child: const Text('Close Shift'),
          ),
        ],
      ),
    );
  }

  Future<void> _adjustCashDialog() async {
    final TextEditingController amountController = TextEditingController(text: '0');
    final TextEditingController reasonController = TextEditingController();
    String type = 'ADD';

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setStateSB) => AlertDialog(
          title: const Text('Adjust Cash Drawer'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButton<String>(
                value: type,
                isExpanded: true,
                items: const [
                  DropdownMenuItem(value: 'ADD', child: Text('Pay In (Add Cash)')),
                  DropdownMenuItem(value: 'REMOVE', child: Text('Pay Out (Remove Cash)')),
                ],
                onChanged: (v) => setStateSB(() => type = v!),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: amountController,
                decoration: const InputDecoration(labelText: 'Amount'),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 10),
              TextField(
                controller: reasonController,
                decoration: const InputDecoration(labelText: 'Reason'),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(context);
                this.setState(() => _isLoading = true);
                try {
                  final double amount = double.tryParse(amountController.text) ?? 0;
                  await _shiftService.adjustCash(_currentShift!['id'], amount, type, reasonController.text);
                  this.setState(() => _isLoading = false);
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Cash Adjusted')));
                  }
                } catch (e) {
                  this.setState(() => _isLoading = false);
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                  }
                }
              },
              child: const Text('Submit'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Shift Management')),
      body: _currentShift == null ? _buildOpenShift() : _buildCurrentShift(),
    );
  }

  Widget _buildOpenShift() {
    return Center(
      child: Card(
        margin: const EdgeInsets.all(32),
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.point_of_sale, size: 64, color: AppTheme.primaryColor),
              const SizedBox(height: 16),
              const Text('Open Register', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text('Enter opening cash balance to start billing.'),
              const SizedBox(height: 24),
              TextField(
                controller: _openingBalanceController,
                decoration: const InputDecoration(
                  labelText: 'Opening Cash Amount',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.currency_rupee),
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _notesController,
                decoration: const InputDecoration(
                  labelText: 'Notes (Optional)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(padding: const EdgeInsets.all(16)),
                  onPressed: _startShift,
                  child: const Text('START SHIFT', style: TextStyle(fontSize: 18)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCurrentShift() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            elevation: 4,
            child: ListTile(
              leading: const Icon(Icons.check_circle, color: Colors.green, size: 40),
              title: const Text('Shift is OPEN', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text('Started at: ${_currentShift!['startTime']}'),
              trailing: ElevatedButton.icon(
                onPressed: _endShiftDialog,
                icon: const Icon(Icons.lock),
                label: const Text('CLOSE REGISTER'),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Text('Cash Drawer Options', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _adjustCashDialog,
                  icon: const Icon(Icons.payments),
                  label: const Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Text('Pay In / Pay Out'),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
