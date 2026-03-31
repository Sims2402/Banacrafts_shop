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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea";

import {
  Plus, Edit, Trash2, Eye, ImageIcon, X,
  BookOpen, Clock, Tag, Calendar, AlignLeft,
  ZoomIn, MoveHorizontal,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";

/* ─── Types ─── */
interface ImagePosition { x: number; y: number; scale: number; }

interface AwarenessArticle {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  imagePosition?: ImagePosition;
  category: string;
  readTime: number;
  createdAt: string;
}

/* ─── Helpers ─── */
const DEFAULT_POS: ImagePosition = { x: 50, y: 50, scale: 100 };

const wordCount = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length;

const calcReadTime = (text: string) =>
  Math.max(1, Math.ceil(wordCount(text) / 200));

/* ══════════════════════════════════════════════
   IMAGE PANEL  — single upload + live crop/zoom
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
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="bg-white/90 hover:bg-white text-[#3d1a11] text-xs font-semibold px-4 py-2 rounded-full shadow-lg transition"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="bg-red-500/90 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg transition"
              >
                Remove
              </button>
            </div>
          </div>

          {/* Adjustment sliders */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
              Adjust Image Frame
            </p>
            <SliderRow
              label="Horizontal"
              icon={<MoveHorizontal size={13} />}
              value={position.x} min={0} max={100}
              onChange={v => onPositionChange({ ...position, x: v })}
            />
            <SliderRow
              label="Vertical"
              icon={<MoveHorizontal size={13} className="rotate-90" />}
              value={position.y} min={0} max={100}
              onChange={v => onPositionChange({ ...position, y: v })}
            />
            <SliderRow
              label="Zoom"
              icon={<ZoomIn size={13} />}
              value={position.scale} min={100} max={200}
              onChange={v => onPositionChange({ ...position, scale: v })}
              suffix="%"
            />
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
          <p className="text-sm font-semibold text-[#3d1a11]">Upload Featured Image</p>
          <p className="text-xs text-gray-400 mt-1">Click to browse · JPG, PNG, WEBP</p>
        </div>
      )}
      <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={handleFile} />
    </div>
  );
};

const SliderRow = ({
  label, icon, value, min, max, onChange, suffix = "",
}: {
  label: string; icon: React.ReactNode;
  value: number; min: number; max: number;
  onChange: (v: number) => void; suffix?: string;
}) => (
  <div className="flex items-center gap-3">
    <span className="text-gray-400 w-4 shrink-0">{icon}</span>
    <span className="text-xs text-gray-500 w-16 shrink-0">{label}</span>
    <Slider
      value={[value]} min={min} max={max} step={1}
      onValueChange={([v]) => onChange(v)}
      className="flex-1"
    />
    <span className="text-xs text-gray-400 w-10 text-right shrink-0">
      {value}{suffix}
    </span>
  </div>
);

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
const AdminAwareness = () => {
  const [articles, setArticles] = useState<AwarenessArticle[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<AwarenessArticle | null>(null);

  /* Add form */
  const [addImage, setAddImage] = useState<string | null>(null);
  const [addImagePos, setAddImagePos] = useState<ImagePosition>(DEFAULT_POS);
  const [addForm, setAddForm] = useState({ title: "", category: "", excerpt: "", content: "" });

  /* Edit form */
  const [editImage, setEditImage] = useState<string | null>(null);
  const [editImagePos, setEditImagePos] = useState<ImagePosition>(DEFAULT_POS);
  const [editForm, setEditForm] = useState({ title: "", category: "", excerpt: "", content: "" });

  const { toast } = useToast();

  /* ── Real computed stats ── */
  const liveCount = articles.length;
  const avgReadTime = liveCount
    ? Math.round(articles.reduce((s, a) => s + a.readTime, 0) / liveCount)
    : 0;
  const uniqueCategories = new Set(
    articles.map(a => a.category?.trim().toLowerCase()).filter(Boolean)
  ).size;

  /* ── Data ── */
  const loadArticles = async () => {
    try {
      const data = await fetchWithAuth("/admin/awareness");
      setArticles(data);
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to load articles", variant: "destructive" });
    }
  };

  useEffect(() => { loadArticles(); }, []);

  const resetAdd = () => {
    setAddForm({ title: "", category: "", excerpt: "", content: "" });
    setAddImage(null);
    setAddImagePos(DEFAULT_POS);
  };

  /* ── CRUD ── */
  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    const newArticle = await fetchWithAuth("/admin/awareness", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...addForm,
        image: addImage,
        imagePosition: addImagePos,
        readTime: calcReadTime(addForm.content),
      }),
    });
    setArticles(prev => [newArticle, ...prev]);
    resetAdd();
    setIsAddOpen(false);
    toast({ title: "✓ Article published!" });
  };

  const deleteArticle = async (id: string) => {
    if (!confirm("Permanently delete this article?")) return;
    await fetchWithAuth(`/admin/awareness/${id}`, { method: "DELETE" });
    setArticles(prev => prev.filter(a => a._id !== id));
    toast({ title: "Article deleted." });
  };

  const handleViewArticle = (article: AwarenessArticle) => {
    setSelectedArticle(article);
    setIsViewOpen(true);
  };

  const openEdit = (article: AwarenessArticle) => {
    setSelectedArticle(article);
    setEditForm({
      title: article.title,
      category: article.category,
      excerpt: article.excerpt,
      content: article.content,
    });
    setEditImage(article.image || null);
    setEditImagePos(article.imagePosition ?? DEFAULT_POS);
    setIsEditOpen(true);
  };

  const updateArticle = async () => {
    if (!selectedArticle) return;
    const updated = await fetchWithAuth(`/admin/awareness/${selectedArticle._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        image: editImage,
        imagePosition: editImagePos,
        readTime: calcReadTime(editForm.content),
      }),
    });
    setArticles(prev => prev.map(a => a._id === updated._id ? updated : a));
    setIsEditOpen(false);
    toast({ title: "✓ Article saved!" });
  };

  /* ── Render ── */
  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F4]">
      <Navbar />
      <AdminNav />

      <main className="flex-1 container mx-auto px-8 py-10">

        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#3d1a11] tracking-tight">
              Awareness Hub
            </h1>
            <p className="text-gray-400 mt-1 text-sm italic">
              Educational articles · Live data
            </p>
          </div>

          {/* ── ADD DIALOG ── */}
          <Dialog open={isAddOpen} onOpenChange={v => { setIsAddOpen(v); if (!v) resetAdd(); }}>
            <DialogTrigger asChild>
              <Button className="bg-[#722F37] hover:bg-[#5c2028] text-white flex gap-2 px-5 rounded-xl shadow-md">
                <Plus size={18} /> New Article
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl w-full max-h-[92vh] overflow-y-auto rounded-3xl p-0 gap-0">
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-8 pt-7 pb-5 border-b border-gray-100">
                <DialogTitle className="text-2xl font-serif font-bold text-[#3d1a11]">
                  Create New Article
                </DialogTitle>
                <p className="text-xs text-gray-400 mt-1">
                  Fill in all fields and upload an image before publishing.
                </p>
              </div>

              <form onSubmit={handleAddArticle} className="px-8 py-7 space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <FormField label="Title">
                    <Input
                      value={addForm.title}
                      onChange={e => setAddForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Understanding Anxiety"
                      className="h-11 rounded-xl border-gray-200"
                      required
                    />
                  </FormField>
                  <FormField label="Category">
                    <Input
                      value={addForm.category}
                      onChange={e => setAddForm(p => ({ ...p, category: e.target.value }))}
                      placeholder="e.g. Mental Health"
                      className="h-11 rounded-xl border-gray-200"
                      required
                    />
                  </FormField>
                </div>

                <FormField label="Featured Image">
                  <ImagePanel
                    preview={addImage}
                    position={addImagePos}
                    onUpload={setAddImage}
                    onRemove={() => { setAddImage(null); setAddImagePos(DEFAULT_POS); }}
                    onPositionChange={setAddImagePos}
                    heightClass="h-60"
                  />
                </FormField>

                <FormField label="Excerpt">
                  <Textarea
                    value={addForm.excerpt}
                    onChange={e => setAddForm(p => ({ ...p, excerpt: e.target.value }))}
                    placeholder="A short, compelling summary shown on the card…"
                    rows={2}
                    className="rounded-xl border-gray-200 resize-none"
                    required
                  />
                </FormField>

                <FormField
                  label="Content"
                  hint={`${wordCount(addForm.content)} words · ~${calcReadTime(addForm.content)} min read`}
                >
                  <Textarea
                    value={addForm.content}
                    onChange={e => setAddForm(p => ({ ...p, content: e.target.value }))}
                    placeholder="Write the full article here…"
                    rows={11}
                    className="rounded-xl border-gray-200 resize-y font-serif text-sm leading-relaxed"
                    required
                  />
                </FormField>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button type="button" variant="outline" className="rounded-xl px-6" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#722F37] hover:bg-[#5c2028] text-white rounded-xl px-8 shadow-md">
                    Publish Article
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats — all real */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <StatCard
            title="Live Articles"
            value={liveCount}
            sub="published & active"
            icon={<BookOpen size={22} />}
          />
          <StatCard
            title="Avg Read Time"
            value={avgReadTime ? `~${avgReadTime} min` : "—"}
            sub="across all articles"
            icon={<Clock size={22} />}
          />
          <StatCard
            title="Knowledge Areas"
            value={uniqueCategories || "—"}
            sub="unique categories"
            icon={<Tag size={22} />}
          />
        </div>

        {/* Articles grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {articles.map(article => {
            const pos = article.imagePosition ?? DEFAULT_POS;
            return (
              <Card key={article._id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 shadow-md rounded-2xl">
                <div className="relative overflow-hidden h-48">
                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      style={{
                        objectPosition: `${pos.x}% ${pos.y}%`,
                        transform: `scale(${pos.scale / 100})`,
                        transformOrigin: `${pos.x}% ${pos.y}%`,
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#f5e6e0] to-[#e0c4b8] flex items-center justify-center">
                      <ImageIcon size={32} className="text-[#722F37]/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-[#722F37] text-white border-0 text-[10px] tracking-wide">
                    {article.category}
                  </Badge>
                </div>

                <CardContent className="pt-4 pb-5 px-5">
                  <h3 className="font-bold text-[#3d1a11] text-base leading-snug mb-1 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                  <div className="flex justify-between mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(article.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {article.readTime} min read
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5 text-xs bg-[#722F37] hover:bg-[#5c2028] text-white rounded-lg"
                      onClick={() => handleViewArticle(article)}
                    >
                      <Eye size={13} /> Read
                    </Button>
                    <Button
                      size="sm" variant="outline"
                      className="gap-1 text-xs rounded-lg"
                      onClick={() => openEdit(article)}
                    >
                      <Edit size={13} />
                    </Button>
                    <Button
                      size="sm" variant="outline"
                      className="gap-1 text-xs rounded-lg text-red-500 border-red-100 hover:bg-red-50"
                      onClick={() => deleteArticle(article._id)}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      {/* ════════════════════════════════════
          VIEW DIALOG
      ════════════════════════════════════ */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl w-full max-h-[92vh] p-0 overflow-hidden rounded-3xl gap-0">
          {selectedArticle && (() => {
            const pos = selectedArticle.imagePosition ?? DEFAULT_POS;
            return (
              <div className="flex flex-col h-full" style={{ maxHeight: "92vh" }}>
                {/* Hero */}
                <div className="relative h-72 shrink-0 overflow-hidden">
                  {selectedArticle.image ? (
                    <img
                      src={selectedArticle.image}
                      alt={selectedArticle.title}
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: `${pos.x}% ${pos.y}%`,
                        transform: `scale(${pos.scale / 100})`,
                        transformOrigin: `${pos.x}% ${pos.y}%`,
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#f5e6e0] to-[#c9856b]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  <button
                    onClick={() => setIsViewOpen(false)}
                    className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black/30 backdrop-blur text-white flex items-center justify-center hover:bg-black/55 transition"
                  >
                    <X size={16} />
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 px-9 pb-8">
                    <Badge className="bg-[#722F37] text-white border-0 text-[10px] tracking-widest mb-3">
                      {selectedArticle.category}
                    </Badge>
                    <h2 className="text-white text-3xl font-serif font-bold leading-tight drop-shadow-sm">
                      {selectedArticle.title}
                    </h2>
                    <div className="flex gap-5 mt-3 text-white/65 text-xs">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={11} />
                        {new Date(selectedArticle.createdAt).toLocaleDateString("en-US", {
                          weekday: "short", year: "numeric", month: "long", day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={11} /> {selectedArticle.readTime} min read
                      </span>
                      <span className="flex items-center gap-1.5">
                        <AlignLeft size={11} />
                        {wordCount(selectedArticle.content).toLocaleString()} words
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-10 py-8 bg-white">
                  <blockquote className="border-l-4 border-[#722F37] pl-5 mb-7 text-[#722F37] font-serif italic text-lg leading-relaxed">
                    {selectedArticle.excerpt}
                  </blockquote>
                  <div className="text-gray-700 text-sm leading-[1.9] font-serif whitespace-pre-line">
                    {selectedArticle.content}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t bg-gray-50 px-10 py-4 flex items-center justify-between shrink-0">
                  <p className="text-xs text-gray-400">
                    Published {new Date(selectedArticle.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      size="sm" variant="outline"
                      className="text-xs gap-1.5 rounded-xl"
                      onClick={() => { setIsViewOpen(false); openEdit(selectedArticle); }}
                    >
                      <Edit size={13} /> Edit Article
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#722F37] text-white text-xs rounded-xl px-5"
                      onClick={() => setIsViewOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════
          EDIT DIALOG
      ════════════════════════════════════ */}
      <Dialog
        open={isEditOpen}
        onOpenChange={v => {
          setIsEditOpen(v);
          if (!v) { setEditImage(null); setEditImagePos(DEFAULT_POS); }
        }}
      >
        <DialogContent className="max-w-4xl w-full max-h-[92vh] overflow-y-auto rounded-3xl p-0 gap-0">
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-8 pt-7 pb-5 border-b border-gray-100">
            <DialogTitle className="text-2xl font-serif font-bold text-[#3d1a11]">
              Edit Article
            </DialogTitle>
            <p className="text-xs text-gray-400 mt-1">
              Read time recalculates automatically on save.
            </p>
          </div>

          <div className="px-8 py-7 space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <FormField label="Title">
                <Input
                  value={editForm.title}
                  onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                  className="h-11 rounded-xl border-gray-200"
                />
              </FormField>
              <FormField label="Category">
                <Input
                  value={editForm.category}
                  onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                  className="h-11 rounded-xl border-gray-200"
                />
              </FormField>
            </div>

            <FormField label="Featured Image">
              <ImagePanel
                preview={editImage}
                position={editImagePos}
                onUpload={url => setEditImage(url)}
                onRemove={() => { setEditImage(null); setEditImagePos(DEFAULT_POS); }}
                onPositionChange={setEditImagePos}
                heightClass="h-60"
              />
            </FormField>

            <FormField label="Excerpt">
              <Textarea
                value={editForm.excerpt}
                onChange={e => setEditForm(p => ({ ...p, excerpt: e.target.value }))}
                rows={2}
                className="rounded-xl border-gray-200 resize-none"
              />
            </FormField>

            <FormField
              label="Content"
              hint={`${wordCount(editForm.content)} words · ~${calcReadTime(editForm.content)} min read`}
            >
              <Textarea
                value={editForm.content}
                onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))}
                rows={12}
                className="rounded-xl border-gray-200 resize-y font-serif text-sm leading-relaxed"
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="outline" className="rounded-xl px-6" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-[#722F37] hover:bg-[#5c2028] text-white rounded-xl px-8 gap-2 shadow-md"
                onClick={updateArticle}
              >
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

/* ─── Form Field wrapper ─── */
const FormField = ({
  label, hint, children,
}: {
  label: string; hint?: string; children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-baseline justify-between">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
    {children}
  </div>
);

/* ─── Stat Card ─── */
const StatCard = ({
  title, value, sub, icon,
}: {
  title: string; value: string | number; sub: string; icon: React.ReactNode;
}) => (
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

export default AdminAwareness;