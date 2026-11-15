import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Trash2,
  Receipt,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  FileDown,
  ExternalLink,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import medicineService from '../../services/medicineService';
import inventoryService from '../../services/inventoryService';
import salesService from '../../services/salesService';
import { POSProductCard } from '../../components/sales/POSProductCard';
import { CartItem } from '../../components/sales/CartItem';
import { CheckoutModal } from '../../components/sales/CheckoutModal';
import { Button } from '../../components/common/Button';

export const POSPage = () => {
  const navigate = useNavigate();

  // State
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Cart State
  const [cart, setCart] = useState([]);
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [orderDiscountType, setOrderDiscountType] = useState('percentage');

  // Checkout Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  // Load medicines & active inventory batches
  const loadData = async () => {
    try {
      setLoading(true);
      const [medsRes, invRes] = await Promise.all([
        medicineService.getMedicines({ limit: 200 }),
        inventoryService.getInventory({ limit: 1000 }),
      ]);

      const activeMeds = (medsRes.data?.medicines || []).filter((m) => m.isActive);
      const activeBatches = invRes.data?.batches || [];

      setMedicines(activeMeds);
      setBatches(activeBatches);
    } catch (err) {
      console.error('Failed to load POS catalog data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute available stock & default price per medicine
  const medicineStockMap = useMemo(() => {
    const map = {};
    const now = new Date();

    for (const b of batches) {
      if (b.status === 'active' && b.availableQuantity > 0 && new Date(b.expiryDate) >= now) {
        const medId = b.medicine?._id || b.medicine;
        if (!map[medId]) {
          map[medId] = {
            totalStock: 0,
            earliestExpiry: b.expiryDate,
            sellingPrice: b.sellingPrice || 0,
          };
        }
        map[medId].totalStock += b.availableQuantity;
        if (new Date(b.expiryDate) < new Date(map[medId].earliestExpiry)) {
          map[medId].earliestExpiry = b.expiryDate;
          map[medId].sellingPrice = b.sellingPrice;
        }
      }
    }
    return map;
  }, [batches]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set();
    medicines.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [medicines]);

  // Filtered product catalog
  const filteredProducts = useMemo(() => {
    return medicines.filter((m) => {
      const stockInfo = medicineStockMap[m._id || m.id];
      const stock = stockInfo?.totalStock || 0;

      if (inStockOnly && stock <= 0) return false;
      if (selectedCategory !== 'ALL' && m.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = m.name?.toLowerCase().includes(q);
        const matchesGeneric = m.genericName?.toLowerCase().includes(q);
        const matchesBrand = m.brandName?.toLowerCase().includes(q);
        const matchesSku = m.sku?.toLowerCase().includes(q);
        const matchesBarcode = m.barcode?.toLowerCase().includes(q);
        return matchesName || matchesGeneric || matchesBrand || matchesSku || matchesBarcode;
      }

      return true;
    });
  }, [medicines, medicineStockMap, selectedCategory, searchQuery, inStockOnly]);

  // Cart operations
  const handleAddToCart = (med) => {
    const medId = med._id || med.id;
    const stockInfo = medicineStockMap[medId];
    const maxStock = stockInfo?.totalStock || 0;
    const defaultPrice = stockInfo?.sellingPrice || 50;

    if (maxStock <= 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.medicine === medId);
      if (existing) {
        if (existing.quantity >= maxStock) return prevCart;
        return prevCart.map((item) =>
          item.medicine === medId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          medicine: medId,
          medicineName: med.name,
          sku: med.sku || '',
          unit: med.unit || 'Strip',
          dosageForm: med.dosageForm || '',
          strength: med.strength || '',
          requiresPrescription: med.requiresPrescription,
          unitPrice: defaultPrice,
          quantity: 1,
          maxStock,
          discount: 0,
          discountType: 'percentage',
          taxRate: 5, // Default 5% GST
        },
      ];
    });
  };

  const handleUpdateQuantity = (medicineId, newQty) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.medicine === medicineId) {
            const clamped = Math.max(1, Math.min(newQty, item.maxStock));
            return { ...item, quantity: clamped };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleUpdateDiscount = (medicineId, discount) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.medicine === medicineId ? { ...item, discount: Math.max(0, discount) } : item
      )
    );
  };

  const handleUpdateTaxRate = (medicineId, taxRate) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.medicine === medicineId ? { ...item, taxRate: Math.max(0, taxRate) } : item
      )
    );
  };

  const handleRemoveFromCart = (medicineId) => {
    setCart((prevCart) => prevCart.filter((item) => item.medicine !== medicineId));
  };

  const handleClearCart = () => {
    setCart([]);
    setOrderDiscount(0);
  };

  // Financial calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  }, [cart]);

  const itemDiscountsSum = useMemo(() => {
    return cart.reduce((acc, item) => {
      const base = item.quantity * item.unitPrice;
      const d = item.discountType === 'fixed' ? item.discount : (base * item.discount) / 100;
      return acc + (d || 0);
    }, 0);
  }, [cart]);

  const computedOrderDiscount = useMemo(() => {
    const afterItemDiscounts = Math.max(0, subtotal - itemDiscountsSum);
    return orderDiscountType === 'fixed'
      ? Math.min(afterItemDiscounts, orderDiscount)
      : (afterItemDiscounts * (orderDiscount || 0)) / 100;
  }, [subtotal, itemDiscountsSum, orderDiscount, orderDiscountType]);

  const totalDiscount = itemDiscountsSum + computedOrderDiscount;

  const totalTax = useMemo(() => {
    return cart.reduce((acc, item) => {
      const base = item.quantity * item.unitPrice;
      const d = item.discountType === 'fixed' ? item.discount : (base * item.discount) / 100;
      const taxable = Math.max(0, base - (d || 0));
      return acc + (taxable * (item.taxRate || 0)) / 100;
    }, 0);
  }, [cart]);

  const grandTotal = Math.max(0, Math.round((subtotal - totalDiscount + totalTax) * 100) / 100);

  // Submit checkout
  const handleConfirmCheckout = async (checkoutPayload) => {
    try {
      setCheckoutLoading(true);
      const res = await salesService.createSale(checkoutPayload);
      const sale = res.data.sale;
      setCompletedSale(sale);
      setIsCheckoutOpen(false);
      handleClearCart();
      // Reload inventory stock
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to complete checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] bg-slate-100 overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/sales')}
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Sales List
          </Button>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
              POS
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">
                Point of Sale Terminal
              </h1>
              <p className="text-[11px] text-slate-500">
                Instant Billing, FEFO Stock Deduction & Tax Invoices
              </p>
            </div>
          </div>
        </div>

        {/* Global Catalog Search */}
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medicine by name, generic, brand, SKU or barcode..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Refresh button & status */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Reload inventory"
            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
            {filteredProducts.length} medicines
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Product Catalog */}
        <div className="flex-1 flex flex-col overflow-hidden p-4">
          {/* Category Tabs & In-stock toggle */}
          <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-3xl no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-teal-700 text-white shadow-xs font-semibold'
                      : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'All Products' : cat}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 font-medium shrink-0 cursor-pointer select-none bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              In Stock Only
            </label>
          </div>

          {/* Product Cards Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent" />
                  <p className="mt-2 text-xs text-slate-500">Loading catalog...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl border border-slate-200">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">No Medicines Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  No products matched your search or category filter. Try clearing filters or searching another keyword.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((med) => {
                  const medId = med._id || med.id;
                  const stockInfo = medicineStockMap[medId];
                  const availableStock = stockInfo?.totalStock || 0;
                  const unitPrice = stockInfo?.sellingPrice || 50;
                  const cartItem = cart.find((item) => item.medicine === medId);

                  return (
                    <POSProductCard
                      key={medId}
                      medicine={med}
                      availableStock={availableStock}
                      unitPrice={unitPrice}
                      cartQuantity={cartItem?.quantity || 0}
                      onAddToCart={handleAddToCart}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Sticky Shopping Cart Sidebar */}
        <div className="w-96 bg-white border-l border-slate-200 flex flex-col shrink-0">
          {/* Cart Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-bold text-slate-900">Current Cart</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                {cart.length}
              </span>
            </div>

            {cart.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <ShoppingCart className="w-12 h-12 text-slate-200 mb-2 stroke-1" />
                <p className="text-sm font-medium text-slate-600">Cart is empty</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                  Click on medicines from the catalog to add them to this sale.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <CartItem
                  key={item.medicine}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onUpdateDiscount={handleUpdateDiscount}
                  onUpdateTaxRate={handleUpdateTaxRate}
                  onRemove={handleRemoveFromCart}
                />
              ))
            )}
          </div>

          {/* Cart Financial Summary & Checkout Button */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3 shrink-0">
              {/* Order Level Discount */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-600 font-medium">Order Discount</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={orderDiscount}
                    onChange={(e) => setOrderDiscount(parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-xs border border-slate-200 rounded bg-white text-right font-medium focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                  />
                  <select
                    value={orderDiscountType}
                    onChange={(e) => setOrderDiscountType(e.target.value)}
                    className="px-1.5 py-1 text-xs border border-slate-200 rounded bg-white font-medium focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">₹</option>
                  </select>
                </div>
              </div>

              {/* Financial Lines */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Total Discount</span>
                    <span>-₹{totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST / Tax</span>
                  <span className="font-semibold text-slate-900">+₹{totalTax.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Total Payable</span>
                  <span className="text-lg font-extrabold text-teal-800">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <Button
                type="button"
                variant="primary"
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md"
              >
                <Receipt className="w-4 h-4 mr-2" />
                Proceed to Checkout (₹{grandTotal.toFixed(2)})
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        subtotal={subtotal}
        orderDiscount={totalDiscount}
        orderDiscountType={orderDiscountType}
        totalTax={totalTax}
        grandTotal={grandTotal}
        onConfirmCheckout={handleConfirmCheckout}
        loading={checkoutLoading}
      />

      {/* Post-Sale Completed Banner / Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Sale Completed Successfully!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Invoice <strong>{completedSale.invoiceNumber}</strong> has been generated and stock deducted using FEFO.
            </p>

            <div className="my-4 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Customer:</span>
                <span className="font-semibold text-slate-800">
                  {completedSale.customerSnapshot?.name || 'Walk-in Customer'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Amount:</span>
                <span className="font-bold text-teal-800">
                  ₹{Number(completedSale.totalAmount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status:</span>
                <span className="font-semibold text-emerald-700 capitalize">
                  {completedSale.paymentStatus} ({completedSale.paymentMethod})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => salesService.downloadInvoicePDF(completedSale._id, completedSale.invoiceNumber)}
                className="flex-1 text-xs"
              >
                <FileDown className="w-3.5 h-3.5 mr-1" />
                Download PDF
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate(`/sales/${completedSale._id}`)}
                className="flex-1 text-xs bg-teal-600 hover:bg-teal-700 text-white"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                View Invoice
              </Button>
            </div>

            <button
              onClick={() => setCompletedSale(null)}
              className="mt-4 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Start Next Sale
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSPage;

