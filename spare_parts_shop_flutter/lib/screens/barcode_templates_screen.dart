import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class BarcodeTemplatesScreen extends StatefulWidget {
  const BarcodeTemplatesScreen({Key? key}) : super(key: key);

  @override
  State<BarcodeTemplatesScreen> createState() => _BarcodeTemplatesScreenState();
}

class _BarcodeTemplatesScreenState extends State<BarcodeTemplatesScreen> {
  bool _isLoading = false;
  List<dynamic> _templates = [];

  @override
  void initState() {
    super.initState();
    _loadTemplates();
  }

  Future<void> _loadTemplates() async {
    setState(() => _isLoading = true);
    try {
      final api = context.read<ApiService>();
      final res = await api.getBarcodeTemplates();
      setState(() {
        _templates = res;
      });
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _createTemplate() async {
    // In a real app, open a dialog or separate screen with a drag-and-drop builder
    // Here we just save a simple default template
    setState(() => _isLoading = true);
    try {
      final api = context.read<ApiService>();
      await api.saveBarcodeTemplate({
        'name': 'Standard Price Label',
        'width': 50.0,
        'height': 25.0,
        'format': 'CODE128',
        'layoutJson': '{"items": ["name", "price", "barcode"]}',
        'isDefault': _templates.isEmpty,
      });
      _loadTemplates();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Label Templates')),
      body: _isLoading && _templates.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : _templates.isEmpty
              ? const Center(child: Text('No templates found. Create one!'))
              : ListView.builder(
                  itemCount: _templates.length,
                  itemBuilder: (context, index) {
                    final t = _templates[index];
                    return ListTile(
                      leading: const Icon(Icons.design_services),
                      title: Text(t['name']),
                      subtitle: Text('${t['format']} | ${t['width']}x${t['height']}mm'),
                      trailing: t['isDefault'] == true
                          ? const Chip(label: Text('Default'))
                          : null,
                    );
                  },
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: _createTemplate,
        child: const Icon(Icons.add),
      ),
    );
  }
}
