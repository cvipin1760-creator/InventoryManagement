import 'dart:async';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../constants/app_config.dart';

class KeepAliveService {
  static final KeepAliveService _instance = KeepAliveService._internal();
  factory KeepAliveService() => _instance;
  KeepAliveService._internal();

  WebSocketChannel? _channel;
  Timer? _pingTimer;
  Timer? _reconnectTimer;
  bool _isRunning = false;
  int _reconnectAttempts = 0;
  static const int maxReconnectDelay = 60; // seconds

  void start() {
    if (_isRunning) return;
    _isRunning = true;
    _connect();
  }

  void stop() {
    _isRunning = false;
    _disconnect();
  }

  void _connect() {
    try {
      final wsUrl = AppConfig.baseUrl.replaceFirst(RegExp(r'^http'), 'ws') + '/ws/keep-alive';
      _channel = WebSocketChannel.connect(Uri.parse(wsUrl));
      
      _channel!.stream.listen(
        (message) {
          _reconnectAttempts = 0;
        },
        onError: (error) {
          _scheduleReconnect();
        },
        onDone: () {
          _scheduleReconnect();
        },
      );

      // Send ping every 4 minutes
      _pingTimer = Timer.periodic(const Duration(minutes: 4), (timer) {
        if (_channel != null) {
          _channel!.sink.add('ping');
        }
      });
    } catch (_) {
      _scheduleReconnect();
    }
  }

  void _disconnect() {
    _pingTimer?.cancel();
    _pingTimer = null;
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
    _channel?.sink.close();
    _channel = null;
  }

  void _scheduleReconnect() {
    if (!_isRunning) return;
    
    _disconnect();
    
    // Exponential backoff
    final delay = Duration(seconds: (_reconnectAttempts < 6) ? (1 << _reconnectAttempts) : maxReconnectDelay);
    _reconnectAttempts++;
    
    _reconnectTimer = Timer(delay, () {
      if (_isRunning) {
        _connect();
      }
    });
  }
}
