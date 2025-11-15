import { Header } from "@/components/Header";
import { TemplateCard } from "@/components/TemplateCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";

const Templates = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "recent" | "title">("popular");

  const SUPABASE_ENABLED = import.meta.env.VITE_SUPABASE_ENABLED !== "false";
  const SUPABASE_READY = SUPABASE_ENABLED && Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  const fallbackCategories = !SUPABASE_READY
    ? [
        { id: "general", name: "General", slug: "general" },
        { id: "canvas", name: "Canvas", slug: "canvas" },
        { id: "photo", name: "Photo", slug: "photo" },
      ]
    : null;
  type Category = { id: string; name: string; slug: string };
  const { data: categories, error: categoriesError, refetch: refetchCategories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: SUPABASE_READY,
  });

  type TemplateRow = { id: string; title: string; description?: string | null; tags?: string[] | null; downloads_count: number; created_at: string; preview_url: string; file_formats?: string[] | null; category?: { name: string } };
  const { data: templates, isLoading, error: templatesError, refetch: refetchTemplates } = useQuery<TemplateRow[]>({
    queryKey: ["templates", activeCategory],
    queryFn: async () => {
      let query = supabase
        .from("templates")
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq("is_published", true);

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
    enabled: SUPABASE_READY,
  });

  // Client-side filtering and sorting
  const filteredAndSortedTemplates = useMemo(() => {
    if (!templates) return [];

    let filtered = templates;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.title.toLowerCase().includes(query) ||
          template.description?.toLowerCase().includes(query) ||
          template.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.downloads_count - a.downloads_count;
        case "recent":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [templates, searchQuery, sortBy]);

  useEffect(() => {
    if (categoriesError || templatesError) {
      toast.error("Failed to load templates");
    }
  }, [categoriesError, templatesError]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Template Library</h1>
              <p className="text-muted-foreground text-lg">
                Browse our collection of {templates?.length || 0} professional templates
              </p>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search templates, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={(value: "popular" | "recent" | "title") => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="title">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            {(categories || fallbackCategories) && (
              <CategoryFilter
                categories={(categories ?? fallbackCategories ?? [])}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            )}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          {(!SUPABASE_READY) || categoriesError || templatesError ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold mb-2">{!SUPABASE_READY ? "Live data disabled" : "Failed to load templates"}</h3>
              <p className="text-muted-foreground mb-6">{!SUPABASE_READY ? "Enable Supabase in .env to load live templates." : "Please check your connection and try again."}</p>
              <Button
                variant="outline"
                onClick={() => {
                  refetchCategories();
                  refetchTemplates();
                }}
              >
                Retry
              </Button>
              <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[
                  { id: "demo-1", title: "A4 Frame", category: { name: "General" }, preview_url: "https://picsum.photos/600/800", downloads_count: 0, file_formats: ["pdf","png","jpg","svg"] },
                  { id: "demo-2", title: "Square Canvas", category: { name: "General" }, preview_url: "https://picsum.photos/600/800?2", downloads_count: 0, file_formats: ["pdf","png"] },
                  { id: "demo-3", title: "Poster 18×24", category: { name: "General" }, preview_url: "https://picsum.photos/600/800?3", downloads_count: 0, file_formats: ["pdf","jpg"] },
                  { id: "demo-4", title: "Photo 5×7", category: { name: "General" }, preview_url: "https://picsum.photos/600/800?4", downloads_count: 0, file_formats: ["png","jpg"] },
                ].map((template) => (
                  <TemplateCard
                    key={template.id}
                    id={template.id}
                    title={template.title}
                    category={template.category?.name || "Uncategorized"}
                    previewUrl={template.preview_url}
                    downloads={template.downloads_count ?? 0}
                    formats={template.file_formats ?? []}
                  />
                ))}
              </div>
            </div>
          ) : isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredAndSortedTemplates.length > 0 ? (
            <>
              <div className="mb-6 text-sm text-muted-foreground">
                Showing {filteredAndSortedTemplates.length} template
                {filteredAndSortedTemplates.length !== 1 ? "s" : ""}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    id={template.id}
                    title={template.title}
                    category={template.category?.name || "Uncategorized"}
                    previewUrl={template.preview_url}
                    downloads={template.downloads_count ?? 0}
                    formats={template.file_formats ?? []}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different search term.`
                  : "No templates available in this category."}
              </p>
              {(searchQuery || activeCategory) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory(null);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-card/50">
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

export default Templates;
