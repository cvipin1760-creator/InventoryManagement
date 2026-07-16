import 'dart:async';
import 'package:flutter/material.dart';
import '../services/queue_service.dart';
import '../services/queue_websocket_service.dart';
import '../services/api_service.dart';
import '../constants/app_theme.dart';

class QueueDashboardScreen extends StatefulWidget {
  const QueueDashboardScreen({super.key});

  @override
  State<QueueDashboardScreen> createState() => _QueueDashboardScreenState();
}

class _QueueDashboardScreenState extends State<QueueDashboardScreen> {
  final QueueService _queueService = QueueService();
  QueueWebSocketService? _wsService;
  List<dynamic> _counters = [];
  Map<int, List<dynamic>> _counterQueues = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
    _initWebSocket();
  }

  Future<void> _initWebSocket() async {
    // In a real app we'd fetch the business ID of the logged in user.
    // For demo, we'll just use a generic '1'.
    _wsService = QueueWebSocketService(onUpdateReceived: (data) {
      if (mounted) {
        // Trigger a reload when any event comes in.
        // For hyper-optimization we could update state locally based on event type.
        _loadData();
      }
    });
    _wsService!.connect(1);
  }

  @override
  void dispose() {
    _wsService?.disconnect();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final counters = await _queueService.getCounters();
      
      Map<int, List<dynamic>> queues = {};
      for (var counter in counters) {
        final q = await _queueService.getQueueForCounter(counter['id']);
        queues[counter['id']] = q;
      }
      
      if (mounted) {
        setState(() {
          _counters = counters;
          _counterQueues = queues;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _createCounterDialog() async {
    final TextEditingController nameController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create New Counter'),
        content: TextField(
          controller: nameController,
          decoration: const InputDecoration(labelText: 'Counter Name (e.g. Express Lane)'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              setState(() => _isLoading = true);
              await _queueService.createCounter(nameController.text);
              await _loadData();
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }

  Future<void> _joinQueueDialog(int counterId) async {
    final TextEditingController nameController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Join Queue'),
        content: TextField(
          controller: nameController,
          decoration: const InputDecoration(labelText: 'Customer Name'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await _queueService.joinQueue(counterId, nameController.text);
              await _loadData();
            },
            child: const Text('Join'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Queue Management'),
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: _createCounterDialog),
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadData),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: _counters.isEmpty
                  ? const Center(child: Text('No counters found. Create one to start.'))
                  : GridView.builder(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 3,
                        childAspectRatio: 0.8,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                      ),
                      itemCount: _counters.length,
                      itemBuilder: (context, index) {
                        final counter = _counters[index];
                        final queue = _counterQueues[counter['id']] ?? [];
                        
                        return Card(
                          elevation: 4,
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(counter['name'], style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                                    Chip(
                                      label: Text(counter['status'], style: const TextStyle(color: Colors.white)),
                                      backgroundColor: counter['status'] == 'OPEN' ? Colors.green : Colors.red,
                                    ),
                                  ],
                                ),
                                const Divider(),
                                Text('Waiting: ${queue.length} customers', style: const TextStyle(fontSize: 16, color: Colors.grey)),
                                const SizedBox(height: 10),
                                Expanded(
                                  child: ListView.builder(
                                    itemCount: queue.length,
                                    itemBuilder: (context, qIndex) {
                                      final entry = queue[qIndex];
                                      return ListTile(
                                        dense: true,
                                        leading: CircleAvatar(child: Text(entry['tokenNumber'])),
                                        title: Text(entry['customerName']),
                                        subtitle: Text('Est. Wait: ${entry['estimatedWaitTimeMinutes']}m'),
                                      );
                                    },
                                  ),
                                ),
                                const SizedBox(height: 10),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                  children: [
                                    if (counter['status'] == 'CLOSED')
                                      ElevatedButton(
                                        onPressed: () async {
                                          await _queueService.assignCashier(counter['id']);
                                          await _loadData();
                                        },
                                        child: const Text('Open'),
                                      ),
                                    if (counter['status'] == 'OPEN') ...[
                                      ElevatedButton(
                                        onPressed: () => _joinQueueDialog(counter['id']),
                                        child: const Text('+ Join'),
                                      ),
                                      ElevatedButton(
                                        onPressed: queue.isEmpty ? null : () async {
                                          await _queueService.serveNext(counter['id']);
                                          await _loadData();
                                        },
                                        child: const Text('Serve Next'),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.close, color: Colors.red),
                                        onPressed: () async {
                                          await _queueService.closeCounter(counter['id']);
                                          await _loadData();
                                        },
                                      )
                                    ]
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
