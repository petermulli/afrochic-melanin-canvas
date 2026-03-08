import { useCurrency, currencies, CurrencyCode } from "@/contexts/CurrencyContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

const CurrencySelector = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <Select value={currency} onValueChange={(value) => setCurrency(value as CurrencyCode)}>
      <SelectTrigger className="w-auto gap-2 border-none bg-transparent hover:bg-muted/50 transition-colors h-9 px-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {Object.values(currencies).map((curr) => (
          <SelectItem key={curr.code} value={curr.code}>
            <span className="font-medium">{curr.code}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CurrencySelector;
