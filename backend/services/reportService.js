const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const MedicineBatch = require('../models/MedicineBatch');
const InventoryTransaction = require('../models/InventoryTransaction');
const PurchaseOrder = require('../models/PurchaseOrder');
const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer');
const Prescription = require('../models/Prescription');

class ReportService {
  /**
   * Helper: Parse Date filter range with start of day / end of day
   */
  parseDateRange(startDate, endDate) {
    let start;
    let end;

    if (endDate) {
      const parts = String(endDate).split('-');
      if (parts.length === 3) {
        end = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 23, 59, 59, 999);
      } else {
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      }
    } else {
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }

    if (startDate) {
      const parts = String(startDate).split('-');
      if (parts.length === 3) {
        start = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 0, 0, 0, 0);
      } else {
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
      }
    } else {
      start = new Date(end);
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    }

    return { start, end };
  }

  /**
   * 1. SALES REPORT & ANALYTICS
   */
  async getSalesReport(query = {}) {
    const { start, end } = this.parseDateRange(query.startDate, query.endDate);

    const matchFilter = {
      createdAt: { $gte: start, $lte: end },
    };

    if (query.paymentMethod) {
      matchFilter.paymentMethod = query.paymentMethod;
    }
    if (query.paymentStatus) {
      matchFilter.paymentStatus = query.paymentStatus;
    }
    if (query.soldBy && mongoose.Types.ObjectId.isValid(query.soldBy)) {
      matchFilter.soldBy = new mongoose.Types.ObjectId(query.soldBy);
    }

    // Retrieve all matched sales
    const allSales = await Sale.find(matchFilter)
      .populate('soldBy', 'name email role')
      .populate('customer', 'name customerCode phone')
      .sort({ createdAt: -1 });

    const completedSales = allSales.filter((s) => s.saleStatus === 'completed');
    const cancelledSales = allSales.filter((s) => s.saleStatus === 'cancelled');

    const totalGrossRevenue = completedSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const totalSubtotal = completedSales.reduce((sum, s) => sum + (s.subtotal || 0), 0);
    const totalDiscount = completedSales.reduce((sum, s) => sum + (s.discount || 0), 0);
    const totalTax = completedSales.reduce((sum, s) => sum + (s.tax || 0), 0);
    const totalAmountPaid = completedSales.reduce((sum, s) => sum + (s.amountPaid || 0), 0);
    const totalBalanceDue = completedSales.reduce((sum, s) => sum + (s.balanceAmount || 0), 0);
    const averageOrderValue = completedSales.length > 0 ? totalGrossRevenue / completedSales.length : 0;

    // Payment method breakdown
    const paymentMethodsMap = {
      cash: { count: 0, amount: 0 },
      upi: { count: 0, amount: 0 },
      card: { count: 0, amount: 0 },
      bank_transfer: { count: 0, amount: 0 },
      other: { count: 0, amount: 0 },
    };

    completedSales.forEach((s) => {
      const pm = s.paymentMethod || 'cash';
      if (!paymentMethodsMap[pm]) paymentMethodsMap[pm] = { count: 0, amount: 0 };
      paymentMethodsMap[pm].count += 1;
      paymentMethodsMap[pm].amount += s.totalAmount || 0;
    });

    // Staff Performance
    const staffMap = {};
    completedSales.forEach((s) => {
      const staffId = s.soldBy?._id?.toString() || 'unknown';
      const staffName = s.soldBy?.name || 'Staff Member';
      const staffRole = s.soldBy?.role || 'staff';
      if (!staffMap[staffId]) {
        staffMap[staffId] = {
          name: staffName,
          role: staffRole,
          salesCount: 0,
          totalRevenue: 0,
        };
      }
      staffMap[staffId].salesCount += 1;
      staffMap[staffId].totalRevenue += s.totalAmount || 0;
    });

    // Daily breakdown for visual charts
    const dailyMap = {};
    completedSales.forEach((s) => {
      const day = new Date(s.createdAt).toISOString().split('T')[0];
      if (!dailyMap[day]) {
        dailyMap[day] = { date: day, revenue: 0, orders: 0, paid: 0 };
      }
      dailyMap[day].revenue += s.totalAmount || 0;
      dailyMap[day].orders += 1;
      dailyMap[day].paid += s.amountPaid || 0;
    });

    const timeSeries = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    return {
      dateRange: {
        startDate: query.startDate || start.toISOString().split('T')[0],
        endDate: query.endDate || end.toISOString().split('T')[0],
      },
      summary: {
        totalOrders: allSales.length,
        completedOrders: completedSales.length,
        cancelledOrders: cancelledSales.length,
        grossRevenue: Math.round(totalGrossRevenue * 100) / 100,
        subtotal: Math.round(totalSubtotal * 100) / 100,
        totalDiscount: Math.round(totalDiscount * 100) / 100,
        totalTax: Math.round(totalTax * 100) / 100,
        totalAmountPaid: Math.round(totalAmountPaid * 100) / 100,
        totalBalanceDue: Math.round(totalBalanceDue * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      },
      paymentMethods: Object.entries(paymentMethodsMap).map(([method, data]) => ({
        method,
        count: data.count,
        amount: Math.round(data.amount * 100) / 100,
      })),
      staffPerformance: Object.values(staffMap).map((staff) => ({
        ...staff,
        totalRevenue: Math.round(staff.totalRevenue * 100) / 100,
      })),
      timeSeries,
      recentSales: allSales.slice(0, 15).map((s) => ({
        _id: s._id,
        invoiceNumber: s.invoiceNumber,
        createdAt: s.createdAt,
        customerName: s.customerSnapshot?.name || 'Walk-in',
        totalAmount: s.totalAmount,
        amountPaid: s.amountPaid,
        balanceAmount: s.balanceAmount,
        paymentMethod: s.paymentMethod,
        paymentStatus: s.paymentStatus,
        saleStatus: s.saleStatus,
      })),
    };
  }

  /**
   * 2. INVENTORY REPORT & VALUATION
   */
  async getInventoryReport() {
    const medicines = await Medicine.find().sort({ name: 1 });
    const batches = await MedicineBatch.find().populate('medicine', 'name category minimumStock sku');
    const transactions = await InventoryTransaction.find().sort({ createdAt: -1 }).limit(100);

    const now = new Date();
    const d30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const d60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const d90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Compute stock valuation & metrics
    let totalStockUnits = 0;
    let purchaseCostValuation = 0;
    let sellingPriceValuation = 0;

    let expiredCount = 0;
    let expiredValuation = 0;
    let expiring30Count = 0;
    let expiring60Count = 0;
    let expiring90Count = 0;
    let quarantinedUnits = 0;

    // Medicine to available quantity mapping
    const medStockMap = {};
    medicines.forEach((m) => {
      medStockMap[m._id.toString()] = 0;
    });

    batches.forEach((b) => {
      const exp = new Date(b.expiryDate);
      const isExpired = exp < now;

      if (b.status === 'active' && !isExpired) {
        totalStockUnits += b.availableQuantity;
        purchaseCostValuation += (b.availableQuantity || 0) * (b.purchasePrice || 0);
        sellingPriceValuation += (b.availableQuantity || 0) * (b.sellingPrice || 0);

        const medId = b.medicine?._id?.toString() || b.medicine?.toString();
        if (medId && medStockMap[medId] !== undefined) {
          medStockMap[medId] += b.availableQuantity;
        }

        // Expiry Buckets
        if (exp <= d30) {
          expiring30Count += 1;
        } else if (exp <= d60) {
          expiring60Count += 1;
        } else if (exp <= d90) {
          expiring90Count += 1;
        }
      } else if (isExpired || b.status === 'expired') {
        expiredCount += 1;
        expiredValuation += (b.availableQuantity || 0) * (b.purchasePrice || 0);
      } else if (b.status === 'quarantined') {
        quarantinedUnits += b.availableQuantity;
      }
    });

    // Low stock and out of stock medicines
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const lowStockMedicines = [];

    medicines.forEach((m) => {
      if (!m.isActive) return;
      const currentStock = medStockMap[m._id.toString()] || 0;
      if (currentStock === 0) {
        outOfStockCount += 1;
        lowStockMedicines.push({
          _id: m._id,
          name: m.name,
          category: m.category,
          sku: m.sku,
          minimumStock: m.minimumStock,
          currentStock: 0,
          status: 'out_of_stock',
        });
      } else if (currentStock <= m.minimumStock) {
        lowStockCount += 1;
        lowStockMedicines.push({
          _id: m._id,
          name: m.name,
          category: m.category,
          sku: m.sku,
          minimumStock: m.minimumStock,
          currentStock,
          status: 'low_stock',
        });
      }
    });

    // Category-wise distribution
    const categoryMap = {};
    medicines.forEach((m) => {
      const cat = m.category || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, medicineCount: 0, stockUnits: 0 };
      }
      categoryMap[cat].medicineCount += 1;
      categoryMap[cat].stockUnits += medStockMap[m._id.toString()] || 0;
    });

    // Transaction movements summary
    const txSummary = {
      stock_in: 0,
      stock_out: 0,
      adjustment_in: 0,
      adjustment_out: 0,
      return_in: 0,
    };

    transactions.forEach((t) => {
      if (txSummary[t.transactionType] !== undefined) {
        txSummary[t.transactionType] += t.quantity || 0;
      }
    });

    const potentialProfit = sellingPriceValuation - purchaseCostValuation;
    const potentialMarginPercent =
      sellingPriceValuation > 0 ? ((potentialProfit / sellingPriceValuation) * 100).toFixed(1) : 0;

    return {
      summary: {
        totalMedicines: medicines.length,
        activeMedicines: medicines.filter((m) => m.isActive).length,
        totalBatches: batches.length,
        activeBatches: batches.filter((b) => b.status === 'active' && new Date(b.expiryDate) >= now).length,
        totalStockUnits,
        purchaseCostValuation: Math.round(purchaseCostValuation * 100) / 100,
        sellingPriceValuation: Math.round(sellingPriceValuation * 100) / 100,
        potentialProfit: Math.round(potentialProfit * 100) / 100,
        potentialMarginPercent: parseFloat(potentialMarginPercent),
        lowStockCount,
        outOfStockCount,
        quarantinedUnits,
      },
      expiryAnalysis: {
        expiredBatches: expiredCount,
        expiredValuationLoss: Math.round(expiredValuation * 100) / 100,
        expiringWithin30Days: expiring30Count,
        expiringWithin60Days: expiring60Count,
        expiringWithin90Days: expiring90Count,
      },
      lowStockAlerts: lowStockMedicines.slice(0, 20),
      categoryDistribution: Object.values(categoryMap),
      recentMovements: txSummary,
    };
  }

  /**
   * 3. PURCHASE & PROCUREMENT REPORT
   */
  async getPurchaseReport(query = {}) {
    const { start, end } = this.parseDateRange(query.startDate, query.endDate);

    const matchFilter = {
      createdAt: { $gte: start, $lte: end },
    };
    if (query.supplierId && mongoose.Types.ObjectId.isValid(query.supplierId)) {
      matchFilter.supplier = new mongoose.Types.ObjectId(query.supplierId);
    }
    if (query.status) {
      matchFilter.status = query.status;
    }

    const purchaseOrders = await PurchaseOrder.find(matchFilter)
      .populate('supplier', 'name supplierCode phone email')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    const totalPOAmount = purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0);
    const nonCancelledPOs = purchaseOrders.filter((po) => po.status !== 'cancelled');
    const netProcurementSpend = nonCancelledPOs.reduce((sum, po) => sum + (po.totalAmount || 0), 0);

    // Status counts
    const statusCounts = {
      draft: 0,
      ordered: 0,
      partial: 0,
      received: 0,
      cancelled: 0,
    };
    purchaseOrders.forEach((po) => {
      if (statusCounts[po.status] !== undefined) {
        statusCounts[po.status] += 1;
      }
    });

    // Supplier Spend Breakdown
    const supplierSpendMap = {};
    nonCancelledPOs.forEach((po) => {
      const sId = po.supplier?._id?.toString() || 'unknown';
      const sName = po.supplier?.name || 'Unknown Supplier';
      const sCode = po.supplier?.supplierCode || 'SUP';
      if (!supplierSpendMap[sId]) {
        supplierSpendMap[sId] = {
          name: sName,
          code: sCode,
          orderCount: 0,
          totalSpend: 0,
        };
      }
      supplierSpendMap[sId].orderCount += 1;
      supplierSpendMap[sId].totalSpend += po.totalAmount || 0;
    });

    const supplierSpendList = Object.values(supplierSpendMap)
      .map((s) => ({
        ...s,
        totalSpend: Math.round(s.totalSpend * 100) / 100,
        spendPercent:
          netProcurementSpend > 0 ? parseFloat(((s.totalSpend / netProcurementSpend) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.totalSpend - a.totalSpend);

    return {
      dateRange: {
        startDate: query.startDate || start.toISOString().split('T')[0],
        endDate: query.endDate || end.toISOString().split('T')[0],
      },
      summary: {
        totalOrders: purchaseOrders.length,
        netProcurementSpend: Math.round(netProcurementSpend * 100) / 100,
        totalPOAmount: Math.round(totalPOAmount * 100) / 100,
        activeSuppliersCount: Object.keys(supplierSpendMap).length,
      },
      statusCounts,
      supplierSpend: supplierSpendList,
      recentPurchases: purchaseOrders.slice(0, 15).map((po) => ({
        _id: po._id,
        poNumber: po.poNumber,
        createdAt: po.createdAt,
        supplierName: po.supplier?.name || 'N/A',
        totalAmount: po.totalAmount,
        status: po.status,
        itemCount: po.items?.length || 0,
      })),
    };
  }

  /**
   * 4. PROFIT & LOSS (P&L) REPORT
   */
  async getProfitLossReport(query = {}) {
    const { start, end } = this.parseDateRange(query.startDate, query.endDate);

    const completedSales = await Sale.find({
      saleStatus: 'completed',
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: 1 });

    let grossRevenue = 0;
    let costOfGoodsSold = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    const dailyTrend = {};

    completedSales.forEach((s) => {
      grossRevenue += s.totalAmount || 0;
      totalDiscount += s.discount || 0;
      totalTax += s.tax || 0;

      let saleCOGS = 0;
      s.items.forEach((item) => {
        (item.batchAllocations || []).forEach((alloc) => {
          saleCOGS += (alloc.unitCost || 0) * (alloc.quantity || 0);
        });
      });
      costOfGoodsSold += saleCOGS;

      const day = new Date(s.createdAt).toISOString().split('T')[0];
      if (!dailyTrend[day]) {
        dailyTrend[day] = { date: day, revenue: 0, cogs: 0, profit: 0 };
      }
      dailyTrend[day].revenue += s.totalAmount || 0;
      dailyTrend[day].cogs += saleCOGS;
      dailyTrend[day].profit += (s.totalAmount || 0) - saleCOGS;
    });

    const grossProfit = grossRevenue - costOfGoodsSold;
    const grossMarginPercent = grossRevenue > 0 ? ((grossProfit / grossRevenue) * 100).toFixed(1) : 0;
    const netOperatingProfit = grossProfit; // Prior to external overheads

    return {
      dateRange: {
        startDate: query.startDate || start.toISOString().split('T')[0],
        endDate: query.endDate || end.toISOString().split('T')[0],
      },
      summary: {
        totalOrders: completedSales.length,
        grossRevenue: Math.round(grossRevenue * 100) / 100,
        costOfGoodsSold: Math.round(costOfGoodsSold * 100) / 100,
        grossProfit: Math.round(grossProfit * 100) / 100,
        grossMarginPercent: parseFloat(grossMarginPercent),
        totalDiscountsGiven: Math.round(totalDiscount * 100) / 100,
        totalTaxCollected: Math.round(totalTax * 100) / 100,
        netOperatingProfit: Math.round(netOperatingProfit * 100) / 100,
      },
      timeSeries: Object.values(dailyTrend)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((d) => ({
          ...d,
          revenue: Math.round(d.revenue * 100) / 100,
          cogs: Math.round(d.cogs * 100) / 100,
          profit: Math.round(d.profit * 100) / 100,
        })),
    };
  }

  /**
   * 5. MEDICINE PERFORMANCE REPORT
   */
  async getMedicinePerformanceReport(query = {}) {
    const { start, end } = this.parseDateRange(query.startDate, query.endDate);
    const limit = parseInt(query.limit, 10) || 10;

    const completedSales = await Sale.find({
      saleStatus: 'completed',
      createdAt: { $gte: start, $lte: end },
    });

    const medStatsMap = {};

    completedSales.forEach((s) => {
      s.items.forEach((item) => {
        const medId = item.medicine?.toString() || item.medicineName;
        if (!medStatsMap[medId]) {
          medStatsMap[medId] = {
            medicineId: item.medicine,
            medicineName: item.medicineName,
            totalQuantitySold: 0,
            totalRevenue: 0,
            totalCost: 0,
          };
        }
        medStatsMap[medId].totalQuantitySold += item.quantity || 0;
        medStatsMap[medId].totalRevenue += item.lineTotal || 0;

        let cost = 0;
        (item.batchAllocations || []).forEach((alloc) => {
          cost += (alloc.unitCost || 0) * (alloc.quantity || 0);
        });
        medStatsMap[medId].totalCost += cost;
      });
    });

    const performanceList = Object.values(medStatsMap).map((m) => {
      const profit = m.totalRevenue - m.totalCost;
      const margin = m.totalRevenue > 0 ? parseFloat(((profit / m.totalRevenue) * 100).toFixed(1)) : 0;
      return {
        ...m,
        totalRevenue: Math.round(m.totalRevenue * 100) / 100,
        totalCost: Math.round(m.totalCost * 100) / 100,
        grossProfit: Math.round(profit * 100) / 100,
        marginPercent: margin,
      };
    });

    // Top Bestsellers by Revenue
    const topByRevenue = [...performanceList].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, limit);

    // Top Bestsellers by Quantity
    const topByQuantity = [...performanceList].sort((a, b) => b.totalQuantitySold - a.totalQuantitySold).slice(0, limit);

    // Least Sold / Slow Moving
    const slowMoving = [...performanceList].sort((a, b) => a.totalQuantitySold - b.totalQuantitySold).slice(0, limit);

    // Highest Margin
    const highestMargin = [...performanceList]
      .filter((m) => m.totalQuantitySold >= 2)
      .sort((a, b) => b.marginPercent - a.marginPercent)
      .slice(0, limit);

    return {
      dateRange: {
        startDate: query.startDate || start.toISOString().split('T')[0],
        endDate: query.endDate || end.toISOString().split('T')[0],
      },
      topByRevenue,
      topByQuantity,
      slowMoving,
      highestMargin,
      totalMedicinesSold: performanceList.length,
    };
  }

  /**
   * 6. CUSTOMER ANALYTICS REPORT
   */
  async getCustomerReport(query = {}) {
    const { start, end } = this.parseDateRange(query.startDate, query.endDate);

    const customers = await Customer.find().sort({ createdAt: -1 });
    const completedSales = await Sale.find({
      saleStatus: 'completed',
      customer: { $exists: true, $ne: null },
      createdAt: { $gte: start, $lte: end },
    }).populate('customer', 'name customerCode phone');

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c) => c.isActive).length;
    const newCustomers = customers.filter((c) => new Date(c.createdAt) >= start && new Date(c.createdAt) <= end).length;

    // Customer spending aggregation
    const customerSpendMap = {};
    completedSales.forEach((s) => {
      const cId = s.customer?._id?.toString() || s.customer?.toString();
      if (!cId) return;

      if (!customerSpendMap[cId]) {
        customerSpendMap[cId] = {
          customerId: s.customer?._id,
          name: s.customer?.name || s.customerSnapshot?.name || 'Customer',
          phone: s.customer?.phone || s.customerSnapshot?.phone || '',
          code: s.customer?.customerCode || 'CUST',
          ordersCount: 0,
          totalSpend: 0,
          lastOrderDate: s.createdAt,
        };
      }
      customerSpendMap[cId].ordersCount += 1;
      customerSpendMap[cId].totalSpend += s.totalAmount || 0;
      if (new Date(s.createdAt) > new Date(customerSpendMap[cId].lastOrderDate)) {
        customerSpendMap[cId].lastOrderDate = s.createdAt;
      }
    });

    const topSpenders = Object.values(customerSpendMap)
      .map((c) => ({
        ...c,
        totalSpend: Math.round(c.totalSpend * 100) / 100,
        averageOrderValue: c.ordersCount > 0 ? Math.round((c.totalSpend / c.ordersCount) * 100) / 100 : 0,
      }))
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 15);

    // Repeat customers (>= 2 orders)
    const repeatCount = Object.values(customerSpendMap).filter((c) => c.ordersCount >= 2).length;
    const uniqueSpendersCount = Object.keys(customerSpendMap).length;
    const repeatRate = uniqueSpendersCount > 0 ? parseFloat(((repeatCount / uniqueSpendersCount) * 100).toFixed(1)) : 0;

    return {
      dateRange: {
        startDate: query.startDate || start.toISOString().split('T')[0],
        endDate: query.endDate || end.toISOString().split('T')[0],
      },
      summary: {
        totalCustomers,
        activeCustomers,
        newCustomersAcquired: newCustomers,
        transactingCustomers: uniqueSpendersCount,
        repeatCustomers: repeatCount,
        repeatRatePercent: repeatRate,
      },
      topSpenders,
    };
  }

  /**
   * 7. EXECUTIVE DASHBOARD SUMMARY STATS
   */
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      medicineCount,
      lowStockCount,
      outOfStockCount,
      todaySales,
      completedSales,
      supplierCount,
      pendingPOOrders,
      customerCount,
      pendingRxCount,
    ] = await Promise.all([
      Medicine.countDocuments({ isActive: true }),
      Medicine.countDocuments({ isActive: true, currentStock: { $gt: 0, $lte: '$minimumStock' } }), // Approximate, refine below
      Medicine.countDocuments({ isActive: true, currentStock: 0 }),
      Sale.find({ saleStatus: 'completed', createdAt: { $gte: today } }),
      Sale.find({ saleStatus: 'completed' }),
      Supplier.countDocuments({ isActive: true }),
      PurchaseOrder.countDocuments({ status: { $in: ['ordered', 'partial'] } }),
      Customer.countDocuments({ isActive: true }),
      Prescription.countDocuments({ status: 'pending' }),
    ]);

    // Accurate Low-stock calculation via inventory batches
    const batches = await MedicineBatch.find({ status: 'active' });
    const medicines = await Medicine.find({ isActive: true });
    const medStockMap = {};
    batches.forEach((b) => {
      const medId = b.medicine?.toString();
      medStockMap[medId] = (medStockMap[medId] || 0) + b.availableQuantity;
    });

    let realLowStock = 0;
    let realOutOfStock = 0;
    medicines.forEach((m) => {
      const stock = medStockMap[m._id.toString()] || 0;
      if (stock === 0) realOutOfStock += 1;
      else if (stock <= m.minimumStock) realLowStock += 1;
    });

    const todayRevenue = todaySales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    const lifetimeRevenue = completedSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);

    // 7-day revenue chart
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const daySales = completedSales.filter((s) => {
        const c = new Date(s.createdAt);
        return c >= d && c < nextD;
      });

      const dayRevenue = daySales.reduce((acc, s) => acc + s.totalAmount, 0);

      dailyTrend.push({
        date: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: Math.round(dayRevenue * 100) / 100,
        orders: daySales.length,
      });
    }

    return {
      medicines: {
        total: medicineCount,
        lowStock: realLowStock,
        outOfStock: realOutOfStock,
      },
      sales: {
        todayCount: todaySales.length,
        todayRevenue: Math.round(todayRevenue * 100) / 100,
        lifetimeCount: completedSales.length,
        lifetimeRevenue: Math.round(lifetimeRevenue * 100) / 100,
      },
      procurement: {
        activeSuppliers: supplierCount,
        pendingPOs: pendingPOOrders,
      },
      patients: {
        totalCustomers: customerCount,
        pendingPrescriptions: pendingRxCount,
      },
      dailyTrend,
    };
  }

  /**
   * 8. CSV EXPORT GENERATOR
   */
  exportReportCSV(type, data) {
    let rows = [];

    switch (type) {
      case 'sales': {
        rows.push(['Invoice Number', 'Date', 'Customer', 'Payment Method', 'Status', 'Subtotal', 'Tax', 'Discount', 'Total Amount', 'Amount Paid', 'Balance Due']);
        (data.recentSales || []).forEach((s) => {
          rows.push([
            s.invoiceNumber,
            new Date(s.createdAt).toISOString().split('T')[0],
            `"${(s.customerName || 'Walk-in').replace(/"/g, '""')}"`,
            s.paymentMethod || 'cash',
            s.saleStatus,
            s.subtotal || 0,
            s.tax || 0,
            s.discount || 0,
            s.totalAmount,
            s.amountPaid,
            s.balanceAmount,
          ]);
        });
        break;
      }
      case 'inventory': {
        rows.push(['Medicine Name', 'Category', 'SKU', 'Minimum Stock', 'Current Stock', 'Status']);
        (data.lowStockAlerts || []).forEach((m) => {
          rows.push([
            `"${(m.name || '').replace(/"/g, '""')}"`,
            m.category,
            m.sku,
            m.minimumStock,
            m.currentStock,
            m.status,
          ]);
        });
        break;
      }
      case 'purchases': {
        rows.push(['PO Number', 'Date', 'Supplier', 'Items Count', 'Status', 'Total Amount']);
        (data.recentPurchases || []).forEach((po) => {
          rows.push([
            po.poNumber,
            new Date(po.createdAt).toISOString().split('T')[0],
            `"${(po.supplierName || '').replace(/"/g, '""')}"`,
            po.itemCount,
            po.status,
            po.totalAmount,
          ]);
        });
        break;
      }
      case 'profit_loss': {
        rows.push(['Date', 'Gross Revenue (INR)', 'COGS (INR)', 'Gross Profit (INR)']);
        (data.timeSeries || []).forEach((t) => {
          rows.push([t.date, t.revenue, t.cogs, t.profit]);
        });
        break;
      }
      case 'medicines': {
        rows.push(['Medicine Name', 'Quantity Sold', 'Total Revenue (INR)', 'Gross Profit (INR)', 'Margin (%)']);
        (data.topByRevenue || []).forEach((m) => {
          rows.push([
            `"${(m.medicineName || '').replace(/"/g, '""')}"`,
            m.totalQuantitySold,
            m.totalRevenue,
            m.grossProfit,
            m.marginPercent,
          ]);
        });
        break;
      }
      case 'customers': {
        rows.push(['Customer Code', 'Customer Name', 'Phone', 'Orders Count', 'Total Spend (INR)', 'Average Order Value (INR)']);
        (data.topSpenders || []).forEach((c) => {
          rows.push([
            c.code,
            `"${(c.name || '').replace(/"/g, '""')}"`,
            c.phone,
            c.ordersCount,
            c.totalSpend,
            c.averageOrderValue,
          ]);
        });
        break;
      }
      default: {
        rows.push(['Metric', 'Value']);
        Object.entries(data.summary || {}).forEach(([k, v]) => {
          rows.push([k, v]);
        });
      }
    }

    return rows.map((r) => r.join(',')).join('\n');
  }

  /**
   * 9. PDF EXPORT GENERATOR (PDFKit)
   */
  exportReportPDF(type, data, outputStream) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `PharmaCore-${type.toUpperCase()}-Report`,
          Author: 'PharmaCore Pharmacy Management System',
        },
      });

      doc.on('error', reject);
      outputStream.on('finish', resolve);
      outputStream.on('error', reject);

      doc.pipe(outputStream);

      const primaryColor = '#1E3A8A'; // Navy
      const secondaryColor = '#0D9488'; // Teal
      const textColor = '#1E293B';
      const mutedColor = '#64748B';
      const lightBg = '#F8FAFC';
      const borderColor = '#E2E8F0';

      // --- HEADER ---
      doc.rect(40, 40, 515, 65).fill(lightBg);
      doc.fillColor(primaryColor).fontSize(18).font('Helvetica-Bold').text('PHARMACORE PHARMACY', 55, 50);
      doc.fillColor(secondaryColor).fontSize(9).font('Helvetica-Bold').text(
        `${type.toUpperCase().replace('_', ' ')} MANAGEMENT REPORT`,
        55,
        72
      );
      doc.fillColor(mutedColor).fontSize(8).font('Helvetica').text(
        `Generated: ${new Date().toLocaleString('en-IN')} | Period: ${data.dateRange?.startDate ? data.dateRange.startDate.split('T')[0] : 'All-time'} to ${data.dateRange?.endDate ? data.dateRange.endDate.split('T')[0] : 'Present'}`,
        55,
        85
      );

      // Summary Metric Cards
      const summaryKeys = Object.entries(data.summary || {}).slice(0, 4);
      let cardX = 40;
      const cardWidth = 120;
      const cardY = 115;

      summaryKeys.forEach(([k, v]) => {
        doc.roundedRect(cardX, cardY, cardWidth, 50, 4).strokeColor(borderColor).stroke();
        const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        doc.fillColor(mutedColor).fontSize(7).font('Helvetica').text(label, cardX + 8, cardY + 8, { width: cardWidth - 16 });
        const valStr = typeof v === 'number' && (k.includes('Revenue') || k.includes('Spend') || k.includes('Valuation') || k.includes('Profit') || k.includes('Cost'))
          ? `INR ${v.toLocaleString('en-IN')}`
          : String(v);
        doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text(valStr, cardX + 8, cardY + 24, { width: cardWidth - 16 });
        cardX += cardWidth + 11;
      });

      // Data Table Section
      let tableY = 180;
      doc.rect(40, tableY, 515, 20).fill('#F1F5F9');
      doc.fillColor(textColor).fontSize(8).font('Helvetica-Bold');

      switch (type) {
        case 'sales': {
          doc.text('Invoice #', 50, tableY + 6);
          doc.text('Date', 150, tableY + 6);
          doc.text('Customer', 240, tableY + 6);
          doc.text('Mode', 350, tableY + 6);
          doc.text('Status', 420, tableY + 6);
          doc.text('Amount (INR)', 480, tableY + 6);

          tableY += 22;
          (data.recentSales || []).slice(0, 18).forEach((s) => {
            doc.font('Helvetica').fontSize(8).fillColor(textColor);
            doc.text(s.invoiceNumber, 50, tableY);
            doc.text(new Date(s.createdAt).toISOString().split('T')[0], 150, tableY);
            doc.text(s.customerName.slice(0, 18), 240, tableY);
            doc.text((s.paymentMethod || 'cash').toUpperCase(), 350, tableY);
            doc.text(s.saleStatus.toUpperCase(), 420, tableY);
            doc.font('Helvetica-Bold').text(Number(s.totalAmount).toFixed(2), 480, tableY);
            tableY += 16;
          });
          break;
        }
        case 'inventory': {
          doc.text('Medicine Name', 50, tableY + 6);
          doc.text('Category', 230, tableY + 6);
          doc.text('SKU', 330, tableY + 6);
          doc.text('Min Stock', 410, tableY + 6);
          doc.text('In Stock', 470, tableY + 6);

          tableY += 22;
          (data.lowStockAlerts || []).slice(0, 18).forEach((m) => {
            doc.font('Helvetica').fontSize(8).fillColor(textColor);
            doc.text(m.name.slice(0, 26), 50, tableY);
            doc.text(m.category, 230, tableY);
            doc.text(m.sku, 330, tableY);
            doc.text(String(m.minimumStock), 410, tableY);
            doc.font('Helvetica-Bold').fillColor(m.currentStock === 0 ? '#DC2626' : '#D97706').text(String(m.currentStock), 470, tableY);
            tableY += 16;
          });
          break;
        }
        case 'purchases': {
          doc.text('PO Number', 50, tableY + 6);
          doc.text('Date', 150, tableY + 6);
          doc.text('Supplier', 240, tableY + 6);
          doc.text('Items', 370, tableY + 6);
          doc.text('Status', 420, tableY + 6);
          doc.text('Total (INR)', 480, tableY + 6);

          tableY += 22;
          (data.recentPurchases || []).slice(0, 18).forEach((po) => {
            doc.font('Helvetica').fontSize(8).fillColor(textColor);
            doc.text(po.poNumber, 50, tableY);
            doc.text(new Date(po.createdAt).toISOString().split('T')[0], 150, tableY);
            doc.text(po.supplierName.slice(0, 20), 240, tableY);
            doc.text(String(po.itemCount), 370, tableY);
            doc.text(po.status.toUpperCase(), 420, tableY);
            doc.font('Helvetica-Bold').text(Number(po.totalAmount).toFixed(2), 480, tableY);
            tableY += 16;
          });
          break;
        }
        case 'profit_loss': {
          doc.text('Date', 50, tableY + 6);
          doc.text('Revenue (INR)', 180, tableY + 6);
          doc.text('COGS (INR)', 300, tableY + 6);
          doc.text('Gross Profit (INR)', 430, tableY + 6);

          tableY += 22;
          (data.timeSeries || []).slice(0, 18).forEach((t) => {
            doc.font('Helvetica').fontSize(8).fillColor(textColor);
            doc.text(t.date, 50, tableY);
            doc.text(Number(t.revenue).toFixed(2), 180, tableY);
            doc.text(Number(t.cogs).toFixed(2), 300, tableY);
            doc.font('Helvetica-Bold').fillColor(t.profit >= 0 ? '#16A34A' : '#DC2626').text(Number(t.profit).toFixed(2), 430, tableY);
            tableY += 16;
          });
          break;
        }
        default: {
          doc.text('Item Description', 50, tableY + 6);
          doc.text('Value / Metric', 350, tableY + 6);

          tableY += 22;
          Object.entries(data.summary || {}).forEach(([k, v]) => {
            doc.font('Helvetica').fontSize(8).fillColor(textColor);
            doc.text(k, 50, tableY);
            doc.font('Helvetica-Bold').text(String(v), 350, tableY);
            tableY += 16;
          });
        }
      }

      // Footer
      doc.fontSize(8).font('Helvetica').fillColor(mutedColor).text(
        'PharmaCore PMS — Confidential Internal Clinical & Financial Document',
        50,
        780,
        { align: 'center', width: 495 }
      );

      doc.end();
    });
  }
}

module.exports = new ReportService();
