"use client";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";

import React, { useState } from "react";


interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
    active?: boolean;
  }[];
  className?: string;
  ariaLabel?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 60) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div className={cn("sticky inset-x-0 top-0 z-40 w-full", className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(0, 0, 0, 0.18), 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(115, 115, 115, 0.12)"
          : "none",
        width: visible ? "72%" : "100%",
        y: visible ? 12 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      style={{
        minWidth: "820px",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-6xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-1.5 lg:flex",
        visible && "bg-background/85",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({
  items,
  className,
  ariaLabel,
  onItemClick,
}: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.nav
      aria-label={ariaLabel}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-1 text-sm font-medium lg:flex",
        className,
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "relative inline-flex min-h-11 items-center px-4 text-muted-foreground transition-colors hover:text-foreground",
            item.active &&
              "text-foreground after:absolute after:inset-x-4 after:bottom-2 after:h-0.5 after:rounded-full after:bg-accent",
          )}
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <motion.span
              layoutId="hovered"
              className="absolute inset-x-0 inset-y-1.5 rounded-full bg-secondary"
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </a>
      ))}
    </motion.nav>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(0, 0, 0, 0.18), 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(115, 115, 115, 0.12)"
          : "none",
        width: visible ? "92%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: visible ? "12px" : "2rem",
        y: visible ? 12 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-1.5 lg:hidden",
        visible && "bg-background/85",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-2 rounded-lg border border-border bg-popover px-4 py-6 shadow-lg",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
  openLabel,
  closeLabel,
}: {
  isOpen: boolean;
  onClick: () => void;
  openLabel: string;
  closeLabel: string;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label={isOpen ? closeLabel : openLabel}
      className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {isOpen ? (
        <X className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Menu className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
};

export const NavbarLogo = ({
  href,
  title,
}: {
  href: string;
  title: string;
}) => {
  return (
    <a
      href={href}
      data-preview-site-title
      className="relative z-20 mr-4 inline-flex min-h-11 items-center px-2 text-lg font-bold tracking-tight text-foreground transition-colors hover:text-accent"
    >
      {title}
    </a>
  );
};
