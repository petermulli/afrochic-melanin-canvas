import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type CurrencyCode = "KES" | "USD" | "EUR" | "GBP" | "TZS" | "UGX";

interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const currencies: Record<CurrencyCode, CurrencyInfo> = {
  KES: { code: "KES", symbol: "KES", name: "Kenyan Shilling" },
  USD: { code: "USD", symbol: "$", name: "US Dollar" },
  EUR: { code: "EUR", symbol: "€", name: "Euro" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound" },
  TZS: { code: "TZS", symbol: "TZS", name: "Tanzanian Shilling" },
  UGX: { code: "UGX", symbol: "UGX", name: "Ugandan Shilling" },
};

// Fallback rates (KES as base currency)
const fallbackRates: Record<CurrencyCode, number> = {
  KES: 1,
  USD: 0.0065,
  EUR: 0.006,
  GBP: 0.0052,
  TZS: 17.5,
  UGX: 24.5,
};

// Country to currency mapping
const countryToCurrency: Record<string, CurrencyCode> = {
  KE: "KES",
  US: "USD",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  PT: "EUR",
  IE: "EUR",
  FI: "EUR",
  GR: "EUR",
  TZ: "TZS",
  UG: "UGX",
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  convertPrice: (priceInKES: number) => number;
  formatPrice: (priceInKES: number) => string;
  isLoading: boolean;
  currencyInfo: CurrencyInfo;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>("KES");
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(fallbackRates);
  const [isLoading, setIsLoading] = useState(true);

  // Detect user's country and set currency
  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Check if user has a saved preference
        const savedCurrency = localStorage.getItem("preferred-currency") as CurrencyCode;
        if (savedCurrency && currencies[savedCurrency]) {
          setCurrencyState(savedCurrency);
          return;
        }

        // Use free IP geolocation API
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          const countryCode = data.country_code;
          const detectedCurrency = countryToCurrency[countryCode] || "USD";
          setCurrencyState(detectedCurrency);
        }
      } catch (error) {
        console.log("Location detection failed, using default currency");
      }
    };

    detectLocation();
  }, []);

  // Fetch live exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      try {
        // Using free exchangerate-api
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/KES");
        if (response.ok) {
          const data = await response.json();
          const newRates: Record<CurrencyCode, number> = {
            KES: 1,
            USD: data.rates.USD || fallbackRates.USD,
            EUR: data.rates.EUR || fallbackRates.EUR,
            GBP: data.rates.GBP || fallbackRates.GBP,
            TZS: data.rates.TZS || fallbackRates.TZS,
            UGX: data.rates.UGX || fallbackRates.UGX,
          };
          setRates(newRates);
        }
      } catch (error) {
        console.log("Failed to fetch exchange rates, using fallback rates");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
    // Refresh rates every hour
    const interval = setInterval(fetchRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("preferred-currency", newCurrency);
  }, []);

  const convertPrice = useCallback(
    (priceInKES: number): number => {
      const rate = rates[currency];
      return priceInKES * rate;
    },
    [currency, rates]
  );

  const formatPrice = useCallback(
    (priceInKES: number): string => {
      const converted = convertPrice(priceInKES);
      const info = currencies[currency];
      
      // Format based on currency
      if (currency === "KES" || currency === "TZS" || currency === "UGX") {
        return `${info.symbol} ${Math.round(converted).toLocaleString()}`;
      }
      
      return `${info.symbol}${converted.toFixed(2)}`;
    },
    [currency, convertPrice]
  );

  const currencyInfo = currencies[currency];

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertPrice,
        formatPrice,
        isLoading,
        currencyInfo,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
};
