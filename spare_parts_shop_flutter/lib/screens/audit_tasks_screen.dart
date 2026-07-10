import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AuditTasksScreen extends StatefulWidget {
  @override
  _AuditTasksScreenState createState() => _AuditTasksScreenState();
}

class _AuditTasksScreenState extends State<AuditTasksScreen> {
  List<dynamic> _tasks = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadTasks();
  }

  Future<void> _loadTasks() async {
    setState(() => _isLoading = true);
    try {
      final data = await ApiService().getAuditTasks();
      setState(() => _tasks = data);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load Audit Tasks')));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showTaskDialog({Map<String, dynamic>? task}) {
    final _locationCtrl = TextEditingController(text: task?['location'] ?? '');
    final _dateCtrl = TextEditingController(text: task?['scheduledDate'] ?? '');
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(task == null ? 'Create Audit Task' : 'Edit Task'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: _locationCtrl, decoration: InputDecoration(labelText: 'Location')),
            TextField(controller: _dateCtrl, decoration: InputDecoration(labelText: 'Scheduled Date (YYYY-MM-DD)')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final payload = {
                'location': _locationCtrl.text,
                'scheduledDate': _dateCtrl.text,
                'status': task?['status'] ?? 'PENDING',
              };
              try {
                if (task == null) {
                  await ApiService().createAuditTask(payload);
                } else {
                  await ApiService().updateAuditTask(task['id'], payload);
                }
                Navigator.pop(context);
                _loadTasks();
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error saving task')));
              }
            },
            child: Text('Save'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Audit Tasks'),
        actions: [IconButton(icon: Icon(Icons.refresh), onPressed: _loadTasks)],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showTaskDialog(),
        child: Icon(Icons.add),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _tasks.length,
              itemBuilder: (context, index) {
                final task = _tasks[index];
                return Card(
                  margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    title: Text('Location: ${task['location']}'),
                    subtitle: Text('Status: ${task['status']} | Date: ${task['scheduledDate']}'),
                    trailing: IconButton(
                      icon: Icon(Icons.edit),
                      onPressed: () => _showTaskDialog(task: task),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
