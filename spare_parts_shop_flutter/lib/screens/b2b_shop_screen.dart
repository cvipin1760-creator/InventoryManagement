import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/product.dart';

class B2BShopScreen extends StatefulWidget {
  const B2BShopScreen({super.key});

  @override
  _B2BShopScreenState createState() => _B2BShopScreenState();
}

class _B2BShopScreenState extends State<B2BShopScreen> {
  bool _isLoggedIn = false;
  int? _businessId;
  List<Product> _products = [];
  bool _isLoading = false;
  
  final _usernameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();

  Future<void> _login() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService().b2bLogin(_usernameCtrl.text, _passwordCtrl.text);
      if (res['token'] != null) {
        setState(() {
          _isLoggedIn = true;
          _businessId = res['businessId'];
        });
        _loadProducts();
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Login failed')));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadProducts() async {
    if (_businessId == null) return;
    setState(() => _isLoading = true);
    try {
      final data = await ApiService().getB2bProducts(_businessId!);
      setState(() => _products = data);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load products')));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_isLoggedIn) {
      return Scaffold(
        appBar: AppBar(title: Text('B2B Portal Login')),
        body: Center(
          child: Padding(
            padding: EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(controller: _usernameCtrl, decoration: InputDecoration(labelText: 'Username')),
                SizedBox(height: 16),
                TextField(controller: _passwordCtrl, decoration: InputDecoration(labelText: 'Password'), obscureText: true),
                SizedBox(height: 24),
                _isLoading 
                  ? CircularProgressIndicator()
                  : ElevatedButton(onPressed: _login, child: Text('Login')),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('B2B Wholesale Shop'),
        actions: [
          IconButton(
            icon: Icon(Icons.logout),
            onPressed: () => setState(() => _isLoggedIn = false),
          ),
        ],
      ),
      body: _isLoading 
        ? Center(child: CircularProgressIndicator())
        : GridView.builder(
            padding: EdgeInsets.all(16),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.8,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            itemCount: _products.length,
            itemBuilder: (context, index) {
              final product = _products[index];
              return Card(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Expanded(
                      child: Container(
                        color: Colors.grey[200],
                        child: Center(child: Icon(Icons.inventory, size: 48, color: Colors.grey)),
                      ),
                    ),
                    Padding(
                      padding: EdgeInsets.all(8),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(product.name, style: TextStyle(fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
                          Text('\$${product.price}', style: TextStyle(color: Colors.green)),
                          SizedBox(height: 8),
                          ElevatedButton(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Added to B2B Cart (Coming Soon)')));
                            },
                            child: Text('Add to Cart'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
    );
  }
}
