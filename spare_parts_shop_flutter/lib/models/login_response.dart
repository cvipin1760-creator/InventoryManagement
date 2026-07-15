class LoginResponse {
  final int? userId;
  final String? token;
  final String? username;
  final String? role;
  final int? businessId;
  final int? branchId;
  final bool? mustChangePassword;
  final dynamic configuration;
  final String? message;

  LoginResponse({
    this.userId,
    this.token,
    this.username,
    this.role,
    this.businessId,
    this.branchId,
    this.mustChangePassword = false,
    this.configuration,
    this.message,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    print('=== Parsing LoginResponse ===');
    print('JSON: $json');
    return LoginResponse(
      userId: (json['userId'] as num?)?.toInt(),
      token: json['token'] as String?,
      username: json['username'] as String?,
      role: json['role'] as String?,
      businessId: (json['businessId'] as num?)?.toInt(),
      branchId: (json['branchId'] as num?)?.toInt(),
      mustChangePassword: json['mustChangePassword'] as bool? ?? false,
      configuration: json['configuration'],
      message: json['message'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'token': token,
      'username': username,
      'role': role,
      'businessId': businessId,
      'branchId': branchId,
      'mustChangePassword': mustChangePassword,
      'configuration': configuration,
      'message': message,
    };
  }
}
