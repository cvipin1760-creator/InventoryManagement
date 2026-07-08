class AppConstants {
  // Base URL
  static String baseUrl = const String.fromEnvironment('BASE_URL', defaultValue: 'https://inventorymanagement-afhl.onrender.com/api');
  static const Duration apiTimeout = Duration(seconds: 30);

  // Routes
  static const String splashRoute = '/';
  static const String loginRoute = '/login';
  static const String registerRoute = '/register';
  static const String otpRoute = '/otp';
  static const String forgotPasswordRoute = '/forgot-password';
  static const String dashboardRoute = '/dashboard';
  static const String productsRoute = '/products';
  static const String addProductRoute = '/products/add';
  static const String customersRoute = '/customers';
  static const String billingRoute = '/billing';
  static const String billsRoute = '/bills';
  static const String purchasesRoute = '/purchases';
  static const String suppliersRoute = '/suppliers';
  static const String paymentsRoute = '/payments';
  static const String reportsRoute = '/reports';
  static const String warrantyRoute = '/warranty';
  static const String emiRoute = '/emi';
  static const String settingsRoute = '/settings';
  static const String businessesRoute = '/businesses';
  static const String adminsRoute = '/admins';
  static const String permissionsRoute = '/permissions';
  static const String subscriptionsRoute = '/subscriptions';
  static const String analyticsRoute = '/analytics';
  static const String supportRoute = '/support';

  // Storage Keys
  static const String storageKeyToken = 'token';
  static const String storageKeyUser = 'user';
  static const String storageKeyThemeMode = 'themeMode';
  static const String storageKeyIsFirstTime = 'isFirstTime';

  // User Roles
  static const String roleSuperAdmin = 'SUPER_ADMIN';
  static const String roleAdmin = 'ADMIN';
  static const String roleEmployee = 'EMPLOYEE';
  static const String roleCustomer = 'CUSTOMER';

  // Others
  static const double defaultPadding = 16.0;
  static const double defaultBorderRadius = 16.0;
  static const double defaultCardElevation = 0.0;
}
