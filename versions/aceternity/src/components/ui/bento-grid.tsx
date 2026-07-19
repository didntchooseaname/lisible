import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:auto-rows-[14rem] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  href,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
}) => {
  const content = (
    <>
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-1">
        {icon}
        <div className="mt-2 mb-2 font-bold text-foreground">{title}</div>
        <div className="text-sm font-normal leading-relaxed text-muted-foreground">
          {description}
        </div>
      </div>
    </>
  );

  const itemClass = cn(
    "group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-lg border border-border bg-card p-5 transition-colors duration-200 hover:border-accent",
    className,
  );

  if (href) {
    return (
      <a href={href} className={itemClass}>
        {content}
      </a>
    );
  }

  return <div className={itemClass}>{content}</div>;
};
