import 'package:flutter/material.dart';

/// Global navigator key used by ApiService to redirect on 401/403 (expired token).
final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
