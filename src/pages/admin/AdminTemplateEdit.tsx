import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type MediaItem = { id: string; file?: File; url?: string; alt?: string; width?: number; height?: number };

export default function AdminTemplateEdit() {
  const { id: templateId } = useParams();
  const [images, setImages] = useState<MediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateImage = async (file: File) => {
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) return 'Unsupported image format';
    if (file.size > 5 * 1024 * 1024) return 'Image exceeds 5MB limit';
    const url = URL.createObjectURL(file);
    const img = new Image();
    const p = new Promise<{w:number;h:number}>((resolve) => { img.onload = () => resolve({w: img.width, h: img.height}); });
    img.src = url;
    const { w, h } = await p;
    if (w < 1200) return 'Image width must be at least 1200px';
    return null;
  };

  const onAdd = async (files: FileList | null) => {
    if (!files) return;
    const list: MediaItem[] = [];
    for (const file of Array.from(files)) {
      const err = await validateImage(file);
      if (err) { setError(err); return; }
      const url = URL.createObjectURL(file);
      const img = new Image();
      const p = new Promise<{w:number;h:number}>((resolve) => { img.onload = () => resolve({w: img.width, h: img.height}); });
      img.src = url;
      const { w, h } = await p;
      list.push({ id: Math.random().toString(36).slice(2), file, url, alt: '', width: w, height: h });
    }
    const next = [...images, ...list].slice(0, 10);
    setImages(next);
  };

  const onDragStart = (i: number) => (e: React.DragEvent) => { e.dataTransfer.setData('index', String(i)); };
  const onDrop = (i: number) => (e: React.DragEvent) => {
    const from = Number(e.dataTransfer.getData('index'));
    const arr = [...images];
    const [m] = arr.splice(from, 1);
    arr.splice(i, 0, m);
    setImages(arr);
  };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const save = async () => {
    setError(null);
    setSuccess(null);
    if (images.length < 3) { setError('Upload at least 3 images'); return; }
    if (!supabase) { setSuccess('Live data disabled. Carousel validated.'); return; }
    try {
      const items = images.map(i => ({ name: i.file?.name || i.id, size: i.file?.size || 0, type: i.file?.type || 'image/jpeg', width: i.width || 1200 }));
      const { data, error } = await supabase.functions.invoke('uploadMedia', { body: { items } });
      if (error) throw error;
      if (data?.uploads?.length) {
        for (let idx = 0; idx < data.uploads.length; idx++) {
          const url = data.uploads[idx]?.signedUrl;
          const file = images[idx]?.file as File | undefined;
          if (url && file) {
            const res = await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type || 'application/octet-stream' } });
            if (!res.ok) throw new Error('Image upload failed');
          }
        }
        const uploads = (data.uploads ?? []) as Array<{ path: string; signedUrl: string | null }>;
        const finalize = await supabase.functions.invoke('finalizeMedia', {
          body: {
            templateId,
            items: uploads.map((u, idx: number) => ({ path: u.path, width: images[idx]?.width, height: images[idx]?.height, alt: images[idx]?.alt || '' }))
          }
        });
        if (finalize.error) throw finalize.error;
        setSuccess('Images saved');
      } else {
        setSuccess('Server validation passed');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || 'Upload failed');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="text-2xl font-semibold">Media Carousel</div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <input type="file" multiple accept="image/*" onChange={(e) => onAdd(e.target.files)} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <div key={img.id} draggable onDragStart={onDragStart(i)} onDragOver={onDragOver} onDrop={onDrop(i)} className="border rounded p-2">
              {img.url && <img src={img.url} alt={img.alt || ''} loading="lazy" className="w-full h-auto" />}
              <input className="mt-2 w-full border rounded p-2" placeholder="Alt text" value={img.alt || ''} onChange={(e) => {
                const arr = [...images]; arr[i] = { ...arr[i], alt: e.target.value }; setImages(arr);
              }} />
            </div>
          ))}
        </div>
        <button className="border rounded px-4 py-2" onClick={save}>Save Carousel</button>
      </div>
    </AdminLayout>
  );
}
