import { Link } from "react-router-dom";

interface ArticleCardProps {
  title: string;
  excerpt: string;
  image: string;
  category: string;
  categoryColor?: string;
  date: string;
  readTime?: string;
  slug?: string;
}

const ArticleCard = ({
  title,
  excerpt,
  image,
  category,
  date,
  readTime,
  slug,
}: ArticleCardProps) => {
  const inner = (
    <div className="group border border-border bg-card overflow-hidden brutalist-hover cursor-pointer h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-[0.15em] bg-primary text-primary-foreground px-2 py-1">
          {category}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-xl leading-tight text-card-foreground mb-2">
          {title}
        </h3>
        <p className="font-body text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {excerpt}
        </p>
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          <span>{date}</span>
          {readTime && <span>{readTime}</span>}
        </div>
      </div>
    </div>
  );

  return slug ? <Link to={`/article/${slug}`}>{inner}</Link> : inner;
};

export default ArticleCard;
