import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Download } from "lucide-react";
import { Link } from "react-router-dom";

interface TemplateCardProps {
  id: string;
  title: string;
  category: string;
  previewUrl: string;
  downloads: number;
  formats: string[];
}

export const TemplateCard = ({
  id,
  title,
  category,
  previewUrl,
  downloads,
  formats,
}: TemplateCardProps) => {
  return (
    <Link to={`/template/${id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-[var(--shadow-hover)] cursor-pointer">
        <div className="aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={previewUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-medium text-foreground leading-tight group-hover:text-accent transition-colors">
              {title}
            </h3>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {category}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex gap-1">
              {formats.slice(0, 3).map((format) => (
                <span key={format} className="uppercase font-medium">
                  {format}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              <span>{downloads.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
