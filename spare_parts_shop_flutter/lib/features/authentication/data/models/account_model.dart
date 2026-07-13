import 'package:freezed_annotation/freezed_annotation.dart';

part 'account_model.freezed.dart';
part 'account_model.g.dart';

@freezed
class AccountModel with _$AccountModel {
  const factory AccountModel({
    required String id,
    required String token,
    String? refreshToken,
    required String username,
    String? email,
    String? phone,
    String? name,
    String? businessName,
    required String role,
    int? userId,
    int? businessId,
    int? branchId,
    dynamic features,
    String? profilePhotoUrl,
    @Default(false) bool isActive,
  }) = _AccountModel;

  factory AccountModel.fromJson(Map<String, dynamic> json) =>
      _$AccountModelFromJson(json);
}
