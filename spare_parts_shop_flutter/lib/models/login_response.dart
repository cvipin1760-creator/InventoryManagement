class LoginResponse {
  final String? token;
  final String username;
  final String role;
  final String message;

  LoginResponse({
    this.token,
    required this.username,
    required this.role,
    required this.message,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      token: json['token'],
      username: json['username'],
      role: json['role'],
      message: json['message'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'token': token,
      'username': username,
      'role': role,
      'message': message,
    };
  }
}
