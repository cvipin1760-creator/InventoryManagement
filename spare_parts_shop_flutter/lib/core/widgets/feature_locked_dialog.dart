import 'package:flutter/material.dart';
import 'package:stock_pilot/services/api_service.dart';
import 'package:stock_pilot/constants/app_theme.dart';

class FeatureLockedDialog extends StatefulWidget {
  final String moduleCode;
  final String message;

  const FeatureLockedDialog({
    super.key,
    required this.moduleCode,
    required this.message,
  });

  static Future<void> show(BuildContext context, String moduleCode, String message) {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => FeatureLockedDialog(moduleCode: moduleCode, message: message),
    );
  }

  @override
  State<FeatureLockedDialog> createState() => _FeatureLockedDialogState();
}

class _FeatureLockedDialogState extends State<FeatureLockedDialog> {
  final _reasonController = TextEditingController();
  bool _isSubmitting = false;
  bool _submitted = false;

  Future<void> _requestAccess() async {
    if (_reasonController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please provide a reason')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final apiService = ApiService();
      await apiService.post('/feature-requests', body: {
        'featureCode': widget.moduleCode,
        'reason': _reasonController.text.trim(),
        'priority': 'NORMAL'
      });
      setState(() => _submitted = true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to submit: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_submitted) {
      return AlertDialog(
        icon: const Icon(Icons.check_circle, color: Colors.green, size: 64),
        title: const Text('Request Sent'),
        content: const Text(
          'Your request for this feature has been sent to the Super Admin. You will be notified once it is approved.',
          textAlign: TextAlign.center,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      );
    }

    return AlertDialog(
      icon: Icon(Icons.lock, color: AppTheme.primaryColor, size: 64),
      title: const Text('Feature Locked'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            widget.message,
            textAlign: TextAlign.center,
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          const Text(
            'This feature is not part of your current subscription or is not installed. You can request access below.',
            style: TextStyle(fontSize: 14),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _reasonController,
            maxLines: 3,
            decoration: const InputDecoration(
              hintText: 'Why do you need this feature? (e.g. want to try it out, upgrading business)',
              border: OutlineInputBorder(),
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: _isSubmitting ? null : () => Navigator.of(context).pop(),
          child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
        ),
        ElevatedButton(
          onPressed: _isSubmitting ? null : _requestAccess,
          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor),
          child: _isSubmitting 
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : const Text('Request Access'),
        ),
      ],
    );
  }
}
