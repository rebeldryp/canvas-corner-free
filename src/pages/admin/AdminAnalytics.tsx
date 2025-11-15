import AdminLayout from "./AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer } from "@/components/ui/chart";

export default function AdminAnalytics() {
  type DownloadLog = { created_at: string; format: string; template_id: string };
  const { data, error, isLoading } = useQuery<DownloadLog[]>({
    queryKey: ['download-analytics'],
    queryFn: async () => {
      if (!supabase) return [] as DownloadLog[];
      const { data, error } = await supabase
        .from('download_logs')
        .select('created_at, format, template_id')
        .order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: Boolean(supabase)
  });

  const totalDownloads = data?.length ?? 0;
  const uniqueTemplates = new Set((data ?? []).map(d => d.template_id)).size;
  const formats = (data ?? []).reduce<Record<string, number>>((acc, d) => {
    acc[d.format] = (acc[d.format] ?? 0) + 1;
    return acc;
  }, {});
  const isEmpty = !isLoading && totalDownloads === 0;

  const series = isEmpty
    ? Array.from({ length: 24 }, (_, i) => ({ index: i, value: (i % 3 === 0 ? 2 : 1) }))
    : Array.from({ length: Math.min((data?.length ?? 0), 100) }, (_, i) => ({ index: i, value: 1 }));

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="text-2xl font-semibold">Analytics</div>
        {error && (
          <div className="border rounded p-4 bg-destructive/10 text-destructive text-sm">
            Failed to load analytics. Ensure Supabase is enabled and reachable.
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="border rounded p-4">
            <div className="text-sm text-muted-foreground">Total downloads</div>
            <div className="text-2xl font-semibold">{totalDownloads}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-muted-foreground">Unique templates</div>
            <div className="text-2xl font-semibold">{uniqueTemplates}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-muted-foreground">Formats tracked</div>
            <div className="text-2xl font-semibold">{Object.keys(formats).length}</div>
          </div>
        </div>
        {isEmpty && (
          <div className="border rounded p-4 bg-card/60">
            <div className="text-sm text-muted-foreground">
              No analytics yet. Downloads will appear here once users export or download templates.
            </div>
          </div>
        )}
        <div className="border rounded p-4">
          <ChartContainer config={{ downloads: { label: 'Downloads', color: 'hsl(var(--accent))' } }} className="h-64">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {series.map((s) => (
                <rect key={s.index} x={s.index} y={100 - (s.value * 10)} width={1} height={s.value * 10} fill="currentColor" />
              ))}
            </svg>
          </ChartContainer>
        </div>
        {!isEmpty && (
          <div className="border rounded p-4">
            <div className="font-medium mb-2">Formats breakdown</div>
            <div className="text-sm grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(formats).map(([fmt, count]) => (
                <div key={fmt} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{fmt}</span>
                  <span className="font-mono">{count}</span>
                </div>
              ))}
              {Object.keys(formats).length === 0 && (
                <div className="text-muted-foreground">No format data yet</div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
