'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  FileText, 
  X, 
  Percent, 
  Building2, 
  Layers, 
  Calculator,
  Download,
  Mail,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuotationsManager() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isOpen, setIsOpen] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [contactId, setContactId] = useState('');
  const [contactsList, setContactsList] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([{ productId: '', quantity: 1, price: 0, hsnCode: '' }]);
  const [gstRate, setGstRate] = useState(18);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [terms, setTerms] = useState('1. Price: Ex-Works Noida.\n2. Delivery: 4-6 weeks from PO.\n3. Warranty: 12 months from installation.\n4. GST: Extra as applicable (18%).');

  // Math totals
  const [subTotal, setSubTotal] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);
  const [total, setTotal] = useState(0);

  // Selected PDF viewer modal
  const [activeQuotation, setActiveQuotation] = useState<any>(null);

  useEffect(() => {
    fetchQuotations();
    fetchConfig();
  }, []);

  // Update totals whenever items, GST, or discount changes
  useEffect(() => {
    let sub = 0;
    items.forEach(it => {
      sub += (it.price || 0) * (it.quantity || 1);
    });
    setSubTotal(sub);
    const taxable = sub - (sub * (discountPercent || 0)) / 100;
    const gst = (taxable * (gstRate || 18)) / 100;
    setGstAmount(gst);
    setTotal(taxable + gst);
  }, [items, gstRate, discountPercent]);

  async function fetchQuotations() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/crm/quotations');
      if (res.ok) {
        const data = await res.json();
        setQuotations(data);
      }
    } catch (err) {
      toast.error('Failed to load quotations log');
    } finally {
      setLoading(false);
    }
  }

  async function fetchConfig() {
    try {
      const [companiesRes, productsRes] = await Promise.all([
        fetch('/api/admin/crm/contacts?limit=100'),
        fetch('/api/products')
      ]);

      if (companiesRes.ok) {
        const data = await companiesRes.json();
        setCompanies(data.companies || []);
      }

      if (productsRes.ok) {
        const prodData = await productsRes.json();
        const catalogList = Array.isArray(prodData) ? prodData : (prodData.products || []);
        if (catalogList.length > 0) {
          setProducts(catalogList.map((p: any) => ({
            _id: p._id,
            name: p.title || p.name,
            modelNumber: p.modelNumber || 'LZ-100',
            price: p.price || 85000,
            hsnCode: p.hsnCode || '90248091'
          })));
        } else {
          setProducts([
            { _id: '1', name: 'Bursting Strength Tester - Digital', modelNumber: 'BST-D200', price: 85000, hsnCode: '90248091' },
            { _id: '2', name: 'Box Compression Tester - Computerized', modelNumber: 'BCT-C10K', price: 245000, hsnCode: '90248091' },
            { _id: '3', name: 'Universal Tensile Testing Machine', modelNumber: 'UTM-50KN', price: 420000, hsnCode: '90248010' },
            { _id: '4', name: 'Drop Tester - Pneumatic', modelNumber: 'DT-P150', price: 110000, hsnCode: '90248099' },
            { _id: '5', name: 'Polariscope PET Preform Tester', modelNumber: 'PET-PL60', price: 95000, hsnCode: '90314900' },
            { _id: '6', name: 'Digital GSM Balance - High Precision', modelNumber: 'GSM-B300', price: 25000, hsnCode: '90160010' },
          ]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Update contacts list when company selection changes
  function handleCompanyChange(cId: string) {
    setCompanyId(cId);
    const selectedCompany = companies.find(c => c._id === cId);
    if (selectedCompany && selectedCompany.contacts) {
      setContactsList(selectedCompany.contacts);
      if (selectedCompany.contacts.length > 0) {
        setContactId(selectedCompany.contacts[0]._id);
      }
    }
  }

  // Handle selected product changing in item row
  function handleProductChange(index: number, pId: string) {
    const selectedProd = products.find(p => p._id === pId);
    if (!selectedProd) return;

    const newItems = [...items];
    newItems[index] = {
      product: pId,
      productId: pId,
      quantity: newItems[index].quantity,
      price: selectedProd.price,
      hsnCode: selectedProd.hsnCode
    };
    setItems(newItems);
  }

  // Row operations
  function addItemRow() {
    setItems([...items, { productId: '', quantity: 1, price: 0, hsnCode: '' }]);
  }

  function removeItemRow(index: number) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function handleQuantityChange(index: number, qty: number) {
    const newItems = [...items];
    newItems[index].quantity = Math.max(qty, 1);
    setItems(newItems);
  }

  // Register B2B Invoice / Quotation
  async function handleSubmitQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId || !contactId) {
      toast.error('Customer details are required');
      return;
    }

    const invalidItem = items.some(it => !it.productId);
    if (invalidItem) {
      toast.error('Select a product for all quotation lines');
      return;
    }

    try {
      const res = await fetch('/api/admin/crm/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: companyId,
          contact: contactId,
          items: items.map(it => ({
            product: it.productId,
            quantity: it.quantity,
            price: it.price,
            hsnCode: it.hsnCode
          })),
          gstRate,
          discountPercentage: discountPercent,
          termsAndConditions: terms
        })
      });

      if (res.ok) {
        toast.success('B2B Quotation registered successfully');
        setIsOpen(false);
        setCompanyId('');
        setContactId('');
        setItems([{ productId: '', quantity: 1, price: 0, hsnCode: '' }]);
        setDiscountPercent(0);
        fetchQuotations();
      } else {
        toast.error('Failed to create quotation');
      }
    } catch (err) {
      toast.error('Operation failed');
    }
  }

  async function approveQuotation(id: string) {
    try {
      const res = await fetch('/api/admin/crm/quotations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Approved' })
      });
      if (res.ok) {
        toast.success('Quotation Approved! Converted to B2B Production Order.');
        fetchQuotations();
        setActiveQuotation(null);
      }
    } catch (err) {
      toast.error('Failed to approve quotation');
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">Quotation Engine</h1>
          <p className="text-gray-500 font-medium text-sm">Create industrial machinery quotations, estimate discounts, configure GST bills, and generate invoices.</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white hover:bg-secondary transition-colors text-xs font-black uppercase tracking-widest px-6 py-3 flex items-center shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Quotation
        </button>
      </div>

      {/* Log list */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
              <th className="p-4 pl-6">Quote Number</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Subtotal</th>
              <th className="p-4">GST Tax</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4 text-right pr-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-6 pl-6"><div className="h-4 w-28 bg-gray-100" /></td>
                  <td className="p-6"><div className="h-4 w-40 bg-gray-100" /></td>
                  <td className="p-6"><div className="h-4 w-20 bg-gray-100" /></td>
                  <td className="p-6"><div className="h-4 w-20 bg-gray-100" /></td>
                  <td className="p-6"><div className="h-4 w-24 bg-gray-100 animate-pulse ml-auto" /></td>
                  <td className="p-6"><div className="h-6 w-16 bg-gray-100 ml-auto" /></td>
                </tr>
              ))
            ) : quotations.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-20 text-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                  No B2B machinery quotations registered.
                </td>
              </tr>
            ) : (
              quotations.map((quote) => (
                <tr 
                  key={quote._id} 
                  className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                  onClick={() => setActiveQuotation(quote)}
                >
                  <td className="p-4 pl-6 font-black text-secondary text-xs uppercase tracking-tight">
                    {quote.quotationNumber}
                  </td>
                  <td className="p-4 text-xs font-bold text-gray-500">
                    {quote.company?.name}
                  </td>
                  <td className="p-4 text-xs font-bold text-gray-500">
                    ₹{quote.subTotal?.toLocaleString()}
                  </td>
                  <td className="p-4 text-xs font-bold text-gray-400">
                    ₹{quote.gstAmount?.toLocaleString()} ({quote.gstRate}%)
                  </td>
                  <td className="p-4 text-xs font-black text-secondary">
                    ₹{quote.totalAmount?.toLocaleString()}
                  </td>
                  <td className="p-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 border ${
                      quote.status === 'Approved' 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : quote.status === 'Rejected'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}>
                      {quote.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE QUOTATION SLIDEOVER PANEL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-secondary/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-[650px] bg-white shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-lg font-black text-secondary tracking-tight uppercase">Generate machinery quotation</h2>
              <button onClick={() => setIsOpen(false)} className="p-1 text-gray-400 hover:text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Select B2B Client *</label>
                  <select
                    required
                    value={companyId}
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none text-gray-600 bg-white"
                  >
                    <option value="">Select B2B Account...</option>
                    {companies.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Contact Person *</label>
                  <select
                    required
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                    className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none text-gray-600 bg-white"
                  >
                    <option value="">Select Contact...</option>
                    {contactsList.map(c => (
                      <option key={c._id} value={c._id}>{c.name} ({c.designation})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing Lines Table */}
              <div className="space-y-3 pt-4 border-t border-dashed border-gray-150">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-widest text-secondary flex items-center">
                    <Calculator className="w-4 h-4 mr-2 text-primary" />
                    Quotation pricing lines
                  </h3>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline border border-primary/20 px-2.5 py-1"
                  >
                    Add Product Line
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-end bg-gray-50 p-3 border border-gray-100">
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Select testing instrument</label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full p-2 text-xs border border-gray-200 focus:outline-none bg-white text-gray-600 font-semibold"
                        >
                          <option value="">Choose Machinery...</option>
                          {products.map(p => (
                            <option key={p._id} value={p._id}>{p.name} ({p.modelNumber})</option>
                          ))}
                        </select>
                      </div>

                      <div className="w-20 space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value, 10))}
                          className="w-full p-2 text-xs border border-gray-200 focus:outline-none bg-white font-semibold text-center"
                          min={1}
                        />
                      </div>

                      <div className="w-28 space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Unit Price (₹)</label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const newPrice = parseFloat(e.target.value) || 0;
                            const newItems = [...items];
                            newItems[idx].price = newPrice;
                            setItems(newItems);
                          }}
                          className="w-full p-2 text-xs border border-gray-200 bg-white focus:outline-none font-bold text-secondary focus:border-primary"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        disabled={items.length === 1}
                        className="p-2 text-gray-300 hover:text-red-600 disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* GST and discount math panel */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-gray-150">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">GST Tax Rate (%)</label>
                  <input
                    type="number"
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Discount Percentage (%)</label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* Quotation terms */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Quotation Terms & Conditions</label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 text-xs border border-gray-200 focus:border-primary focus:outline-none font-semibold text-gray-600"
                />
              </div>

              {/* Math summaries */}
              <div className="bg-gray-50 border border-gray-150 p-4 space-y-2 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">
                <p>Taxable Subtotal: <span className="text-secondary font-black">₹{subTotal?.toLocaleString()}</span></p>
                <p>GST tax Amount ({gstRate}%): <span className="text-secondary font-black">₹{gstAmount?.toLocaleString()}</span></p>
                <p className="border-t border-gray-200 pt-2 text-sm text-secondary font-black">
                  Final Quote Value: <span className="text-primary">₹{total?.toLocaleString()}</span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white hover:bg-primary/95 text-xs font-black uppercase tracking-widest py-3 mt-4"
              >
                Register Machinery Invoice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PDF QUOTATION VIEWER SIDE DRAWER */}
      {activeQuotation && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div className="absolute inset-0 bg-secondary/30 backdrop-blur-sm" onClick={() => setActiveQuotation(null)} />
          <div className="relative w-full md:w-[650px] bg-white h-full shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300 z-10">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-sm font-black text-secondary uppercase tracking-widest">B2B Invoice PDF Preview</h2>
              <div className="flex gap-2">
                {activeQuotation.status === 'Draft' && (
                  <button 
                    onClick={() => approveQuotation(activeQuotation._id)}
                    className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2"
                  >
                    Approve and Order
                  </button>
                )}
                <button onClick={() => setActiveQuotation(null)} className="p-1 text-gray-400 hover:text-secondary">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dynamic PDF layout simulator */}
            <div className="flex-1 border border-gray-300 bg-gray-100 p-8 overflow-y-auto font-sans shadow-inner">
              <div className="bg-white p-8 border border-gray-200 min-h-[800px] flex flex-col justify-between text-xs leading-relaxed text-secondary shadow-md relative overflow-hidden">
                {/* Header */}
                <div>
                  <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6">
                    <div>
                      <h2 className="text-lg font-black tracking-tight text-primary">LABZENIX TESTING</h2>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Premium Machinery Manufacturing</p>
                      <p className="text-[9px] text-gray-400 mt-2 font-medium">Sector 63, Noida, UP - 201301</p>
                    </div>
                    <div className="text-right">
                      <h3 className="text-sm font-black text-secondary uppercase tracking-wider">QUOTATION</h3>
                      <p className="text-[10px] text-gray-400 font-bold mt-1">NO: {activeQuotation.quotationNumber}</p>
                      <p className="text-[10px] text-gray-400 font-bold">DATE: {new Date(activeQuotation.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="grid grid-cols-2 gap-8 py-6 text-[10px]">
                    <div>
                      <h4 className="font-black text-gray-400 uppercase tracking-widest mb-1.5">Supplier Details</h4>
                      <p className="font-bold text-secondary">LabZenix Instruments India</p>
                      <p className="font-medium text-gray-500">GST: 09AAACL1949C1Z9</p>
                    </div>
                    <div>
                      <h4 className="font-black text-gray-400 uppercase tracking-widest mb-1.5">Buyer Billing Info</h4>
                      <p className="font-bold text-secondary">{activeQuotation.company?.name}</p>
                      <p className="font-medium text-gray-500">Address: {activeQuotation.company?.address || 'Industrial Plot Noida'}</p>
                      <p className="font-medium text-gray-500">GST: {activeQuotation.company?.gstNumber || 'Not Provided'}</p>
                    </div>
                  </div>

                  {/* Invoice items table */}
                  <table className="w-full text-left border-collapse mt-4 text-[10px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-400 font-black uppercase tracking-wider">
                        <th className="p-2 pl-4">Description</th>
                        <th className="p-2">HSN</th>
                        <th className="p-2 text-center">QTY</th>
                        <th className="p-2">Unit Price</th>
                        <th className="p-2 text-right pr-4">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activeQuotation.items?.map((item: any, i: number) => (
                        <tr key={i}>
                          <td className="p-2.5 pl-4 font-black uppercase text-secondary">{item.product?.name || 'Testing Equipment'}</td>
                          <td className="p-2.5 font-bold text-gray-400">{item.hsnCode || '9024'}</td>
                          <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                          <td className="p-2.5 font-bold">₹{item.price?.toLocaleString()}</td>
                          <td className="p-2.5 text-right pr-4 font-black">₹{(item.price * item.quantity)?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Terms and math summary */}
                <div className="pt-8 border-t border-gray-100 mt-12 grid grid-cols-2 gap-8 text-[9px] leading-relaxed">
                  <div>
                    <h4 className="font-black text-gray-400 uppercase tracking-wider mb-2">Terms & Conditions</h4>
                    <p className="whitespace-pre-line text-gray-500 font-medium">{activeQuotation.termsAndConditions}</p>
                  </div>
                  <div className="bg-gray-50 p-4 space-y-1.5 text-right font-bold text-gray-500 uppercase tracking-wider self-end border border-gray-150">
                    <p>Subtotal: <span className="text-secondary font-black">₹{activeQuotation.subTotal?.toLocaleString()}</span></p>
                    <p>GST Extra ({activeQuotation.gstRate}%): <span className="text-secondary font-black">₹{activeQuotation.gstAmount?.toLocaleString()}</span></p>
                    <p className="border-t border-gray-200 pt-1.5 text-[11px] text-primary font-black">
                      Final Quotation: ₹{activeQuotation.totalAmount?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
