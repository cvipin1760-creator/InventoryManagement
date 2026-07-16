import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api_service.dart';

class MarketingScreen extends StatefulWidget {
  const MarketingScreen({super.key});

  @override
  State<MarketingScreen> createState() => _MarketingScreenState();
}

class _MarketingScreenState extends State<MarketingScreen> with SingleTickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  late TabController _tabController;
  final _messageController = TextEditingController();
  String _audience = 'all';
  bool _loading = false;

  final _audiences = [
    {'value': 'all', 'label': 'All Customers'},
    {'value': 'active', 'label': 'Active Customers (Last 30 days)'},
    {'value': 'inactive', 'label': 'Inactive Customers (90+ days)'},
    {'value': 'vip', 'label': 'VIP Customers (High Loyalty Points)'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _tabController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    if (_messageController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a message'), backgroundColor: Colors.red),
      );
      return;
    }
    setState(() => _loading = true);
    try {
      final customers = await _apiService.getCustomers();
      if (!mounted) return;
      
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        builder: (context) {
          return DraggableScrollableSheet(
            initialChildSize: 0.6,
            minChildSize: 0.3,
            maxChildSize: 0.9,
            expand: false,
            builder: (context, scrollController) {
              return Column(
                children: [
                  const Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Text(
                      'Select Customer to Message',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ),
                  Expanded(
                    child: ListView.builder(
                      controller: scrollController,
                      itemCount: customers.length,
                      itemBuilder: (context, index) {
                        final c = customers[index];
                        return ListTile(
                          leading: const CircleAvatar(child: Icon(Icons.person)),
                          title: Text(c.name),
                          subtitle: Text(c.phone),
                          trailing: IconButton(
                            icon: const Icon(Icons.send, color: Color(0xFF25D366)),
                            onPressed: () async {
                              final message = _messageController.text.replaceAll('{Name}', c.name);
                              final url = Uri.parse('https://wa.me/${c.phone.replaceAll(RegExp(r"[^\d+]"), "")}?text=${Uri.encodeComponent(message)}');
                              if (await canLaunchUrl(url)) {
                                await launchUrl(url, mode: LaunchMode.externalApplication);
                              } else {
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Could not launch WhatsApp')),
                                  );
                                }
                              }
                            },
                          ),
                        );
                      },
                    ),
                  ),
                ],
              );
            },
          );
        },
      );
      
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load customers: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isWhatsApp = _tabController.index == 0;
    final previewColor = isWhatsApp ? const Color(0xFFe7f5eb) : const Color(0xFFf3f4f6);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Marketing & Promotions'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.phone_android), text: 'WhatsApp'),
            Tab(icon: Icon(Icons.sms), text: 'SMS'),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Compose Campaign', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              isExpanded: true,
              value: _audience,
              decoration: InputDecoration(
                labelText: 'Target Audience',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                prefixIcon: const Icon(Icons.group),
              ),
              items: _audiences.map((a) => DropdownMenuItem(
                value: a['value'],
                child: Text(a['label']!),
              )).toList(),
              onChanged: (v) => setState(() => _audience = v!),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _messageController,
              maxLines: 6,
              decoration: InputDecoration(
                labelText: 'Message Content',
                hintText: 'Hi {Name}, get 20% off on your next purchase...',
                helperText: 'Use {Name} to personalize the message',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 24),
            const Text('Message Preview', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: previewColor,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _messageController.text.isEmpty
                        ? 'Your message preview will appear here...'
                        : _messageController.text,
                    style: TextStyle(color: _messageController.text.isEmpty ? Colors.grey : Colors.black87),
                  ),
                  const SizedBox(height: 8),
                  Align(
                    alignment: Alignment.bottomRight,
                    child: Text('10:42 AM', style: TextStyle(fontSize: 11, color: Colors.grey[600])),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _loading ? null : _send,
                icon: _loading
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.send),
                label: Text(_loading ? 'Loading...' : 'Select Customers for ${isWhatsApp ? 'WhatsApp' : 'SMS'}'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: isWhatsApp ? const Color(0xFF25D366) : Colors.blue,
                  foregroundColor: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

