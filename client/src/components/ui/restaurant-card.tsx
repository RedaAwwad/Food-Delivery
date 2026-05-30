import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80";

const cardVariants = cva(
  "group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
  {
    variants: {
      variant: {
        default: "",
        featured: "md:flex-row",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface RestaurantCardProps extends VariantProps<typeof cardVariants> {
  className?: string;
  tag: string;
  date: string;
  title: string;
  description: string;
  imageUrl?: string;
  rating?: number;
  onSelect?: () => void;
  readMoreText?: string;
}

const cardHover: Variants = {
  hover: { y: -5, transition: { duration: 0.2 } },
};

function MetaRow({ tag, date }: { tag: string; date: string }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase text-muted-foreground">
      <span className="rounded-full bg-orange-500/10 px-3 py-1 text-orange-600 dark:text-orange-400">
        {tag}
      </span>
      <span>{date}</span>
    </div>
  );
}

export const RestaurantCard = React.forwardRef<HTMLDivElement, RestaurantCardProps>(
  (
    {
      className,
      variant = "default",
      tag,
      date,
      title,
      description,
      imageUrl,
      rating,
      onSelect,
      readMoreText = "View menu & order",
    },
    ref
  ) => {
    const img = imageUrl || DEFAULT_IMG;

    const body = (
      <div className="flex flex-1 flex-col justify-between p-5 md:p-8">
        <div>
          <MetaRow tag={tag} date={date} />
          <h3 className="mb-2 text-lg font-bold leading-tight md:text-xl lg:text-2xl">
            <span className="bg-gradient-to-r from-orange-500 to-orange-500 bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_2px]">
              {title}
            </span>
          </h3>
          <p className="line-clamp-3 text-sm text-muted-foreground">{description}</p>
          {rating != null && rating > 0 && variant === "default" ? (
            <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-amber-600">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
            </p>
          ) : null}
        </div>
        {variant === "featured" && (
          <div className="mt-6">
            <Button
              type="button"
              className="group/button bg-gradient-to-r from-orange-500 to-orange-600"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.();
              }}
            >
              {readMoreText}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
            </Button>
          </div>
        )}
      </div>
    );

    return (
      <motion.div
        ref={ref}
        role="button"
        tabIndex={0}
        variants={cardHover}
        whileHover="hover"
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect?.();
          }
        }}
        className={cn(cardVariants({ variant, className }))}
      >
        {variant === "featured" ? (
          <>
            <div className="relative min-h-[220px] w-full overflow-hidden md:w-1/2 lg:w-3/5">
              <img
                src={img}
                alt={title}
                className="h-full min-h-[220px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {rating != null && rating > 0 ? (
                <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-xs font-bold text-white">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  {rating.toFixed(1)}
                </span>
              ) : null}
            </div>
            {body}
          </>
        ) : (
          <>
            <div className="relative h-44 overflow-hidden">
              <img
                src={img}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            {body}
          </>
        )}
      </motion.div>
    );
  }
);

RestaurantCard.displayName = "RestaurantCard";
