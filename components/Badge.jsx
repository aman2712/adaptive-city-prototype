const variantClasses = {
  accent: "badge badge-accent",
  success: "badge badge-success",
  warning: "badge badge-warning",
  danger: "badge badge-danger",
  info: "badge badge-info",
  regulatory: "badge badge-regulatory",
  neutral: "badge",
};

export default function Badge({ label, variant = "neutral" }) {
  return <span className={variantClasses[variant] || variantClasses.neutral}>{label}</span>;
}
