class PaymentRequiredException implements Exception {
  final String message;
  PaymentRequiredException(this.message);

  @override
  String toString() => message;
}
