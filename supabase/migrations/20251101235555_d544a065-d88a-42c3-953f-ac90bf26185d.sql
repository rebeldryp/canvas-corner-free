-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create templates table
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  preview_url TEXT NOT NULL,
  source_file_url TEXT NOT NULL,
  width_mm DECIMAL,
  height_mm DECIMAL,
  dpi INTEGER DEFAULT 300,
  has_bleed BOOLEAN DEFAULT false,
  file_formats TEXT[] DEFAULT ARRAY['pdf', 'svg', 'png', 'jpg'],
  downloads_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create download logs table for analytics and rate limiting
CREATE TABLE public.download_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  format TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read)
CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT
USING (true);

-- Templates policies (public read for published)
CREATE POLICY "Published templates are viewable by everyone"
ON public.templates FOR SELECT
USING (is_published = true);

-- Download logs policies (allow inserts for tracking)
CREATE POLICY "Anyone can log downloads"
ON public.download_logs FOR INSERT
WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for templates
CREATE TRIGGER update_templates_updated_at
BEFORE UPDATE ON public.templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample categories
INSERT INTO public.categories (name, slug, description) VALUES
  ('Canvas Prints', 'canvas-prints', 'High-quality canvas templates for wall art'),
  ('Photo Frames', 'photo-frames', 'Classic and modern frame templates'),
  ('Gallery Walls', 'gallery-walls', 'Multi-frame layout templates'),
  ('Fine Art', 'fine-art', 'Museum-quality print templates');