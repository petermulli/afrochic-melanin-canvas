import { Shield, CheckCircle } from "lucide-react";

interface OfficialStoreBadgeProps {
  variant?: "default" | "compact";
}

const OfficialStoreBadge = ({ variant = "default" }: OfficialStoreBadgeProps) => {
  if (variant === "compact") {
    return (
      <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
        <CheckCircle className="h-3 w-3" />
        <span>Official Store</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary px-4 py-2 rounded-full">
      <Shield className="h-4 w-4" />
      <span className="text-sm font-medium uppercase tracking-wider">Official Store</span>
      <CheckCircle className="h-4 w-4 fill-primary text-primary-foreground" />
    </div>
  );
};

export default OfficialStoreBadge;
