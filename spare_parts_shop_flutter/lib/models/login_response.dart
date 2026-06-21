class LoginResponse {
  final int? userId;
  final String? token;
  final String username;
  final String role;
  final int? businessId;
  final dynamic features;
  final String message;

  LoginResponse({
    this.userId,
    this.token,
    required this.username,
    required this.role,
    this.businessId,
    this.features,
    required this.message,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    print('=== Parsing LoginResponse ===');
    print('JSON: $json');
    return LoginResponse(
      userId: (json['userId'] as num?)?.toInt(),
      token: json['token'] as String?,
      username: json['username'] as String? ?? '',
      role: json['role'] as String? ?? '',
      businessId: (json['businessId'] as num?)?.toInt(),
      features: json['features'],
      message: json['message'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'token': token,
      'username': username,
      'role': role,
      'businessId': businessId,
      'features': features,
      'message': message,
    };
  }
}
