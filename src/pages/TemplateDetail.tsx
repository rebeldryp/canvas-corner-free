import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, FileText, Ruler, Sparkles } from "lucide-react";
import { toast } from "sonner";

const TemplateDetail = () => {
  const { id } = useParams();

  const SUPABASE_ENABLED = import.meta.env.VITE_SUPABASE_ENABLED !== "false";
  const SUPABASE_READY = SUPABASE_ENABLED && Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  const { data: template, isLoading, error } = useQuery({
    queryKey: ["template", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: SUPABASE_READY,
  });

  if (!SUPABASE_READY) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 lg:px-8 py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Live data disabled</h1>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleDownload = async (format: string) => {
    if (!template) return;

    try {
      // Log the download
      await supabase.from("download_logs").insert({
        template_id: template.id,
        format: format,
        ip_address: null, // In production, this would come from edge function
      });

      // downloads_count is incremented by DB trigger on insert into download_logs

      toast.success(`Downloading ${template.title} as ${format.toUpperCase()}`);
      
      // In production, this would trigger actual file download
      // For now, we'll just show a success message
      console.log("Download initiated:", { templateId: template.id, format });
    } catch (error) {
      toast.error("Failed to download template");
      console.error("Download error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="aspect-[3/4] bg-muted rounded-2xl" />
              <div className="space-y-4">
                <div className="h-12 bg-muted rounded" />
                <div className="h-24 bg-muted rounded" />
                <div className="h-48 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 lg:px-8 py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Failed to load template</h1>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 lg:px-8 py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Template Not Found</h1>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Templates
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Preview Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <img
                src={template.preview_url}
                alt={template.title}
                className="w-full h-auto object-contain"
              />
            </Card>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Download className="h-4 w-4" />
              <span>{(template.downloads_count ?? 0).toLocaleString()} downloads</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-8">
            <div>
              <Badge variant="secondary" className="mb-3">
                {template.category?.name || "Uncategorized"}
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                {template.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {template.description || "Professional print-ready template for your projects."}
              </p>
            </div>

            <Separator />

            {/* Specifications */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                Specifications
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {template.width_mm && template.height_mm && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Dimensions</div>
                    <div className="font-medium">
                      {template.width_mm} × {template.height_mm} mm
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Resolution</div>
                  <div className="font-medium">{template.dpi} DPI</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Bleed</div>
                  <div className="font-medium">{template.has_bleed ? "Included" : "Not included"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Formats</div>
                  <div className="font-medium">{(template.file_formats ?? []).length} available</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Download Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Download className="h-5 w-5 text-accent" />
                Download Options
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {(template.file_formats ?? []).map((format) => (
                  <Button
                    key={format}
                    onClick={() => handleDownload(format)}
                    variant="outline"
                    size="lg"
                    className="justify-start h-auto py-4"
                  >
                    <div className="text-left">
                      <div className="font-semibold uppercase">{format}</div>
                      <div className="text-xs text-muted-foreground">
                        {format === "pdf" && "Vector, print-ready"}
                        {format === "svg" && "Scalable vector"}
                        {format === "png" && "Raster, transparent"}
                        {format === "jpg" && "Raster, optimized"}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Tags */}
            {template.tags && template.tags.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* License Info */}
            <Card className="p-6 bg-muted/50 border-accent/20">
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-semibold">Free License</h3>
                  <p className="text-sm text-muted-foreground">
                    This template is free for personal and commercial use. No attribution required.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateDetail;
