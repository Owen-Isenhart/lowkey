import React from "react";

type Variant = "primary" | "ghost" | "outline";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: "6px 14px",  fontSize: "0.75rem",   borderRadius: "var(--radius-sm)" },
  md: { padding: "10px 20px", fontSize: "0.8125rem", borderRadius: "var(--radius-md)" },
  lg: { padding: "14px 28px", fontSize: "0.9375rem", borderRadius: "var(--radius-md)" },
};

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "var(--accent)",
    color: "#0c0c0e",
    border: "1px solid transparent",
  },
  outline: {
    background: "transparent",
    color: "var(--accent)",
    border: "1px solid var(--accent-dim)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid transparent",
  },
};

export default function Button({
  variant = "primary",
  size = "md",
  children,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        fontWeight: 500,
        letterSpacing: "-0.01em",
        cursor: "pointer",
        transition: `opacity var(--duration-fast) var(--ease-out),
                     background var(--duration-fast) var(--ease-out)`,
        fontFamily: "inherit",
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.opacity = "0.8";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
}
