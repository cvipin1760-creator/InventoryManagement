import re
import json

file_path = 'f:/emergent/spare_parts_shop_flutter/lib/services/api_service.dart'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all occurrences of http methods except MultipartRequest and MultipartFile
content = content.replace('await http.get(', 'await _get(')
content = content.replace('await http.post(', 'await _post(')
content = content.replace('await http.put(', 'await _put(')
content = content.replace('await http.delete(', 'await _delete(')

methods_code = """
  Future<http.Response> _get(Uri url, {Map<String, String>? headers}) async {
    return _request('GET', url, headers: headers);
  }

  Future<http.Response> _post(Uri url, {Map<String, String>? headers, Object? body, Encoding? encoding}) async {
    return _request('POST', url, headers: headers, body: body, encoding: encoding);
  }

  Future<http.Response> _put(Uri url, {Map<String, String>? headers, Object? body, Encoding? encoding}) async {
    return _request('PUT', url, headers: headers, body: body, encoding: encoding);
  }

  Future<http.Response> _delete(Uri url, {Map<String, String>? headers, Object? body, Encoding? encoding}) async {
    return _request('DELETE', url, headers: headers, body: body, encoding: encoding);
  }

  Future<http.Response> _request(
    String method,
    Uri url, {
    Map<String, String>? headers,
    Object? body,
    Encoding? encoding,
  }) async {
    final defaultHeaders = await _getHeaders();
    if (headers != null) {
      defaultHeaders.addAll(headers);
    }
    
    print('=== API Request ===');
    print('URL: $url');
    print('Method: $method');
    print('Headers: $defaultHeaders');
    if (body != null) print('Body: $body');

    http.Response response;
    try {
      switch (method.toUpperCase()) {
        case 'GET':
          response = await http.get(url, headers: defaultHeaders);
          break;
        case 'POST':
          response = await http.post(url, headers: defaultHeaders, body: body, encoding: encoding);
          break;
        case 'PUT':
          response = await http.put(url, headers: defaultHeaders, body: body, encoding: encoding);
          break;
        case 'DELETE':
          response = await http.delete(url, headers: defaultHeaders, body: body, encoding: encoding);
          break;
        default:
          throw Exception('Unsupported HTTP method: $method');
      }
    } catch (e) {
      print('Network Error: $e');
      if (e.toString().contains('SocketException') || e.toString().contains('ClientException') || e.toString().contains('Failed host lookup')) {
        throw Exception('Could not connect to server. Please check your internet connection.');
      }
      rethrow;
    }

    print('=== API Response ===');
    print('Status: ${response.statusCode}');
    if (response.body.length > 500) {
       print('Body: ${response.body.substring(0, 500)}... (truncated)');
    } else {
       print('Body: ${response.body}');
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response;
    } else {
      String errorMessage = 'Request failed with status: ${response.statusCode}';
      try {
        final Map<String, dynamic> errorBody = jsonDecode(response.body);
        if (errorBody['message'] != null) {
          errorMessage = errorBody['message'];
        }
      } catch (_) {}
      
      switch (response.statusCode) {
        case 401:
          throw Exception('Unauthorized: $errorMessage');
        case 403:
          throw Exception('Forbidden: $errorMessage');
        case 404:
          throw Exception('Not Found: $errorMessage');
        case 500:
          throw Exception('Server Error: $errorMessage');
        default:
          throw Exception(errorMessage);
      }
    }
  }
}
"""

content = content.rstrip()
if content.endswith('}'):
    content = content[:-1] + methods_code

# Also fix login which currently uses http.post and implements custom error handling
# Let's replace the whole login method to simplify it using _post
login_pattern = re.compile(r'Future<LoginResponse> login\(String username, String password\) async \{.*?\n  \}', re.DOTALL)
new_login = """Future<LoginResponse> login(String username, String password) async {
    final url = Uri.parse('$baseUrl/auth/login');
    final requestBody = {'username': username.trim(), 'password': password.trim()};
    
    // _post automatically handles logging, headers, and error checking
    final response = await _post(url, body: jsonEncode(requestBody));
    return LoginResponse.fromJson(jsonDecode(response.body));
  }"""
content = login_pattern.sub(new_login, content)

# In api_service.dart, remove custom error checks since _request handles them now
# for example: if (response.statusCode == 200) { ... } else { throw Exception(...) }
# Let's replace them? Actually, since _request throws an exception on non-200, 
# the `if (response.statusCode == 200)` checks will always be true!
# So we don't strictly *need* to remove the else blocks, they just become dead code.
# But it's fine.

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("api_service.dart refactored successfully.")
