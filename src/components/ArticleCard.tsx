import { Calendar } from "lucide-react";

interface ArticleCardProps {
  title: string;
  excerpt: string;
  image: string;
  category: string;
  categoryColor: string;
  date: string;
  readTime: string;
}

const ArticleCard = ({ title, excerpt, image, category, categoryColor, date, readTime }: ArticleCardProps) => {
  return (
    <article className="group bg-card rounded-xl overflow-hidden border border-border hover-lift hover-glow cursor-pointer">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span
          className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full text-primary-foreground"
          style={{ backgroundColor: categoryColor }}
        >
          {category}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>{date}</span>
          <span className="text-border">•</span>
          <span>{readTime}</span>
        </div>
        <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground font-content line-clamp-2">
          {excerpt}
        </p>
      </div>
    </article>
  );
};

export default ArticleCard;
