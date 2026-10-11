import { BusinessType, Currency } from "@/types/business";
import { MembershipRole } from "@/types/user";

export const BUSINESS_TYPE_OPTIONS = [
  { label: "Cafe", value: BusinessType.CAFE },
  { label: "Restaurant", value: BusinessType.RESTAURANT },
  { label: "Bakery", value: BusinessType.BAKERY },
  { label: "Bar", value: BusinessType.BAR },
  { label: "Food Truck", value: BusinessType.FOOD_TRUCK },
  { label: "Catering", value: BusinessType.CATERING },
];

export const CURRENCIES = [
  { value: Currency.USD, name: "US Dollar", symbol: "$" },
  { value: Currency.EUR, name: "Euro", symbol: "€" },
  { value: Currency.GBP, name: "British Pound", symbol: "£" },
  { value: Currency.CAD, name: "Canadian Dollar", symbol: "CA$" },
  { value: Currency.AUD, name: "Australian Dollar", symbol: "A$" },
  { value: Currency.NZD, name: "New Zealand Dollar", symbol: "NZ$" },
  { value: Currency.JPY, name: "Japanese Yen", symbol: "¥" },
  { value: Currency.SGD, name: "Singapore Dollar", symbol: "S$" },
  { value: Currency.PHP, name: "Philippine Peso", symbol: "₱" },
  { value: Currency.INR, name: "Indian Rupee", symbol: "₹" },
  { value: Currency.MXN, name: "Mexican Peso", symbol: "MX$" },
] as const;

export const CURRENCY_OPTIONS = CURRENCIES.map((currency) => ({
  label: `${currency.value} — ${currency.name}`,
  value: currency.value,
}));

export const INVITE_CODE_ROLE_OPTIONS = [
  { label: "Joins as Manager", value: MembershipRole.MANAGER },
  { label: "Joins as Staff", value: MembershipRole.STAFF },
];
