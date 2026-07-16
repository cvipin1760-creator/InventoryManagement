import '../core/constants/app_constants.dart';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'api_service.dart';

class QueueWebSocketService {
  WebSocketChannel? _channel;
  final Function(Map<String, dynamic>) onUpdateReceived;

  QueueWebSocketService({required this.onUpdateReceived});

  Future<void> connect(int businessId) async {
    final baseUrl = AppConstants.baseUrl;
    
    // Convert http/https to ws/wss
    String wsUrl = baseUrl.replaceFirst('http', 'ws');
    // Ensure we don't accidentally get something like wss://localhost:8080/api (assuming API is at /api)
    // Actually, backend websocket is registered at /ws/queue at root level.
    // So we strip /api from baseUrl if it exists.
    if (wsUrl.endsWith('/api')) {
      wsUrl = wsUrl.substring(0, wsUrl.length - 4);
    }
    wsUrl += '/ws/queue';

    try {
      _channel = WebSocketChannel.connect(Uri.parse(wsUrl));

      _channel!.stream.listen(
        (message) {
          try {
            final data = json.decode(message);
            onUpdateReceived(data);
          } catch (e) {
            debugPrint('Error parsing websocket message: $e');
          }
        },
        onDone: () {
          debugPrint('WebSocket connection closed.');
          // Attempt to reconnect after a delay
          Future.delayed(const Duration(seconds: 5), () => connect(businessId));
        },
        onError: (error) {
          debugPrint('WebSocket error: $error');
        },
      );

      // Send subscribe message
      _channel!.sink.add(json.encode({
        'action': 'subscribe',
        'businessId': businessId,
      }));
      
      debugPrint('Connected to Queue WebSocket at $wsUrl');
    } catch (e) {
      debugPrint('Failed to connect to WebSocket: $e');
      Future.delayed(const Duration(seconds: 5), () => connect(businessId));
    }
  }

  void disconnect() {
    _channel?.sink.close();
  }
}
