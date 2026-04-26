import { useEffect, useState } from "react";
import { Image as ImageIcon, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Photo = {
  id: string;
  uploader_name: string;
  phone: string | null;
  caption: string | null;
  storage_path: string;
  status: string;
  created_at: string;
};

const PhotosTab = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<(Photo & { url: string | null })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("photo_uploads").select("*").order("created_at", { ascending: false });
    if (data) {
      const withUrls = await Promise.all((data as Photo[]).map(async (p) => {
        const { data: publicData } = supabase.storage.from("community-photos").getPublicUrl(p.storage_path);
        return { ...p, url: publicData.publicUrl };
      }));
      setRows(withUrls);
    }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("photo_uploads").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (error) toast({ title: "Update failed", variant: "destructive" });
    else { toast({ title: `Photo ${status}` }); fetch(); }
  };

  const remove = async (id: string, path: string) => {
    await supabase.storage.from("community-photos").remove([path]);
    const { error } = await supabase.from("photo_uploads").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", variant: "destructive" });
    else { toast({ title: "Photo deleted" }); fetch(); }
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">Loading…</p>;
  if (rows.length === 0) return <p className="text-center text-muted-foreground py-8">No photo uploads yet.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {rows.map((p) => (
        <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden">
          {p.url ? (
            <img src={p.url} alt={p.caption || "Upload"} className="w-full h-40 object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-40 bg-muted flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          <div className="p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">{p.uploader_name}</p>
                {p.phone && <p className="text-xs text-muted-foreground">{p.phone}</p>}
              </div>
              <Badge variant="outline" className="shrink-0 text-xs">{p.status}</Badge>
            </div>
            {p.caption && <p className="text-xs text-muted-foreground line-clamp-2">{p.caption}</p>}
            <div className="flex gap-1.5">
              {p.status === "pending" && (
                <>
                  <Button size="sm" onClick={() => update(p.id, "approved")} className="flex-1 h-8 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => update(p.id, "rejected")} className="flex-1 h-8 text-xs">
                    <XCircle className="w-3 h-3 mr-1" />Reject
                  </Button>
                </>
              )}
              <Button size="sm" variant="ghost" onClick={() => remove(p.id, p.storage_path)} className="h-8 px-2">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhotosTab;
