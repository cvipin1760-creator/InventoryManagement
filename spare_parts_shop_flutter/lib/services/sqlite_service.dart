import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'dart:convert';

class SqliteService {
  static final SqliteService _instance = SqliteService._internal();
  factory SqliteService() => _instance;
  SqliteService._internal();

  Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDb();
    return _database!;
  }

  Future<Database> _initDb() async {
    String path = join(await getDatabasesPath(), 'stockpilot_offline.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE products_cache(
            id INTEGER PRIMARY KEY,
            data TEXT
          )
        ''');
        await db.execute('''
          CREATE TABLE customers_cache(
            id INTEGER PRIMARY KEY,
            data TEXT
          )
        ''');
        await db.execute('''
          CREATE TABLE offline_requests_queue(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            method TEXT,
            endpoint TEXT,
            body TEXT,
            headers TEXT
          )
        ''');
      },
    );
  }

  Future<void> cacheProducts(List<dynamic> products) async {
    final db = await database;
    await db.transaction((txn) async {
      await txn.execute('DELETE FROM products_cache');
      for (var p in products) {
        await txn.insert('products_cache', {'id': p['id'], 'data': jsonEncode(p)});
      }
    });
  }

  Future<List<dynamic>> getCachedProducts() async {
    final db = await database;
    final maps = await db.query('products_cache');
    return maps.map((e) => jsonDecode(e['data'] as String)).toList();
  }

  Future<void> cacheCustomers(List<dynamic> customers) async {
    final db = await database;
    await db.transaction((txn) async {
      await txn.execute('DELETE FROM customers_cache');
      for (var c in customers) {
        await txn.insert('customers_cache', {'id': c['id'], 'data': jsonEncode(c)});
      }
    });
  }

  Future<List<dynamic>> getCachedCustomers() async {
    final db = await database;
    final maps = await db.query('customers_cache');
    return maps.map((e) => jsonDecode(e['data'] as String)).toList();
  }

  Future<void> queueRequest(String method, String endpoint, Map<String, dynamic>? body, Map<String, String>? headers) async {
    final db = await database;
    await db.insert('offline_requests_queue', {
      'method': method,
      'endpoint': endpoint,
      'body': body != null ? jsonEncode(body) : null,
      'headers': headers != null ? jsonEncode(headers) : null,
    });
  }

  Future<List<Map<String, dynamic>>> getQueuedRequests() async {
    final db = await database;
    return await db.query('offline_requests_queue', orderBy: 'id ASC');
  }

  Future<void> deleteQueuedRequest(int id) async {
    final db = await database;
    await db.delete('offline_requests_queue', where: 'id = ?', whereArgs: [id]);
  }
}
