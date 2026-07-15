import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:stock_pilot/features/authentication/data/models/feature_permissions_model.dart';

part 'login_response_model.freezed.dart';
part 'login_response_model.g.dart';

@freezed
class LoginResponseModel with _$LoginResponseModel {
  const factory LoginResponseModel({
    int? userId,
    String? token,
    String? username,
    String? role,
    int? businessId,
    int? branchId,
    bool? mustChangePassword,
    dynamic configuration,
    String? message,
  }) = _LoginResponseModel;

  factory LoginResponseModel.fromJson(Map<String, dynamic> json) =>
      _$LoginResponseModelFromJson(json);
}
