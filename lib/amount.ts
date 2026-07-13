const MAX_DECIMALS = 2;

/**
 * Normalizes free-form amount text into a raw value string with at most
 * two decimal places, e.g. "₦ 1,000.559" → "1000.55".
 */
const sanitizeAmountInput = (input: string): string => {
  let raw = input;
  // Some Android keyboards emit a comma for the decimal-separator key.
  // A comma only ever appears at the end while typing (thousands commas
  // come from our own formatting and are never trailing), so treat a
  // trailing comma as a decimal point.
  if (raw.endsWith(",")) {
    raw = `${raw.slice(0, -1)}.`;
  }
  const cleaned = raw.replace(/[^0-9.]/g, "");

  if (!cleaned) {
    return "";
  }

  const hasTrailingDot = cleaned.endsWith(".");
  const [integerPartRaw = "", ...fractionParts] = cleaned.split(".");
  let integerPart = integerPartRaw.replace(/^0+(?=\d)/, "");

  if (integerPart === "" && integerPartRaw !== "") {
    integerPart = "0";
  }

  let fractionPart = fractionParts.join("");
  if (fractionPart.length > MAX_DECIMALS) {
    fractionPart = fractionPart.slice(0, MAX_DECIMALS);
  }

  if (!integerPart && !fractionPart && !hasTrailingDot) {
    return "";
  }

  let normalized = integerPart;

  if (!normalized && (fractionPart || hasTrailingDot)) {
    normalized = "0";
  }

  if (fractionPart) {
    normalized = `${normalized}.${fractionPart}`;
  } else if (hasTrailingDot) {
    normalized = `${normalized}.`;
  }

  return normalized;
};

// Guards against values beyond what NGN amounts ever need.
const MAX_CENTS_DIGITS = 12;

/**
 * Cash-register style input: treats the digit stream as kobo so decimals
 * fill in without typing a separator, e.g. "12345" → "123.45" and a
 * single "5" → "0.05".
 */
const sanitizeCentsInput = (input: string): string => {
  const digits = input
    .replace(/\D/g, "")
    .replace(/^0+/, "")
    .slice(0, MAX_CENTS_DIGITS);
  if (!digits) {
    return "";
  }
  const padded = digits.padStart(MAX_DECIMALS + 1, "0");
  return `${padded.slice(0, -MAX_DECIMALS)}.${padded.slice(-MAX_DECIMALS)}`;
};

type FormatAmountOptions = {
  forceFixedDecimals?: boolean;
  currencySymbol?: string;
};

/**
 * Formats a raw value string for display, e.g. "1000.5" → "₦ 1,000.5"
 * (or "₦ 1,000.50" with forceFixedDecimals).
 */
const formatAmountValue = (
  rawValue: string,
  {
    forceFixedDecimals = false,
    currencySymbol = "₦",
  }: FormatAmountOptions = {},
): string => {
  if (!rawValue) {
    return "";
  }

  const hasTrailingDot =
    !forceFixedDecimals && rawValue.endsWith(".") && !rawValue.includes("..");
  const [integerPartRaw = "", decimalPartRaw = ""] = rawValue.split(".");
  const integerPartForParsing =
    integerPartRaw && integerPartRaw !== "." ? integerPartRaw : "0";

  const integerNumber = Number(integerPartForParsing);
  const formattedInteger = integerNumber.toLocaleString("en-NG");

  const currencyPrefix = currencySymbol.endsWith(" ")
    ? currencySymbol
    : `${currencySymbol} `;

  if (hasTrailingDot && !decimalPartRaw) {
    return `${currencyPrefix}${formattedInteger}.`;
  }

  if (decimalPartRaw) {
    const limitedDecimals = decimalPartRaw.slice(0, MAX_DECIMALS);
    const decimals = forceFixedDecimals
      ? limitedDecimals.padEnd(MAX_DECIMALS, "0")
      : limitedDecimals;
    return `${currencyPrefix}${formattedInteger}.${decimals}`;
  }

  if (forceFixedDecimals) {
    return `${currencyPrefix}${formattedInteger}.00`;
  }

  return `${currencyPrefix}${formattedInteger}`;
};

export { formatAmountValue, sanitizeAmountInput, sanitizeCentsInput };
export type { FormatAmountOptions };
