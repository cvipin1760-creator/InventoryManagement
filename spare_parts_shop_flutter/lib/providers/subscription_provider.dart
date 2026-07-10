import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class SubscriptionProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  bool _isLoading = true;
  String _status = 'TRIAL';
  String _planName = 'Basic';
  int _remainingDays = 7;
  bool _isExpired = false;

  bool get isLoading => _isLoading;
  String get status => _status;
  String get planName => _planName;
  int get remainingDays => _remainingDays;
  bool get isExpired => _isExpired;

  Future<void> fetchSubscriptionStatus() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.getBusiness();
      if (response != null && response is Map<String, dynamic>) {
        _status = response['subscriptionStatus'] ?? 'TRIAL';
        
        if (response['currentPlan'] != null && response['currentPlan']['name'] != null) {
          _planName = response['currentPlan']['name'];
        }
        
        _isExpired = _status == 'EXPIRED' || _status == 'PAST_DUE';
        
        if (_status == 'TRIAL') {
           if (response['trialEndDate'] != null) {
              DateTime endDate = DateTime.parse(response['trialEndDate']);
              _remainingDays = endDate.difference(DateTime.now()).inDays;
              if (_remainingDays < 0) {
                 _remainingDays = 0;
                 _isExpired = true;
              }
           }
        } else if (_status == 'ACTIVE') {
           if (response['subscriptionEndDate'] != null) {
              DateTime endDate = DateTime.parse(response['subscriptionEndDate']);
              _remainingDays = endDate.difference(DateTime.now()).inDays;
           }
        }
      }
    } catch (e) {
      debugPrint('Error fetching subscription status: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
