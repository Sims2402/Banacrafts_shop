import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminNav from "@/components/layout/AdminNav";
import {
  Search, Ticket, IndianRupee, Tag, Trash2,
  Plus, X, ChevronDown, Zap, TrendingUp,
} from "lucide-react";

interface Discount {
  _id: string;
  code: string;
  label: string;
  type: "percentage" | "fixed";
  value: number;
  scope: string;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validTill: string;
  isActive: boolean;
  createdBy: "admin" | "seller";
}

/* ── helpers ── */
const isExpired = (d: Discount) => new Date(d.validTill) < new Date();

const usagePct = (d: Discount) =>
  d.usageLimit > 0 ? Math.min(100, Math.round((d.usedCount / d.usageLimit) * 100)) : 0;

const daysLeft = (validTill: string) => {
  const diff = new Date(validTill).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
};

/* ════════════════════════════════════════
   PAGE
════════════════════════════════════════ */
const AdminDiscounts = () => {
  const [discounts, setDiscounts]       = useState<Discount[]>([]);
  const [showModal, setShowModal]       = useState(false);
  const [loading, setLoading]           = useState(false);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [searchTerm, setSearchTerm]     = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState({
    code: "", label: "Admin", type: "percentage",
    value: 0, scope: "site", usageLimit: 0,
    validFrom: new Date().toISOString().split("T")[0], validTill: "",
  });

  const load = async () => {
    try { setDiscounts(await fetchWithAuth("/admin/discounts")); }
    catch (e) { console.error(e); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setShowModal(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const toggleStatus = async (id: string) => {
    await fetchWithAuth(`/admin/discounts/${id}/toggle`, { method: "PATCH" });
    load();
  };

  const deleteDiscount = async (id: string) => {
    if (!confirm("Permanently delete this discount?")) return;
    setDeletingId(id);
    try { await fetchWithAuth(`/admin/discounts/${id}`, { method: "DELETE" }); load(); }
    catch (e) { console.error(e); }
    finally { setDeletingId(null); }
  };

  const createDiscount = async () => {
    if (!form.code || !form.validTill || form.value <= 0) return;
    setLoading(true);
    try {
      await fetchWithAuth("/admin/discounts", {
        method: "POST",
        body: JSON.stringify({ ...form, createdBy: form.label.toLowerCase(), isActive: true }),
      });
      setShowModal(false);
      load();
      setForm({ code: "", label: "Admin", type: "percentage", value: 0, scope: "site",
        usageLimit: 0, validFrom: new Date().toISOString().split("T")[0], validTill: "" });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = discounts.filter(d => {
    const matchSearch = d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        d.label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" ||
      (statusFilter === "active"   &&  d.isActive && !isExpired(d)) ||
      (statusFilter === "disabled" && !d.isActive) ||
      (statusFilter === "expired"  &&  isExpired(d));
    return matchSearch && matchStatus;
  });

  /* live stats */
  const activeCoupons   = discounts.filter(d => d.isActive && !isExpired(d)).length;
  const totalRedemptions = discounts.reduce((s, d) => s + d.usedCount, 0);
  const expiringSoon    = discounts.filter(d => d.isActive && daysLeft(d.validTill) <= 7 && daysLeft(d.validTill) > 0).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F4]">
      <Navbar />
      <AdminNav />

      <main className="container mx-auto px-8 py-10 flex-1 space-y-8">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#3d1a11] tracking-tight">
              Discount Management
            </h1>
            <p className="text-gray-400 mt-1 text-sm italic">
              Create and manage all platform promotional offers
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2.5 bg-[#722F37] hover:bg-[#5a252c] text-white rounded-2xl px-5 py-3 text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-[#722F37]/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#722F37]/30 self-start sm:self-auto"
          >
            <Plus size={16} strokeWidth={2.5} /> Create Discount
          </button>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Offers"      value={discounts.length}  icon={<Tag size={18}/>}        accent="text-[#722F37]"   bg="bg-[#722F37]/10" active={statusFilter==="all"}      onClick={() => setStatusFilter("all")} />
          <StatCard label="Active Coupons"    value={activeCoupons}     icon={<Ticket size={18}/>}     accent="text-emerald-600" bg="bg-emerald-50"   active={statusFilter==="active"}   onClick={() => setStatusFilter("active")} />
          <StatCard label="Total Redemptions" value={totalRedemptions}  icon={<TrendingUp size={18}/>} accent="text-sky-600"     bg="bg-sky-50"       active={false} onClick={() => {}} />
          <StatCard label="Expiring Soon"     value={expiringSoon}      icon={<Zap size={18}/>}        accent="text-amber-600"   bg="bg-amber-50"     active={false} onClick={() => {}} />
        </div>

        {/* ── SEARCH & FILTER ── */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              placeholder="Search by code or label…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#E8DCCF] rounded-2xl py-3 pl-11 pr-10 text-sm focus:outline-none focus:border-[#722F37] focus:ring-2 focus:ring-[#722F37]/10 transition-all placeholder:text-gray-400 shadow-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-[#E8DCCF] rounded-2xl px-4 pr-9 py-3 text-sm outline-none text-gray-600 shadow-sm focus:border-[#722F37] transition-all min-w-[150px] cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled</option>
              <option value="expired">Expired</option>
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className="bg-white rounded-3xl border border-[#E8DCCF] overflow-hidden shadow-sm">
          {/* thead */}
          <div className="grid grid-cols-[1.4fr_100px_110px_100px_160px_120px_100px] px-6 py-4 border-b border-[#E8DCCF] bg-[#FDF8F4]">
            {["Code", "Label", "Type", "Value", "Usage", "Status", "Actions"].map((h, i) => (
              <p key={h} className={`text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 ${i === 6 ? "text-right" : ""}`}>
                {h}
              </p>
            ))}
          </div>

          {filtered.length > 0 ? (
            <div className="divide-y divide-[#F0E8DF]">
              {filtered.map(d => {
                const expired = isExpired(d);
                const pct     = usagePct(d);
                const days    = daysLeft(d.validTill);
                const isDeleting = deletingId === d._id;

                return (
                  <div
                    key={d._id}
                    className="grid grid-cols-[1.4fr_100px_110px_100px_160px_120px_100px] px-6 py-4 items-center hover:bg-[#FDF8F4] transition-colors group"
                  >
                    {/* code */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#3d1a11] tracking-widest text-sm bg-[#F5EDE8] px-2.5 py-1 rounded-lg font-mono">
                          {d.code}
                        </span>
                        {expired && (
                          <span className="text-[9px] font-black uppercase tracking-wider text-red-400 bg-red-50 px-2 py-0.5 rounded-full">
                            Expired
                          </span>
                        )}
                        {!expired && days <= 7 && days > 0 && (
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                            {days}d left
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Till {new Date(d.validTill).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>

                    {/* label */}
                    <p className="text-[12px] font-semibold text-gray-500">{d.label}</p>

                    {/* type */}
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        d.type === "percentage"
                          ? "bg-violet-50 text-violet-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}>
                        {d.type === "percentage" ? <span>%</span> : <IndianRupee size={9} />}
                        {d.type === "percentage" ? "Percent" : "Fixed"}
                      </span>
                    </div>

                    {/* value */}
                    <p className="text-[15px] font-black text-[#3d1a11]">
                      {d.type === "percentage" ? `${d.value}%` : `₹${d.value}`}
                    </p>

                    {/* usage with progress bar */}
                    <div className="pr-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-gray-500">{d.usedCount}</span>
                        <span className="text-[10px] text-gray-300">/ {d.usageLimit || "∞"}</span>
                      </div>
                      {d.usageLimit > 0 && (
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct >= 90 ? "bg-red-400" : pct >= 60 ? "bg-amber-400" : "bg-emerald-400"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* status toggle */}
                    <div>
                      <button
                        onClick={() => toggleStatus(d._id)}
                        className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none ${
                          d.isActive && !expired ? "bg-emerald-400" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                            d.isActive && !expired ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <p className={`text-[9px] font-black uppercase tracking-wider mt-1 ${
                        d.isActive && !expired ? "text-emerald-500" : "text-gray-400"
                      }`}>
                        {expired ? "Expired" : d.isActive ? "Active" : "Off"}
                      </p>
                    </div>

                    {/* actions */}
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => deleteDiscount(d._id)}
                        disabled={isDeleting}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
                      >
                        {isDeleting
                          ? <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                          : <Trash2 size={14} />
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Ticket size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-serif italic">
                {searchTerm ? `No discounts matching "${searchTerm}"` : "No discounts found."}
              </p>
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="text-[11px] font-bold uppercase tracking-widest text-[#722F37] hover:underline">
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* footer */}
          {filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-[#F0E8DF] bg-[#FDF8F4] flex items-center justify-between">
              <p className="text-[11px] text-gray-400">
                Showing <span className="font-bold text-[#3d1a11]">{filtered.length}</span> of{" "}
                <span className="font-bold text-[#3d1a11]">{discounts.length}</span> discounts
              </p>
              {statusFilter !== "all" && (
                <button onClick={() => setStatusFilter("all")} className="text-[11px] font-bold uppercase tracking-widest text-[#722F37] hover:underline flex items-center gap-1">
                  <X size={10} /> Clear filter
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ════════════════════════════════════
          CREATE MODAL
      ════════════════════════════════════ */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg pointer-events-auto animate-in fade-in zoom-in-95 duration-200">

              {/* modal header */}
              <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-[#E8DCCF]">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#3d1a11]">New Discount Offer</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Fill in the details to create a coupon</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* modal body */}
              <div className="px-8 py-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Coupon Code">
                    <input
                      placeholder="SAVE25"
                      value={form.code}
                      onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      className="w-full border border-[#E8DCCF] rounded-xl px-4 py-2.5 text-sm font-mono font-bold tracking-widest bg-white focus:outline-none focus:border-[#722F37] focus:ring-2 focus:ring-[#722F37]/10 transition-all"
                    />
                  </FormField>
                  <FormField label="Created By">
                    <div className="relative">
                      <select
                        value={form.label}
                        onChange={e => setForm({ ...form, label: e.target.value })}
                        className="appearance-none w-full border border-[#E8DCCF] rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#722F37] focus:ring-2 focus:ring-[#722F37]/10 transition-all cursor-pointer"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Seller">Seller</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </FormField>
                </div>

                {/* type + value */}
                <FormField label="Discount Type & Value">
                  <div className="flex gap-2">
                    <div className="flex border border-[#E8DCCF] rounded-xl overflow-hidden bg-white shrink-0">
                      {[{ v: "percentage", icon: "%" }, { v: "fixed", icon: "₹" }].map(({ v, icon }) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setForm({ ...form, type: v as any })}
                          className={`px-4 py-2.5 text-xs font-black transition-colors ${form.type === v ? "bg-[#722F37] text-white" : "text-gray-400 hover:bg-gray-50"} ${v === "fixed" ? "border-l border-[#E8DCCF]" : ""}`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      value={form.value || ""}
                      placeholder={form.type === "percentage" ? "e.g. 10" : "e.g. 500"}
                      onChange={e => setForm({ ...form, value: Number(e.target.value) })}
                      className="flex-1 border border-[#E8DCCF] rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#722F37] focus:ring-2 focus:ring-[#722F37]/10 transition-all"
                    />
                  </div>
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Usage Limit">
                    <input
                      type="number"
                      value={form.usageLimit || ""}
                      placeholder="e.g. 100"
                      onChange={e => setForm({ ...form, usageLimit: Number(e.target.value) })}
                      className="w-full border border-[#E8DCCF] rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#722F37] focus:ring-2 focus:ring-[#722F37]/10 transition-all"
                    />
                  </FormField>
                  <FormField label="Valid Till">
                    <input
                      type="date"
                      value={form.validTill}
                      onChange={e => setForm({ ...form, validTill: e.target.value })}
                      className="w-full border border-[#E8DCCF] rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#722F37] focus:ring-2 focus:ring-[#722F37]/10 transition-all"
                    />
                  </FormField>
                </div>

                {/* live preview pill */}
                {form.code && form.value > 0 && (
                  <div className="bg-[#FDF8F4] border border-[#E8DCCF] rounded-2xl px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Preview</p>
                      <p className="font-mono font-black text-[#3d1a11] text-lg tracking-widest">{form.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-[#722F37]">
                        {form.type === "percentage" ? `${form.value}%` : `₹${form.value}`}
                      </p>
                      <p className="text-[10px] text-gray-400">{form.type === "percentage" ? "off" : "flat off"}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* modal footer */}
              <div className="flex justify-end gap-3 px-8 pb-7 pt-2 border-t border-[#E8DCCF]">
                <button onClick={() => setShowModal(false)} className="text-gray-400 font-bold uppercase text-[11px] tracking-widest px-4 hover:text-gray-600 transition-colors">
                  Cancel
                </button>
                <button
                  disabled={loading || !form.code || !form.validTill || form.value <= 0}
                  onClick={createDiscount}
                  className="bg-[#722F37] hover:bg-[#5a252c] text-white px-8 h-11 rounded-xl shadow-md font-bold text-sm disabled:opacity-40 transition-all flex items-center gap-2"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
                    : <><Plus size={15} /> Save Discount</>
                  }
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

/* ── Stat Card ── */
const StatCard = ({ label, value, icon, accent, bg, active, onClick }: {
  label: string; value: number; icon: React.ReactNode;
  accent: string; bg: string; active: boolean; onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-md bg-white ${
      active ? "border-[#722F37] shadow-md" : "border-[#E8DCCF] hover:border-[#722F37]/30"
    }`}
  >
    <div className={`w-9 h-9 rounded-xl ${bg} ${accent} flex items-center justify-center mb-3`}>
      {icon}
    </div>
    <p className="text-2xl font-bold text-[#3d1a11] leading-none">{value}</p>
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">{label}</p>
  </button>
);

/* ── Form Field ── */
const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{label}</label>
    {children}
  </div>
);

export default AdminDiscounts;