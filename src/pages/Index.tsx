import { Header } from "@/components/Header";
import { TemplateCard } from "@/components/TemplateCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, FileText, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ["templates", activeCategory],
    queryFn: async () => {
      let query = supabase
        .from("templates")
        .select(`
          *,
          category:categories(name)
        `)
        .eq("is_published", true)
        .order("downloads_count", { ascending: false });

      if (activeCategory && categories) {
        const category = categories.find((c) => c.slug === activeCategory);
        if (category) {
          query = query.eq("category_id", category.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-background to-background" />
        <div className="container mx-auto px-4 lg:px-8 py-24 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent border border-accent/20">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Free Download Templates</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
                Print-Ready
                <span className="block text-accent">Frame Templates</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg">
                Professional canvas and photo frame templates. Download in PDF, SVG, PNG, or JPG.
                No sign-up required.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="group">
                  Browse Templates
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Start Downloading
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4 border-t">
                <div>
                  <div className="text-3xl font-bold text-foreground">{templates?.length || 0}+</div>
                  <div className="text-sm text-muted-foreground">Templates</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">4</div>
                  <div className="text-sm text-muted-foreground">File Formats</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">∞</div>
                  <div className="text-sm text-muted-foreground">Free Downloads</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-transparent rounded-3xl blur-3xl" />
              <img
                src={heroImage}
                alt="Template showcase"
                className="relative rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 border-y bg-card/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Download className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">Instant Downloads</h3>
              <p className="text-sm text-muted-foreground">
                No sign-up required. Download templates in multiple formats instantly.
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">Print-Ready Files</h3>
              <p className="text-sm text-muted-foreground">
                300 DPI resolution with optional bleed marks for professional printing.
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">Multiple Formats</h3>
              <p className="text-sm text-muted-foreground">
                Choose from PDF, SVG, PNG, or JPG to suit your workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Browse Templates</h2>
                <p className="text-muted-foreground">
                  Filter by category to find exactly what you need
                </p>
              </div>
            </div>

            {categories && (
              <CategoryFilter
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            )}

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : templates && templates.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    id={template.id}
                    title={template.title}
                    category={template.category?.name || "Uncategorized"}
                    previewUrl={template.preview_url}
                    downloads={template.downloads_count}
                    formats={template.file_formats}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No templates found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-accent text-accent-foreground">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Download professional frame templates for free. No credit card, no sign-up.
          </p>
          <Button size="lg" variant="secondary">
            Browse All Templates
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 FrameCanvas. All templates are free to download and use.
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                License
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
