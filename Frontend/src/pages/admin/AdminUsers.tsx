import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminNav from "@/components/layout/AdminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Trash2, UserPlus, Mail, ShieldCheck,
  Users, UserCheck, Store, X, ChevronDown,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

/* ── role config ── */
const ROLE_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  admin:    { bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-400",  label: "Admin"    },
  seller:   { bg: "bg-sky-50",     text: "text-sky-700",     dot: "bg-sky-400",     label: "Seller"   },
  customer: { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   label: "Customer" },
};

const AVATAR_COLORS = [
  "from-[#722F37] to-[#c9856b]",
  "from-sky-600 to-sky-400",
  "from-violet-600 to-violet-400",
  "from-amber-600 to-amber-400",
  "from-emerald-600 to-emerald-400",
];

const avatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const initials = (name: string) =>
  name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
const AdminUsers = () => {
  const [users, setUsers]             = useState<User[]>([]);
  const [roleFilter, setRoleFilter]   = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal]     = useState(false);
  const [deleting, setDeleting]       = useState<string | null>(null);
  const [creating, setCreating]       = useState(false);

  const [newUser, setNewUser] = useState({
    name: "", email: "", password: "", role: "customer",
  });

  const searchRef = useRef<HTMLInputElement>(null);

  const loadUsers = async () => {
    try {
      const data = await fetchWithAuth("/admin/users");
      setUsers(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadUsers(); }, []);

  /* close modal on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setShowModal(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this user?")) return;
    setDeleting(id);
    try {
      await fetchWithAuth(`/admin/users/${id}`, { method: "DELETE" });
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) { console.error(err); }
    finally { setDeleting(null); }
  };

  const handleCreate = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) return;
    setCreating(true);
    try {
      await fetchWithAuth("/admin/users", {
        method: "POST",
        body: JSON.stringify(newUser),
      });
      setNewUser({ name: "", email: "", password: "", role: "customer" });
      setShowModal(false);
      loadUsers();
    } catch (err) { console.error(err); }
    finally { setCreating(false); }
  };

  const filteredUsers = users.filter(u => {
    const matchRole   = roleFilter === "all" || u.role === roleFilter;
    const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase())
                     || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRole && matchSearch;
  });

  /* live counts */
  const totalAdmins    = users.filter(u => u.role === "admin").length;
  const totalSellers   = users.filter(u => u.role === "seller").length;
  const totalCustomers = users.filter(u => u.role === "customer").length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F4]">
      <Navbar />
      <AdminNav />

      <main className="flex-1 container mx-auto px-8 py-10 space-y-8">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#3d1a11] tracking-tight">
              User Management
            </h1>
            <p className="text-gray-400 mt-1 text-sm italic">
              Oversee permissions and platform access
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2.5 bg-[#722F37] hover:bg-[#5a252c] text-white rounded-2xl px-5 py-3 text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-[#722F37]/20 transition-all duration-200 hover:shadow-xl hover:shadow-[#722F37]/30 hover:-translate-y-0.5 self-start sm:self-auto"
          >
            <UserPlus size={16} strokeWidth={2.5} />
            Add New User
          </button>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniStat
            label="Total Users"
            value={users.length}
            icon={<Users size={18} />}
            active={roleFilter === "all"}
            onClick={() => setRoleFilter("all")}
            accent="text-[#722F37]"
            bg="bg-[#722F37]/10"
          />
          <MiniStat
            label="Admins"
            value={totalAdmins}
            icon={<ShieldCheck size={18} />}
            active={roleFilter === "admin"}
            onClick={() => setRoleFilter("admin")}
            accent="text-violet-600"
            bg="bg-violet-50"
          />
          <MiniStat
            label="Sellers"
            value={totalSellers}
            icon={<Store size={18} />}
            active={roleFilter === "seller"}
            onClick={() => setRoleFilter("seller")}
            accent="text-sky-600"
            bg="bg-sky-50"
          />
          <MiniStat
            label="Customers"
            value={totalCustomers}
            icon={<UserCheck size={18} />}
            active={roleFilter === "customer"}
            onClick={() => setRoleFilter("customer")}
            accent="text-amber-600"
            bg="bg-amber-50"
          />
        </div>

        {/* ── SEARCH BAR ── */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              ref={searchRef}
              placeholder="Search by name or email…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E8DCCF] rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-[#722F37] focus:ring-2 focus:ring-[#722F37]/10 transition-all placeholder:text-gray-400 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="appearance-none bg-white border border-[#E8DCCF] rounded-2xl px-4 pr-9 py-3 text-sm outline-none text-gray-600 shadow-sm focus:border-[#722F37] focus:ring-2 focus:ring-[#722F37]/10 transition-all min-w-[140px] cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="seller">Sellers</option>
              <option value="customer">Customers</option>
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className="bg-white rounded-3xl border border-[#E8DCCF] overflow-hidden shadow-sm">
          {/* table header */}
          <div className="grid grid-cols-[1fr_140px_160px_100px] px-6 py-4 border-b border-[#E8DCCF] bg-[#FDF8F4]">
            {["Identity", "Role", "Joined", "Actions"].map((h, i) => (
              <p key={h} className={`text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 ${i === 3 ? "text-right" : ""}`}>
                {h}
              </p>
            ))}
          </div>

          {/* rows */}
          {filteredUsers.length > 0 ? (
            <div className="divide-y divide-[#F0E8DF]">
              {filteredUsers.map((user, idx) => {
                const rs = ROLE_STYLES[user.role] ?? ROLE_STYLES.customer;
                const isDeleting = deleting === user._id;
                return (
                  <div
                    key={user._id}
                    className="grid grid-cols-[1fr_140px_160px_100px] px-6 py-4 items-center hover:bg-[#FDF8F4] transition-colors group"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    {/* identity */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor(user.name)} flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-sm`}>
                        {initials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#3d1a11] text-sm truncate">{user.name}</p>
                        <p className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
                          <Mail size={10} className="shrink-0" />
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* role pill */}
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${rs.bg} ${rs.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${rs.dot}`} />
                        {rs.label}
                      </span>
                    </div>

                    {/* date */}
                    <p className="text-[12px] text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </p>

                    {/* actions */}
                    <div className="flex items-center justify-end gap-2">
                      <button
                        title="Manage permissions"
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-violet-600 hover:bg-violet-50 transition-all"
                      >
                        <ShieldCheck size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        disabled={isDeleting}
                        title="Delete user"
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
                      >
                        {isDeleting ? (
                          <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* empty state */
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Users size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-serif italic text-base">
                {searchQuery ? `No users matching "${searchQuery}"` : "No users found."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-[11px] font-bold uppercase tracking-widest text-[#722F37] hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* footer count */}
          {filteredUsers.length > 0 && (
            <div className="px-6 py-3 border-t border-[#F0E8DF] bg-[#FDF8F4] flex items-center justify-between">
              <p className="text-[11px] text-gray-400">
                Showing <span className="font-bold text-[#3d1a11]">{filteredUsers.length}</span> of{" "}
                <span className="font-bold text-[#3d1a11]">{users.length}</span> users
              </p>
              {roleFilter !== "all" && (
                <button
                  onClick={() => setRoleFilter("all")}
                  className="text-[11px] font-bold uppercase tracking-widest text-[#722F37] hover:underline flex items-center gap-1"
                >
                  <X size={10} /> Clear filter
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ════════════════════════════════════
          ADD USER MODAL
      ════════════════════════════════════ */}
      {showModal && (
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* panel */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
              {/* modal header */}
              <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-[#E8DCCF]">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#3d1a11]">Add New User</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Create a new account and assign a role</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* modal body */}
              <div className="px-8 py-6 space-y-4">
                <FormField label="Full Name">
                  <Input
                    placeholder="e.g. Priya Sharma"
                    value={newUser.name}
                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                    className="rounded-xl border-[#E8DCCF] focus:border-[#722F37] h-11"
                  />
                </FormField>
                <FormField label="Email Address">
                  <Input
                    placeholder="priya@example.com"
                    type="email"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    className="rounded-xl border-[#E8DCCF] focus:border-[#722F37] h-11"
                  />
                </FormField>
                <FormField label="Password">
                  <Input
                    placeholder="••••••••"
                    type="password"
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    className="rounded-xl border-[#E8DCCF] focus:border-[#722F37] h-11"
                  />
                </FormField>
                <FormField label="Role">
                  <div className="grid grid-cols-3 gap-3 mt-1">
                    {(["customer", "seller", "admin"] as const).map(r => {
                      const rs = ROLE_STYLES[r];
                      const active = newUser.role === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setNewUser({ ...newUser, role: r })}
                          className={`py-2.5 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                            active
                              ? `border-[#722F37] ${rs.bg} ${rs.text}`
                              : "border-[#E8DCCF] text-gray-400 hover:border-[#722F37]/30"
                          }`}
                        >
                          {rs.label}
                        </button>
                      );
                    })}
                  </div>
                </FormField>
              </div>

              {/* modal footer */}
              <div className="flex justify-end gap-3 px-8 pb-7 pt-2 border-t border-[#E8DCCF]">
                <Button
                  variant="outline"
                  className="rounded-xl px-6"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#722F37] hover:bg-[#5a252c] text-white rounded-xl px-7 shadow-md gap-2"
                  onClick={handleCreate}
                  disabled={creating || !newUser.name || !newUser.email || !newUser.password}
                >
                  {creating ? (
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  ) : (
                    <UserPlus size={15} />
                  )}
                  {creating ? "Creating…" : "Create User"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

/* ── Mini stat card — also acts as filter button ── */
const MiniStat = ({
  label, value, icon, active, onClick, accent, bg,
}: {
  label: string; value: number; icon: React.ReactNode;
  active: boolean; onClick: () => void;
  accent: string; bg: string;
}) => (
  <button
    onClick={onClick}
    className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-md ${
      active
        ? "border-[#722F37] bg-white shadow-md"
        : "border-[#E8DCCF] bg-white hover:border-[#722F37]/30"
    }`}
  >
    <div className={`w-9 h-9 rounded-xl ${bg} ${accent} flex items-center justify-center mb-3`}>
      {icon}
    </div>
    <p className="text-2xl font-bold text-[#3d1a11] leading-none">{value}</p>
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">{label}</p>
  </button>
);

/* ── Form field wrapper ── */
const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{label}</label>
    {children}
  </div>
);

export default AdminUsers;