import 'package:flutter/material.dart';
import '../services/api_service.dart';

class BillTemplatesScreen extends StatefulWidget {
  const BillTemplatesScreen({super.key});

  @override
  State<BillTemplatesScreen> createState() => _BillTemplatesScreenState();
}

class _BillTemplatesScreenState extends State<BillTemplatesScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _templates = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadTemplates();
  }

  Future<void> _loadTemplates() async {
    try {
      final templates = await _apiService.getBillTemplates();
      setState(() {
        _templates = templates;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load templates: $e')));
      }
    }
  }

  void _showTemplateDialog([dynamic template]) {
    final nameController = TextEditingController(text: template?['name'] ?? '');
    final headerController = TextEditingController(text: template?['headerText'] ?? '');
    final footerController = TextEditingController(text: template?['footerText'] ?? '');
    final isDefault = template?['isDefault'] ?? false;
    bool currentIsDefault = isDefault;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setStateDialog) => AlertDialog(
          title: Text(template == null ? 'Create Template' : 'Edit Template'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Name')),
                TextField(controller: headerController, decoration: const InputDecoration(labelText: 'Header Text')),
                TextField(controller: footerController, decoration: const InputDecoration(labelText: 'Footer Text')),
                SwitchListTile(
                  title: const Text('Set as Default'),
                  value: currentIsDefault,
                  onChanged: (val) {
                    setStateDialog(() => currentIsDefault = val);
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () async {
                final data = {
                  'name': nameController.text,
                  'headerText': headerController.text,
                  'footerText': footerController.text,
                  'isDefault': currentIsDefault,
                };
                try {
                  if (template == null) {
                    await _apiService.createBillTemplate(data);
                  } else {
                    await _apiService.updateBillTemplate(template['id'], data);
                  }
                  if (mounted) {
                    Navigator.pop(context);
                    _loadTemplates();
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                  }
                }
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bill Templates'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showTemplateDialog(),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _templates.isEmpty
              ? const Center(child: Text('No templates found'))
              : ListView.builder(
                  itemCount: _templates.length,
                  itemBuilder: (context, index) {
                    final template = _templates[index];
                    return ListTile(
                      title: Text(template['name']),
                      subtitle: Text(template['isDefault'] ? 'Default Template' : ''),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(icon: const Icon(Icons.edit), onPressed: () => _showTemplateDialog(template)),
                          IconButton(
                            icon: const Icon(Icons.delete, color: Colors.red),
                            onPressed: () async {
                              await _apiService.deleteBillTemplate(template['id']);
                              _loadTemplates();
                            },
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
