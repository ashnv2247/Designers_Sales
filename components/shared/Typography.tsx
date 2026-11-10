import React from "react";
import { clsx } from "clsx";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const SerifHeading: React.FC<HeadingProps> = ({
  children,
  as: Tag = "h2",
  className,
  ...props
}) => {
  return (
    <Tag
      className={clsx(
        "font-editorial-serif tracking-tight font-normal text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};

interface LabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const TrackingLabel: React.FC<LabelProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <span
      className={clsx(
        "font-editorial-sans text-[11px] sm:text-[12px] uppercase tracking-[0.22em] text-editorial-caption",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const EditorialLink: React.FC<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { arrow?: boolean }
> = ({ children, className, arrow = true, href = "#", ...props }) => {
  return (
    <a
      href={href}
      className={clsx(
        "inline-flex items-center gap-1.5 font-editorial-sans text-[11px] sm:text-[12px] uppercase tracking-[0.18em] font-medium text-foreground pb-0.5 border-b border-foreground/60 hover:border-foreground hover:opacity-80 transition-all duration-200",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {arrow && <span className="text-[13px] leading-none select-none">↗</span>}
    </a>
  );
};
