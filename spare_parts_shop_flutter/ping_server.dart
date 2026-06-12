import 'dart:async';
import 'dart:io';

void main() async {
  final url = 'https://inventorymanagement-afhl.onrender.com/api'; // Your base URL
  const pingInterval = Duration(minutes: 5);
  
  print('🟢 Ping service started - Pinging every 5 mins');
  
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
    
    // Only log errors or very quiet success
    await response.drain();
    client.close();
  } catch (e) {
    print('🔴 Ping failed: ${e.toString().substring(0, 50)}...');
  }
}
