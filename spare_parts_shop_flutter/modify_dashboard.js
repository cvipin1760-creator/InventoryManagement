const fs = require('fs');

let c = fs.readFileSync('lib/screens/dashboard_screen.dart', 'utf8');

if (!c.includes('_hasShownTrialModal')) {
    c = c.replace('class _DashboardScreenState extends State<DashboardScreen> {', 
`class _DashboardScreenState extends State<DashboardScreen> {
  static bool _hasShownTrialModal = false;`);
}

c = c.replace(/WidgetsBinding\.instance\.addPostFrameCallback\(\(\_\) \{[\s\S]*?\}\);/,
`WidgetsBinding.instance.addPostFrameCallback((_) async {
      final subProvider = Provider.of<SubscriptionProvider>(context, listen: false);
      await subProvider.fetchSubscriptionStatus();
      if (mounted && !_hasShownTrialModal && subProvider.status == 'TRIAL' && subProvider.remainingDays <= 3) {
        _hasShownTrialModal = true;
        _showTrialEndingModal(subProvider.remainingDays);
      }
    });`);

const modalFn = `
  void _showTrialEndingModal(int daysLeft) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 28),
            const SizedBox(width: 12),
            const Text('Trial Ending Soon'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Your free trial expires in',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 12),
            Center(
              child: Text(
                daysLeft <= 0 ? 'Today' : '$daysLeft Day\${daysLeft == 1 ? '' : 's'}',
                style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.orange),
              ),
            ),
            const SizedBox(height: 16),
            const Text('Purchase a subscription now to continue using StockPilot without interruption.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Remind Me Later', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, '/subscription_billing');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryColor,
              foregroundColor: Colors.white,
            ),
            child: const Text('Buy Subscription'),
          ),
        ],
      ),
    );
  }

  Future<void> _loadData() async {`;

c = c.replace('  Future<void> _loadData() async {', modalFn);

fs.writeFileSync('lib/screens/dashboard_screen.dart', c);
console.log('Modified dashboard_screen.dart');
