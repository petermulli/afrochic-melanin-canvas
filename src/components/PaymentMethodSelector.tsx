import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentMethodSelectorProps {
  value: "card" | "mpesa";
  onValueChange: (value: "card" | "mpesa") => void;
}

// Card type detection
const detectCardType = (number: string): string | null => {
  const cleaned = number.replace(/\s/g, "");
  if (/^4/.test(cleaned)) return "visa";
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return "mastercard";
  if (/^3[47]/.test(cleaned)) return "amex";
  if (/^6(?:011|5)/.test(cleaned)) return "discover";
  return null;
};

// Format card number with spaces
const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(" ").substr(0, 19) : "";
};

// Format expiry date
const formatExpiry = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length >= 2) {
    return cleaned.substr(0, 2) + "/" + cleaned.substr(2, 2);
  }
  return cleaned;
};

const PaymentMethodSelector = ({ value, onValueChange }: PaymentMethodSelectorProps) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardType, setCardType] = useState<string | null>(null);
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    setCardType(detectCardType(cardNumber));
  }, [cardNumber]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setExpiry(formatted);
  };

  return (
    <div className="space-y-6">
      <RadioGroup
        value={value}
        onValueChange={(val) => onValueChange(val as "card" | "mpesa")}
        className="space-y-4"
      >
        {/* Card Option */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`relative flex items-center space-x-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
            value === "card"
              ? "border-primary bg-primary/5 shadow-soft"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => onValueChange("card")}
        >
          <RadioGroupItem value="card" id="card" className="sr-only" />
          <div className="flex items-center gap-3 flex-1">
            {/* Card Icons */}
            <div className="flex items-center gap-2">
              <svg className="h-8 w-auto" viewBox="0 0 48 32" fill="none">
                <rect width="48" height="32" rx="4" fill="#1A1F71"/>
                <path d="M19.5 21.5L21.5 10.5H24.5L22.5 21.5H19.5Z" fill="white"/>
                <path d="M32 10.7C31.3 10.4 30.2 10.1 28.8 10.1C25.6 10.1 23.4 11.7 23.4 14C23.4 15.7 24.9 16.6 26.1 17.2C27.3 17.8 27.7 18.2 27.7 18.7C27.7 19.5 26.7 19.9 25.8 19.9C24.5 19.9 23.8 19.7 22.7 19.2L22.3 19L21.9 22C22.8 22.4 24.4 22.8 26 22.8C29.4 22.8 31.5 21.2 31.5 18.7C31.5 17.4 30.7 16.4 28.9 15.5C27.8 14.9 27.1 14.6 27.1 14C27.1 13.5 27.7 12.9 29 12.9C30.1 12.9 30.9 13.1 31.5 13.4L31.8 13.5L32.2 10.8L32 10.7Z" fill="white"/>
                <path d="M36.5 10.5H34.2C33.5 10.5 32.9 10.7 32.6 11.5L28 21.5H31.4L32 19.7H36.1L36.5 21.5H39.5L36.9 10.5H36.5ZM33 17.3C33.3 16.5 34.5 13.3 34.5 13.3C34.5 13.3 34.8 12.5 35 12L35.2 13.2C35.2 13.2 35.9 16.3 36.1 17.3H33Z" fill="white"/>
                <path d="M17 10.5L13.8 18L13.5 16.5C12.9 14.6 11.2 12.6 9.3 11.5L12.2 21.5H15.6L20.4 10.5H17Z" fill="white"/>
                <path d="M11.5 10.5H6.1L6 10.8C10 11.8 12.6 14.3 13.5 17L12.5 11.5C12.3 10.7 11.8 10.5 11.5 10.5Z" fill="#F9A533"/>
              </svg>
              <svg className="h-8 w-auto" viewBox="0 0 48 32" fill="none">
                <rect width="48" height="32" rx="4" fill="#000"/>
                <circle cx="19" cy="16" r="8" fill="#EB001B"/>
                <circle cx="29" cy="16" r="8" fill="#F79E1B"/>
                <path d="M24 10.5C25.9 12 27.1 14.4 27.1 17C27.1 19.6 25.9 22 24 23.5C22.1 22 20.9 19.6 20.9 17C20.9 14.4 22.1 12 24 10.5Z" fill="#FF5F00"/>
              </svg>
              <svg className="h-8 w-auto" viewBox="0 0 48 32" fill="none">
                <rect width="48" height="32" rx="4" fill="#006FCF"/>
                <path d="M24 25C18.5 25 14 20.5 14 15C14 9.5 18.5 5 24 5C29.5 5 34 9.5 34 15C34 20.5 29.5 25 24 25ZM17 15L21 11V13H26V11L30 15L26 19V17H21V19L17 15Z" fill="white"/>
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-medium text-foreground">Credit / Debit Card</span>
              <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
            </div>
          </div>
          {value === "card" && (
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </motion.div>

        {/* M-PESA Option */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`relative flex items-center space-x-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
            value === "mpesa"
              ? "border-primary bg-primary/5 shadow-soft"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => onValueChange("mpesa")}
        >
          <RadioGroupItem value="mpesa" id="mpesa" className="sr-only" />
          <div className="flex items-center gap-3 flex-1">
            {/* M-PESA Icon */}
            <div className="h-10 w-16 bg-[#4CAF50] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">M-PESA</span>
            </div>
            <div className="flex-1">
              <span className="font-medium text-foreground">M-PESA</span>
              <p className="text-sm text-muted-foreground">Pay via Safaricom M-PESA</p>
            </div>
          </div>
          {value === "mpesa" && (
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </motion.div>
      </RadioGroup>

      {/* Card Details Form */}
      <AnimatePresence mode="wait">
        {value === "card" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-sm font-medium">Card Number</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="pl-4 pr-16 h-12 text-lg tracking-wider font-mono rounded-xl"
                    required
                  />
                  {/* Real-time card type indicator */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AnimatePresence mode="wait">
                      {cardType && (
                        <motion.div
                          key={cardType}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          className="flex items-center"
                        >
                          {cardType === "visa" && (
                            <svg className="h-8 w-auto" viewBox="0 0 48 32" fill="none">
                              <rect width="48" height="32" rx="4" fill="#1A1F71"/>
                              <path d="M19.5 21.5L21.5 10.5H24.5L22.5 21.5H19.5Z" fill="white"/>
                              <path d="M32 10.7C31.3 10.4 30.2 10.1 28.8 10.1C25.6 10.1 23.4 11.7 23.4 14C23.4 15.7 24.9 16.6 26.1 17.2C27.3 17.8 27.7 18.2 27.7 18.7C27.7 19.5 26.7 19.9 25.8 19.9C24.5 19.9 23.8 19.7 22.7 19.2L22.3 19L21.9 22C22.8 22.4 24.4 22.8 26 22.8C29.4 22.8 31.5 21.2 31.5 18.7C31.5 17.4 30.7 16.4 28.9 15.5C27.8 14.9 27.1 14.6 27.1 14C27.1 13.5 27.7 12.9 29 12.9C30.1 12.9 30.9 13.1 31.5 13.4L31.8 13.5L32.2 10.8L32 10.7Z" fill="white"/>
                              <path d="M36.5 10.5H34.2C33.5 10.5 32.9 10.7 32.6 11.5L28 21.5H31.4L32 19.7H36.1L36.5 21.5H39.5L36.9 10.5H36.5ZM33 17.3C33.3 16.5 34.5 13.3 34.5 13.3C34.5 13.3 34.8 12.5 35 12L35.2 13.2C35.2 13.2 35.9 16.3 36.1 17.3H33Z" fill="white"/>
                              <path d="M17 10.5L13.8 18L13.5 16.5C12.9 14.6 11.2 12.6 9.3 11.5L12.2 21.5H15.6L20.4 10.5H17Z" fill="white"/>
                              <path d="M11.5 10.5H6.1L6 10.8C10 11.8 12.6 14.3 13.5 17L12.5 11.5C12.3 10.7 11.8 10.5 11.5 10.5Z" fill="#F9A533"/>
                            </svg>
                          )}
                          {cardType === "mastercard" && (
                            <svg className="h-8 w-auto" viewBox="0 0 48 32" fill="none">
                              <rect width="48" height="32" rx="4" fill="#000"/>
                              <circle cx="19" cy="16" r="8" fill="#EB001B"/>
                              <circle cx="29" cy="16" r="8" fill="#F79E1B"/>
                              <path d="M24 10.5C25.9 12 27.1 14.4 27.1 17C27.1 19.6 25.9 22 24 23.5C22.1 22 20.9 19.6 20.9 17C20.9 14.4 22.1 12 24 10.5Z" fill="#FF5F00"/>
                            </svg>
                          )}
                          {cardType === "amex" && (
                            <svg className="h-8 w-auto" viewBox="0 0 48 32" fill="none">
                              <rect width="48" height="32" rx="4" fill="#006FCF"/>
                              <text x="24" y="20" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">AMEX</text>
                            </svg>
                          )}
                          {cardType === "discover" && (
                            <svg className="h-8 w-auto" viewBox="0 0 48 32" fill="none">
                              <rect width="48" height="32" rx="4" fill="#FF6000"/>
                              <text x="24" y="20" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">DISCOVER</text>
                            </svg>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry" className="text-sm font-medium">Expiry Date</Label>
                  <Input
                    id="expiry"
                    name="expiry"
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="h-12 text-lg font-mono rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-sm font-medium">CVV</Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").substr(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    type="password"
                    className="h-12 text-lg font-mono rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {value === "mpesa" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label htmlFor="mpesaPhone" className="text-sm font-medium">M-PESA Phone Number</Label>
                <Input
                  id="mpesaPhone"
                  name="mpesaPhone"
                  type="tel"
                  placeholder="+254 7XX XXX XXX"
                  className="h-12 text-lg rounded-xl"
                  required
                />
              </div>
              <div className="flex items-start gap-3 p-4 bg-[#4CAF50]/10 rounded-xl">
                <div className="w-8 h-8 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  You will receive an STK push notification on your phone. Enter your M-PESA PIN to complete the payment.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accepted Payment Methods Footer */}
      <div className="pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground mb-3">Accepted Payment Methods</p>
        <div className="flex items-center gap-3 flex-wrap">
          <svg className="h-6 w-auto opacity-60" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#1A1F71"/>
            <path d="M19.5 21.5L21.5 10.5H24.5L22.5 21.5H19.5Z" fill="white"/>
            <path d="M32 10.7C31.3 10.4 30.2 10.1 28.8 10.1C25.6 10.1 23.4 11.7 23.4 14C23.4 15.7 24.9 16.6 26.1 17.2C27.3 17.8 27.7 18.2 27.7 18.7C27.7 19.5 26.7 19.9 25.8 19.9C24.5 19.9 23.8 19.7 22.7 19.2L22.3 19L21.9 22C22.8 22.4 24.4 22.8 26 22.8C29.4 22.8 31.5 21.2 31.5 18.7C31.5 17.4 30.7 16.4 28.9 15.5C27.8 14.9 27.1 14.6 27.1 14C27.1 13.5 27.7 12.9 29 12.9C30.1 12.9 30.9 13.1 31.5 13.4L31.8 13.5L32.2 10.8L32 10.7Z" fill="white"/>
            <path d="M36.5 10.5H34.2C33.5 10.5 32.9 10.7 32.6 11.5L28 21.5H31.4L32 19.7H36.1L36.5 21.5H39.5L36.9 10.5H36.5Z" fill="white"/>
            <path d="M17 10.5L13.8 18L13.5 16.5C12.9 14.6 11.2 12.6 9.3 11.5L12.2 21.5H15.6L20.4 10.5H17Z" fill="white"/>
            <path d="M11.5 10.5H6.1L6 10.8C10 11.8 12.6 14.3 13.5 17L12.5 11.5C12.3 10.7 11.8 10.5 11.5 10.5Z" fill="#F9A533"/>
          </svg>
          <svg className="h-6 w-auto opacity-60" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#000"/>
            <circle cx="19" cy="16" r="8" fill="#EB001B"/>
            <circle cx="29" cy="16" r="8" fill="#F79E1B"/>
            <path d="M24 10.5C25.9 12 27.1 14.4 27.1 17C27.1 19.6 25.9 22 24 23.5C22.1 22 20.9 19.6 20.9 17C20.9 14.4 22.1 12 24 10.5Z" fill="#FF5F00"/>
          </svg>
          <svg className="h-6 w-auto opacity-60" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#006FCF"/>
            <text x="24" y="20" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">AMEX</text>
          </svg>
          <div className="h-6 px-2 bg-[#4CAF50] rounded flex items-center justify-center opacity-80">
            <span className="text-white font-bold text-[8px]">M-PESA</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs text-muted-foreground">Secure checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
