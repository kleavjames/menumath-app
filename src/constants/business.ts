import { Currency } from "@/types/business";

import { BusinessType } from "@/types/business";
import { MembershipRole } from "@/types/user";

export const BUSINESS_TYPE_OPTIONS = [
  { label: "Cafe", value: BusinessType.CAFE },
  { label: "Restaurant", value: BusinessType.RESTAURANT },
  { label: "Bakery", value: BusinessType.BAKERY },
  { label: "Bar", value: BusinessType.BAR },
  { label: "Food Truck", value: BusinessType.FOOD_TRUCK },
  { label: "Catering", value: BusinessType.CATERING },
];

export const CURRENCY_OPTIONS = [
  { label: "USD — US Dollar", value: Currency.USD },
  { label: "EUR — Euro", value: Currency.EUR },
  { label: "GBP — British Pound", value: Currency.GBP },
  { label: "CAD — Canadian Dollar", value: Currency.CAD },
  { label: "AUD — Australian Dollar", value: Currency.AUD },
  { label: "PHP — Philippine Peso", value: Currency.PHP },
  { label: "INR — Indian Rupee", value: Currency.INR },
  { label: "MXN — Mexican Peso", value: Currency.MXN },
  { label: "NZD — New Zealand Dollar", value: Currency.NZD },
  { label: "SGD — Singapore Dollar", value: Currency.SGD },
  { label: "JPY — Japanese Yen", value: Currency.JPY },
];

export const INVITE_CODE_ROLE_OPTIONS = [
  { label: "Joins as Manager", value: MembershipRole.MANAGER },
  { label: "Joins as Staff", value: MembershipRole.STAFF },
];
