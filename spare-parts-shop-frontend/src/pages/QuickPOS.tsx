import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import type { Customer, Product } from '../types';
import './QuickPOS.css';

export default function QuickPOS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const customerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load products on mount
    api.getProducts().then(res => setProducts(res.data || res)).catch(console.error);
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Generate AI suggestions when cart changes
    if (cart.length > 0) {
      setAiSuggestions(["Frequently Bought Together: " + (cart[0]?.product.category || 'Accessories'), "Upsell Option: Premium Version"]);
    } else {
      setAiSuggestions([]);
    }
  }, [cart]);

  // Hotkeys Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F2') {
        e.preventDefault();
        customerInputRef.current?.focus();
      } else if (e.key === 'F6') {
        e.preventDefault();
        handleSaveBill();
      } else if (e.key === 'F8') {
        e.preventDefault();
        handleHoldBill();
      } else if (e.key === 'F9') {
        e.preventDefault();
        handleResumeBill();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  const addToCart = (product: Product, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, qty: item.qty + qty }
            : item
        );
      }
      return [...prev, { product, qty, price: product.price, discount: 0, gst: product.gstPercent || 0 }];
    });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim() !== '') {
      // Check if it exactly matches a barcode or SKU
      const match = products.find(p => p.partNumber === search.trim());
      if (match) {
        addToCart(match);
        setSearch(''); // Clear after scan
      } else {
        // If exact match by name
        const nameMatch = products.find(p => p.name.toLowerCase() === search.trim().toLowerCase());
        if (nameMatch) {
            addToCart(nameMatch);
            setSearch('');
        }
      }
    }
  };

  const updateCartItem = (index: number, field: string, value: number) => {
    setCart(prev => {
      const newCart = [...prev];
      newCart[index] = { ...newCart[index], [field]: value };
      return newCart;
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveBill = async () => {
     if(cart.length === 0) return alert('Cart is empty!');
     
     const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
     const totalDiscount = cart.reduce((sum, item) => sum + (item.discount || 0), 0);
     
     if (totalAmount > 0 && totalDiscount > 0) {
        const discountPercent = (totalDiscount / totalAmount) * 100;
        if (discountPercent > 10) {
          try {
            const { approvalApi } = await import('../api/approvalApi');
            await approvalApi.requestApproval('HIGH_DISCOUNT', {
               discount: totalDiscount, 
               totalAmount, 
               discountPercent: discountPercent.toFixed(2),
            });
            alert('Discount is too high. A manager approval request has been sent.');
            return;
          } catch (e) {
            console.error('Failed to request approval', e);
            alert('Failed to request manager approval');
            return;
          }
        }
     }

     const finalDiscount = totalDiscount + loyaltyDiscount;

     try {
       await api.createBill({
         // @ts-ignore
         customerId: selectedCustomer?.id || null, 
         paymentMode: 'FULL',
         items: cart.map(c => ({
           productId: c.product.id,
           quantity: c.qty,
           serialNumber: '',
           price: c.price,
           discount: c.discount,
           gstPercent: c.gst
         })),
         overallDiscount: loyaltyDiscount,
         taxAmount: cart.reduce((sum, item) => sum + (((item.price * item.qty) - (item.discount || 0)) * (item.gst || 0) / 100), 0)
       });
       alert('Bill Saved Successfully');
       setCart([]);
       setSelectedCustomer(null);
       setLoyaltyDiscount(0);
       setCustomerSearch('');
     } catch (err) {
       console.error(err);
       alert('Failed to save bill');
     }
  };

  const handleHoldBill = () => {
    if (cart.length === 0) return alert('Cart is empty!');
    const heldBills = JSON.parse(localStorage.getItem('heldBills') || '[]');
    heldBills.push({ id: Date.now(), cart, search, customerSearch });
    localStorage.setItem('heldBills', JSON.stringify(heldBills));
    alert('Bill Held');
    setCart([]);
  };

  const handleResumeBill = () => {
    const heldBills = JSON.parse(localStorage.getItem('heldBills') || '[]');
    if (heldBills.length === 0) return alert('No held bills');
    const bill = heldBills.pop();
    setCart(bill.cart);
    setSearch(bill.search);
    setCustomerSearch(bill.customerSearch);
    localStorage.setItem('heldBills', JSON.stringify(heldBills));
  };

  const startVoiceBilling = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Voice recognition not supported in this browser.');
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e: any) => {
      console.error(e);
      setIsListening(false);
    };
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript.toLowerCase();
      console.log('Voice heard:', transcript);
      // Basic NLP
      const match = products.find(p => transcript.includes(p.name.toLowerCase()));
      if (match) {
        // Find if they said a number (e.g., "Add 5...")
        const numMatch = transcript.match(/\b\d+\b/);
        const qty = numMatch ? parseInt(numMatch[0], 10) : 1;
        addToCart(match, qty);
        alert(`Voice added ${qty}x ${match.name}`);
      } else {
        alert("Couldn't find that product in catalog.");
      }
    };
    recognition.start();
  };

  const handleCustomerSearch = async () => {
    if (!customerSearch) return;
    try {
      const res = await api.searchCustomers(customerSearch);
      if (res && res.length > 0) {
        setSelectedCustomer(res[0]);
      } else {
        alert('Customer not found');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to search customer');
    }
  };

  const handleRedeemLoyalty = async () => {
    if (!selectedCustomer) return;
    if ((selectedCustomer.loyaltyPoints || 0) < 10) {
       return alert('Minimum 10 points required to redeem.');
    }
    try {
      await api.redeemPoints(selectedCustomer.id, selectedCustomer.loyaltyPoints || 0);
      setLoyaltyDiscount(selectedCustomer.loyaltyPoints || 0);
      alert(`Redeemed ${selectedCustomer.loyaltyPoints} points for ₹${selectedCustomer.loyaltyPoints} discount!`);
      // Update local state to reflect redemption
      setSelectedCustomer({...selectedCustomer, loyaltyPoints: 0});
    } catch (e) {
      console.error(e);
      alert('Failed to redeem points');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.partNumber && p.partNumber.toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 50);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalDiscount = cart.reduce((sum, item) => sum + Number(item.discount || 0), 0);
  const totalGst = cart.reduce((sum, item) => sum + (((item.price * item.qty) - (item.discount || 0)) * (item.gst || 0) / 100), 0);
  const total = subtotal - totalDiscount - loyaltyDiscount + totalGst;

  return (
    <div className="quickpos-container">
      <div className="quickpos-header">
        <h2>Quick POS</h2>
        <div className="header-actions">
           <button className={`pos-btn ${isListening ? 'primary' : ''}`} onClick={startVoiceBilling}>
             {isListening ? 'Listening...' : 'Voice Bill (Mic)'}
           </button>
           <button className="pos-btn" onClick={handleHoldBill}>Hold Bill (F8)</button>
           <button className="pos-btn" onClick={handleResumeBill}>Resume Bill (F9)</button>
        </div>
      </div>

      <div className="quickpos-layout">
        {/* Left Side: Cart */}
        <div className="quickpos-cart-panel">
          <div className="cart-customer-section" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input 
              ref={customerInputRef}
              type="text" 
              placeholder="Search Phone (F2)" 
              className="pos-input" 
              value={customerSearch}
              onChange={e => setCustomerSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustomerSearch()}
            />
            <button className="pos-btn outline" onClick={handleCustomerSearch}>Find</button>
            
            {selectedCustomer && (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0f9ff', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.9rem', color: '#0369a1', fontWeight: 'bold' }}>
                  {selectedCustomer.name} (Pts: {selectedCustomer.loyaltyPoints || 0})
                </span>
                {(selectedCustomer.loyaltyPoints || 0) >= 10 && loyaltyDiscount === 0 && (
                  <button onClick={handleRedeemLoyalty} style={{ background: '#0284c7', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                    Redeem
                  </button>
                )}
                {loyaltyDiscount > 0 && (
                  <span style={{ fontSize: '0.8rem', color: 'green' }}>-₹{loyaltyDiscount} Applied</span>
                )}
              </div>
            )}
          </div>
          
          <div className="cart-table-container">
            <table className="pos-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Disc</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 ? (
                  <tr><td colSpan={6} style={{textAlign: 'center', padding: '2rem'}}>Cart is empty. Scan or search items.</td></tr>
                ) : (
                  cart.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.product.name}</td>
                      <td>
                        <input 
                          type="number" 
                          value={item.qty} 
                          className="pos-input inline-edit" 
                          onChange={(e) => updateCartItem(idx, 'qty', Number(e.target.value))}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={item.price} 
                          className="pos-input inline-edit" 
                          onChange={(e) => updateCartItem(idx, 'price', Number(e.target.value))}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={item.discount} 
                          className="pos-input inline-edit" 
                          onChange={(e) => updateCartItem(idx, 'discount', Number(e.target.value))}
                        />
                      </td>
                      <td>₹{((item.qty * item.price) - item.discount).toFixed(2)}</td>
                      <td><button className="delete-btn" onClick={() => removeFromCart(idx)}>X</button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="cart-summary-section">
             <div className="summary-row"><span>Subtotal:</span> <span>₹{subtotal.toFixed(2)}</span></div>
             <div className="summary-row"><span>Discount:</span> <span>-₹{totalDiscount.toFixed(2)}</span></div>
             <div className="summary-row"><span>Tax (GST):</span> <span>₹{totalGst.toFixed(2)}</span></div>
             <div className="summary-row total"><span>Total:</span> <span>₹{total.toFixed(2)}</span></div>
             <div className="payment-buttons">
                <button className="pos-btn primary" onClick={handleSaveBill}>Pay Cash (F6)</button>
                <button className="pos-btn secondary">Pay UPI</button>
                <button className="pos-btn secondary">Pay Card</button>
             </div>
          </div>
        </div>

        {/* Right Side: Products & Categories */}
        <div className="quickpos-products-panel">
           <div className="search-section">
             <input 
               ref={searchInputRef}
               type="text" 
               placeholder="Search Barcode, Name, SKU (F1)" 
               className="pos-input large-search"
               value={search}
               onChange={e => setSearch(e.target.value)}
               onKeyDown={handleSearchKeyDown}
             />
           </div>
           
           <div className="categories-section">
             <button className="category-chip active">All</button>
             <button className="category-chip">Favorites</button>
             <button className="category-chip">Beverages</button>
             <button className="category-chip">Snacks</button>
             <button className="category-chip">Electronics</button>
           </div>

           {aiSuggestions.length > 0 && (
             <div style={{marginBottom: '1rem', padding: '0.5rem', background: '#e8f5e9', borderRadius: '4px'}}>
               <strong>✨ AI Suggestions:</strong>
               <ul style={{margin: '0.5rem 0', paddingLeft: '1.5rem'}}>
                 {aiSuggestions.map((s, i) => <li key={i}>{s}</li>)}
               </ul>
             </div>
           )}

           <div className="products-grid">
              {filteredProducts.length === 0 ? (
                <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '2rem'}}>No products found.</div>
              ) : (
                filteredProducts.map(p => (
                  <div className="product-card" key={p.id} onClick={() => addToCart(p)}>
                     <div className="product-name">{p.name}</div>
                     <div className="product-price">₹{p.price}</div>
                     {p.quantity <= 5 && (
                       <div style={{fontSize: '0.8rem', color: '#d32f2f'}}>Only {p.quantity} Left!</div>
                     )}
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
