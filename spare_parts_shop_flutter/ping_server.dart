import 'dart:async';
import 'dart:io';

void main() async {
  final url = 'https://inventorymanagement-afhl.onrender.com/api'; // Your base URL
  const pingInterval = Duration(minutes: 5);
  
  print('🚀 Starting ping service...');
  print('📡 Pinging $url every 5 minutes to keep Render awake');
  print('--------------------------------------------------------');
  
  // Initial ping
  await pingServer(url);
  
  // Set up periodic pings
  Timer.periodic(pingInterval, (timer) async {
    await pingServer(url);
  });
  
  // Keep the program alive
  await Completer<void>().future;
}

Future<void> pingServer(String url) async {
  try {
    final client = HttpClient();
    final request = await client.getUrl(Uri.parse(url));
    final response = await request.close();
    
    final timestamp = DateTime.now().toString().substring(0, 19);
    print('✅ [$timestamp] Ping successful - Status: ${response.statusCode}');
    
    // Drain and close the response stream properly
    await response.drain();
    client.close();
  } catch (e) {
    final timestamp = DateTime.now().toString().substring(0, 19);
    print('❌ [$timestamp] Ping failed: $e');
  }
}
