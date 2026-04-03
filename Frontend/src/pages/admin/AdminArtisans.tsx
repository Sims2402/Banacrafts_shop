import { useEffect, useState, useRef } from "react";
import { fetchWithAuth } from "@/lib/api";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminNav from "@/components/layout/AdminNav";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

import {
  Plus, Edit, Trash2, Eye, ImageIcon, X,
  Users, MapPin, Award, Tag,
  ZoomIn, MoveHorizontal,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";

/* ─── Types ─── */
interface ImagePosition { x: number; y: number; scale: number; }

interface Artisan {
  _id: string;
  name: string;
  craft: string;
  specialty: string;
  location: string;
  experience: number;
  description: string;
  bio: string;
  image: string;
  imagePosition?: ImagePosition;
  productsCount: number;
  achievements: string[];
  createdAt: string;
}

const DEFAULT_POS: ImagePosition = { x: 50, y: 50, scale: 100 };

const EMPTY_FORM = {
  name: "",
  craft: "",
  specialty: "",
  location: "",
  experience: "",
  description: "",
  bio: "",
  productsCount: "",
  achievements: "",
};

/* ══════════════════════════════════════════════
   IMAGE PANEL
══════════════════════════════════════════════ */
interface ImagePanelProps {
  preview: string | null;
  position: ImagePosition;
  onUpload: (dataUrl: string) => void;
  onRemove: () => void;
  onPositionChange: (pos: ImagePosition) => void;
  heightClass?: string;
}

const ImagePanel = ({
  preview, position, onUpload, onRemove, onPositionChange,
  heightClass = "h-52",
}: ImagePanelProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onUpload(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <>
          <div className={`relative rounded-2xl overflow-hidden ${heightClass} bg-gray-100 group`}>
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover transition-all duration-200"
              style={{
                objectPosition: `${position.x}% ${position.y}%`,
                transform: `scale(${position.scale / 100})`,
                transformOrigin: `${position.x}% ${position.y}%`,
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
              <button type="button" onClick={() => inputRef.current?.click()}
                className="bg-white/90 hover:bg-white text-[#3d1a11] text-xs font-semibold px-4 py-2 rounded-full shadow-lg transition">
                Replace
              </button>
              <button type="button" onClick={onRemove}
                className="bg-red-500/90 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg transition">
                Remove
              </button>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
              Adjust Image Frame
            </p>
            <SliderRow label="Horizontal" icon={<MoveHorizontal size={13} />}
              value={position.x} min={0} max={100}
              onChange={v => onPositionChange({ ...position, x: v })} />
            <SliderRow label="Vertical" icon={<MoveHorizontal size={13} className="rotate-90" />}
              value={position.y} min={0} max={100}
              onChange={v => onPositionChange({ ...position, y: v })} />
            <SliderRow label="Zoom" icon={<ZoomIn size={13} />}
              value={position.scale} min={100} max={200}
              onChange={v => onPositionChange({ ...position, scale: v })} suffix="%" />
          </div>
        </>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed border-[#722F37]/30 rounded-2xl ${heightClass} flex flex-col items-center justify-center cursor-pointer hover:border-[#722F37]/60 hover:bg-[#722F37]/5 transition-all group`}
        >
          <div className="w-14 h-14 rounded-full bg-[#722F37]/10 flex items-center justify-center mb-3 group-hover:bg-[#722F37]/20 transition">
            <ImageIcon size={22} className="text-[#722F37]" />
          </div>
          <p className="text-sm font-semibold text-[#3d1a11]">Upload Artisan Photo</p>
          <p className="text-xs text-gray-400 mt-1">Click to browse · JPG, PNG, WEBP</p>
        </div>
      )}
      <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={handleFile} />
    </div>
  );
};

const SliderRow = ({ label, icon, value, min, max, onChange, suffix = "" }: {
  label: string; icon: React.ReactNode;
  value: number; min: number; max: number;
  onChange: (v: number) => void; suffix?: string;
}) => (
  <div className="flex items-center gap-3">
    <span className="text-gray-400 w-4 shrink-0">{icon}</span>
    <span className="text-xs text-gray-500 w-16 shrink-0">{label}</span>
    <Slider value={[value]} min={min} max={max} step={1}
      onValueChange={([v]) => onChange(v)} className="flex-1" />
    <span className="text-xs text-gray-400 w-10 text-right shrink-0">{value}{suffix}</span>
  </div>
);

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
const AdminArtisans = () => {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<Artisan | null>(null);

  const [addImage, setAddImage] = useState<string | null>(null);
  const [addImagePos, setAddImagePos] = useState<ImagePosition>(DEFAULT_POS);
  const [addForm, setAddForm] = useState(EMPTY_FORM);

  const [editImage, setEditImage] = useState<string | null>(null);
  const [editImagePos, setEditImagePos] = useState<ImagePosition>(DEFAULT_POS);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const { toast } = useToast();

  const totalCrafts = new Set(artisans.map(a => a.craft?.trim().toLowerCase()).filter(Boolean)).size;
  const totalLocations = new Set(artisans.map(a => a.location?.trim().toLowerCase()).filter(Boolean)).size;

  const loadArtisans = async () => {
    try {
      const res = await fetchWithAuth("/admin/artisans");
      setArtisans(res.data ?? res);
    } catch (err) {
      toast({ title: "Failed to load artisans", variant: "destructive" });
    }
  };

  useEffect(() => { loadArtisans(); }, []);

  const resetAdd = () => { setAddForm(EMPTY_FORM); setAddImage(null); setAddImagePos(DEFAULT_POS); };

  const parseAchievements = (str: string) =>
    str.split(",").map(s => s.trim()).filter(Boolean);

  /* ── ADD ── */
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth("/admin/artisans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addForm,
          experience: Number(addForm.experience),
          productsCount: Number(addForm.productsCount),
          achievements: parseAchievements(addForm.achievements),
          image: addImage,
          imagePosition: addImagePos,
        }),
      });
      setArtisans(prev => [res.data ?? res, ...prev]);
      resetAdd();
      setIsAddOpen(false);
      toast({ title: "✓ Artisan added!" });
    } catch {
      toast({ title: "Failed to add artisan", variant: "destructive" });
    }
  };

  /* ── DELETE ── */
  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this artisan?")) return;
    await fetchWithAuth(`/admin/artisans/${id}`, { method: "DELETE" });
    setArtisans(prev => prev.filter(a => a._id !== id));
    toast({ title: "Artisan deleted." });
  };

  /* ── EDIT ── */
  const openEdit = (artisan: Artisan) => {
    setSelected(artisan);
    setEditForm({
      name: artisan.name,
      craft: artisan.craft,
      specialty: artisan.specialty ?? "",
      location: artisan.location,
      experience: String(artisan.experience),
      description: artisan.description ?? "",
      bio: artisan.bio ?? "",
      productsCount: String(artisan.productsCount ?? 0),
      achievements: (artisan.achievements ?? []).join(", "),
    });
    setEditImage(artisan.image ?? null);
    setEditImagePos(artisan.imagePosition ?? DEFAULT_POS);
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selected) return;
    try {
      const res = await fetchWithAuth(`/admin/artisans/${selected._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          experience: Number(editForm.experience),
          productsCount: Number(editForm.productsCount),
          achievements: parseAchievements(editForm.achievements),
          image: editImage,
          imagePosition: editImagePos,
        }),
      });
      setArtisans(prev => prev.map(a => a._id === (res.data ?? res)._id ? (res.data ?? res) : a));
      setIsEditOpen(false);
      toast({ title: "✓ Artisan updated!" });
    } catch {
      toast({ title: "Failed to update artisan", variant: "destructive" });
    }
  };

  /* ── RENDER ── */
  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F4]">
      <Navbar />
      <AdminNav />

      <main className="flex-1 container mx-auto px-8 py-10">

        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#3d1a11] tracking-tight">
              Artisans
            </h1>
            <p className="text-gray-400 mt-1 text-sm italic">
              Manage artisan profiles · Live data
            </p>
          </div>

          {/* ADD DIALOG */}
          <Dialog open={isAddOpen} onOpenChange={v => { setIsAddOpen(v); if (!v) resetAdd(); }}>
            <DialogTrigger asChild>
              <Button className="bg-[#722F37] hover:bg-[#5c2028] text-white flex gap-2 px-5 rounded-xl shadow-md">
                <Plus size={18} /> Add Artisan
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl w-full max-h-[92vh] overflow-y-auto rounded-3xl p-0 gap-0">
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-8 pt-7 pb-5 border-b border-gray-100">
                <DialogTitle className="text-2xl font-serif font-bold text-[#3d1a11]">
                  Add New Artisan
                </DialogTitle>
                <p className="text-xs text-gray-400 mt-1">Fill in all required fields.</p>
              </div>

              <form onSubmit={handleAdd} className="px-8 py-7 space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <FormField label="Full Name *">
                    <Input value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Meera Devi" className="h-11 rounded-xl border-gray-200" required />
                  </FormField>
                  <FormField label="Craft *">
                    <Input value={addForm.craft} onChange={e => setAddForm(p => ({ ...p, craft: e.target.value }))}
                      placeholder="e.g. Weaving" className="h-11 rounded-xl border-gray-200" required />
                  </FormField>
                  <FormField label="Specialty">
                    <Input value={addForm.specialty} onChange={e => setAddForm(p => ({ ...p, specialty: e.target.value }))}
                      placeholder="e.g. Silk Sarees" className="h-11 rounded-xl border-gray-200" />
                  </FormField>
                  <FormField label="Location *">
                    <Input value={addForm.location} onChange={e => setAddForm(p => ({ ...p, location: e.target.value }))}
                      placeholder="e.g. Banasthali, Rajasthan" className="h-11 rounded-xl border-gray-200" required />
                  </FormField>
                  <FormField label="Experience (years) *">
                    <Input type="number" value={addForm.experience} onChange={e => setAddForm(p => ({ ...p, experience: e.target.value }))}
                      placeholder="e.g. 10" className="h-11 rounded-xl border-gray-200" required />
                  </FormField>
                  <FormField label="Products Count">
                    <Input type="number" value={addForm.productsCount} onChange={e => setAddForm(p => ({ ...p, productsCount: e.target.value }))}
                      placeholder="e.g. 25" className="h-11 rounded-xl border-gray-200" />
                  </FormField>
                </div>

                <FormField label="Photo">
                  <ImagePanel preview={addImage} position={addImagePos}
                    onUpload={setAddImage}
                    onRemove={() => { setAddImage(null); setAddImagePos(DEFAULT_POS); }}
                    onPositionChange={setAddImagePos} heightClass="h-60" />
                </FormField>

                <FormField label="Achievements (comma separated)">
                  <Input value={addForm.achievements} onChange={e => setAddForm(p => ({ ...p, achievements: e.target.value }))}
                    placeholder="e.g. National Award 2020, State Craft Fair Winner"
                    className="h-11 rounded-xl border-gray-200" />
                </FormField>

                <FormField label="Short Description">
                  <Textarea value={addForm.description} onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="A short description shown on the card…"
                    rows={2} className="rounded-xl border-gray-200 resize-none" />
                </FormField>

                <FormField label="Full Bio">
                  <Textarea value={addForm.bio} onChange={e => setAddForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Detailed biography of the artisan…"
                    rows={6} className="rounded-xl border-gray-200 resize-y font-serif text-sm leading-relaxed" />
                </FormField>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button type="button" variant="outline" className="rounded-xl px-6" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-[#722F37] hover:bg-[#5c2028] text-white rounded-xl px-8 shadow-md">
                    Add Artisan
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Artisans" value={artisans.length} sub="registered profiles" icon={<Users size={22} />} />
          <StatCard title="Craft Types" value={totalCrafts || "—"} sub="unique crafts" icon={<Tag size={22} />} />
          <StatCard title="Locations" value={totalLocations || "—"} sub="regions represented" icon={<MapPin size={22} />} />
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {artisans.map(artisan => {
            const pos = artisan.imagePosition ?? DEFAULT_POS;
            return (
              <Card key={artisan._id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 shadow-md rounded-2xl">
                <div className="relative overflow-hidden h-48">
                  {artisan.image ? (
                    <img src={artisan.image} alt={artisan.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      style={{
                        objectPosition: `${pos.x}% ${pos.y}%`,
                        transform: `scale(${pos.scale / 100})`,
                        transformOrigin: `${pos.x}% ${pos.y}%`,
                      }} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#f5e6e0] to-[#e0c4b8] flex items-center justify-center">
                      <ImageIcon size={32} className="text-[#722F37]/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-[#722F37] text-white border-0 text-[10px] tracking-wide">
                    {artisan.craft}
                  </Badge>
                </div>

                <CardContent className="pt-4 pb-5 px-5">
                  <h3 className="font-bold text-[#3d1a11] text-base leading-snug mb-1">{artisan.name}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                    <MapPin size={11} /> {artisan.location}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{artisan.description}</p>
                  <div className="flex justify-between mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Award size={11} /> {artisan.experience} yrs exp</span>
                    <span>{artisan.specialty}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm"
                      className="flex-1 gap-1.5 text-xs bg-[#722F37] hover:bg-[#5c2028] text-white rounded-lg"
                      onClick={() => { setSelected(artisan); setIsViewOpen(true); }}>
                      <Eye size={13} /> View
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs rounded-lg" onClick={() => openEdit(artisan)}>
                      <Edit size={13} />
                    </Button>
                    <Button size="sm" variant="outline"
                      className="gap-1 text-xs rounded-lg text-red-500 border-red-100 hover:bg-red-50"
                      onClick={() => handleDelete(artisan._id)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      {/* VIEW DIALOG */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl w-full max-h-[92vh] p-0 overflow-hidden rounded-3xl gap-0">
          {selected && (() => {
            const pos = selected.imagePosition ?? DEFAULT_POS;
            return (
              <div className="flex flex-col h-full" style={{ maxHeight: "92vh" }}>
                <div className="relative h-72 shrink-0 overflow-hidden">
                  {selected.image ? (
                    <img src={selected.image} alt={selected.name}
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: `${pos.x}% ${pos.y}%`,
                        transform: `scale(${pos.scale / 100})`,
                        transformOrigin: `${pos.x}% ${pos.y}%`,
                      }} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#f5e6e0] to-[#c9856b]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <button onClick={() => setIsViewOpen(false)}
                    className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black/30 backdrop-blur text-white flex items-center justify-center hover:bg-black/55 transition">
                    <X size={16} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 px-9 pb-8">
                    <Badge className="bg-[#722F37] text-white border-0 text-[10px] tracking-widest mb-3">
                      {selected.craft}
                    </Badge>
                    <h2 className="text-white text-3xl font-serif font-bold leading-tight drop-shadow-sm">
                      {selected.name}
                    </h2>
                    <div className="flex gap-5 mt-3 text-white/65 text-xs">
                      <span className="flex items-center gap-1.5"><MapPin size={11} /> {selected.location}</span>
                      <span className="flex items-center gap-1.5"><Award size={11} /> {selected.experience} years experience</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-y-auto flex-1 px-10 py-8 bg-white">
                  {selected.description && (
                    <blockquote className="border-l-4 border-[#722F37] pl-5 mb-7 text-[#722F37] font-serif italic text-lg leading-relaxed">
                      {selected.description}
                    </blockquote>
                  )}
                  {selected.bio && (
                    <div className="text-gray-700 text-sm leading-[1.9] font-serif whitespace-pre-line mb-6">
                      {selected.bio}
                    </div>
                  )}
                  {selected.achievements?.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">Achievements</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.achievements.map((a, i) => (
                          <Badge key={i} variant="outline" className="text-[#722F37] border-[#722F37]/30">{a}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t bg-gray-50 px-10 py-4 flex items-center justify-between shrink-0">
                  <p className="text-xs text-gray-400">{selected.specialty}</p>
                  <div className="flex gap-3">
                    <Button size="sm" variant="outline" className="text-xs gap-1.5 rounded-xl"
                      onClick={() => { setIsViewOpen(false); openEdit(selected); }}>
                      <Edit size={13} /> Edit
                    </Button>
                    <Button size="sm" className="bg-[#722F37] text-white text-xs rounded-xl px-5"
                      onClick={() => setIsViewOpen(false)}>Close</Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={v => { setIsEditOpen(v); if (!v) { setEditImage(null); setEditImagePos(DEFAULT_POS); } }}>
        <DialogContent className="max-w-4xl w-full max-h-[92vh] overflow-y-auto rounded-3xl p-0 gap-0">
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-8 pt-7 pb-5 border-b border-gray-100">
            <DialogTitle className="text-2xl font-serif font-bold text-[#3d1a11]">Edit Artisan</DialogTitle>
            <p className="text-xs text-gray-400 mt-1">Update artisan profile details.</p>
          </div>

          <div className="px-8 py-7 space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <FormField label="Full Name *">
                <Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="h-11 rounded-xl border-gray-200" />
              </FormField>
              <FormField label="Craft *">
                <Input value={editForm.craft} onChange={e => setEditForm(p => ({ ...p, craft: e.target.value }))}
                  className="h-11 rounded-xl border-gray-200" />
              </FormField>
              <FormField label="Specialty">
                <Input value={editForm.specialty} onChange={e => setEditForm(p => ({ ...p, specialty: e.target.value }))}
                  className="h-11 rounded-xl border-gray-200" />
              </FormField>
              <FormField label="Location *">
                <Input value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))}
                  className="h-11 rounded-xl border-gray-200" />
              </FormField>
              <FormField label="Experience (years)">
                <Input type="number" value={editForm.experience} onChange={e => setEditForm(p => ({ ...p, experience: e.target.value }))}
                  className="h-11 rounded-xl border-gray-200" />
              </FormField>
              <FormField label="Products Count">
                <Input type="number" value={editForm.productsCount} onChange={e => setEditForm(p => ({ ...p, productsCount: e.target.value }))}
                  className="h-11 rounded-xl border-gray-200" />
              </FormField>
            </div>

            <FormField label="Photo">
              <ImagePanel preview={editImage} position={editImagePos}
                onUpload={url => setEditImage(url)}
                onRemove={() => { setEditImage(null); setEditImagePos(DEFAULT_POS); }}
                onPositionChange={setEditImagePos} heightClass="h-60" />
            </FormField>

            <FormField label="Achievements (comma separated)">
              <Input value={editForm.achievements} onChange={e => setEditForm(p => ({ ...p, achievements: e.target.value }))}
                className="h-11 rounded-xl border-gray-200" />
            </FormField>

            <FormField label="Short Description">
              <Textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                rows={2} className="rounded-xl border-gray-200 resize-none" />
            </FormField>

            <FormField label="Full Bio">
              <Textarea value={editForm.bio} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                rows={6} className="rounded-xl border-gray-200 resize-y font-serif text-sm leading-relaxed" />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="outline" className="rounded-xl px-6" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button className="bg-[#722F37] hover:bg-[#5c2028] text-white rounded-xl px-8 gap-2 shadow-md" onClick={handleUpdate}>
                <Edit size={14} /> Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

/* ─── Helpers ─── */
const FormField = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <div className="flex items-baseline justify-between">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
    {children}
  </div>
);

const StatCard = ({ title, value, sub, icon }: { title: string; value: string | number; sub: string; icon: React.ReactNode }) => (
  <div className="bg-white px-7 py-6 rounded-2xl flex gap-5 items-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 rounded-xl bg-[#722F37]/10 flex items-center justify-center text-[#722F37] shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">{title}</p>
      <p className="text-3xl font-bold text-[#3d1a11] leading-none mt-0.5">{value}</p>
      <p className="text-[11px] text-gray-400 mt-1">{sub}</p>
    </div>
  </div>
);

export default AdminArtisans;