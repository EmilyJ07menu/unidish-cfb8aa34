import { ChefHat } from "lucide-react";

export function RecipeImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-muted text-muted-foreground ${className ?? ""}`}
      >
        <ChefHat className="size-10" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      width={800}
      height={600}
      loading="lazy"
      className={className}
    />
  );
}
