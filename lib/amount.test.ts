import {
  formatAmountValue,
  sanitizeAmountInput,
  sanitizeCentsInput,
} from "./amount";

describe("sanitizeAmountInput", () => {
  it("keeps up to two decimal places", () => {
    expect(sanitizeAmountInput("100.55")).toBe("100.55");
    expect(sanitizeAmountInput("100.5")).toBe("100.5");
  });

  it("truncates beyond two decimal places", () => {
    expect(sanitizeAmountInput("100.559")).toBe("100.55");
  });

  it("keeps a trailing decimal point while typing", () => {
    expect(sanitizeAmountInput("100.")).toBe("100.");
  });

  it("treats a trailing comma as a decimal point (Android decimal key)", () => {
    expect(sanitizeAmountInput("₦ 100,")).toBe("100.");
  });

  it("strips currency symbols and thousands separators", () => {
    expect(sanitizeAmountInput("₦ 1,000.55")).toBe("1000.55");
  });

  it("normalizes leading zeros and bare dots", () => {
    expect(sanitizeAmountInput("007")).toBe("7");
    expect(sanitizeAmountInput(".5")).toBe("0.5");
    expect(sanitizeAmountInput("")).toBe("");
  });
});

describe("sanitizeCentsInput", () => {
  it("fills decimals from the right without a separator key", () => {
    expect(sanitizeCentsInput("5")).toBe("0.05");
    expect(sanitizeCentsInput("50")).toBe("0.50");
    expect(sanitizeCentsInput("500")).toBe("5.00");
    expect(sanitizeCentsInput("12345")).toBe("123.45");
  });

  it("ignores formatting characters from the display text", () => {
    expect(sanitizeCentsInput("₦ 1,234.56")).toBe("1234.56");
  });

  it("drops leading zeros and handles empty input", () => {
    expect(sanitizeCentsInput("000")).toBe("");
    expect(sanitizeCentsInput("")).toBe("");
  });

  it("caps the digit stream length", () => {
    expect(sanitizeCentsInput("9".repeat(20))).toBe("9999999999.99");
  });
});

describe("cents typing pipeline (display -> keystroke -> sanitize)", () => {
  const display = (value: string) =>
    value ? formatAmountValue(value, { forceFixedDecimals: true }) : "";

  const type = (keys: string[]) => {
    let value = "";
    for (const key of keys) {
      value = sanitizeCentsInput(display(value) + key);
    }
    return value;
  };

  it("builds 123.45 digit by digit", () => {
    expect(type(["1", "2", "3", "4", "5"])).toBe("123.45");
  });

  it("handles backspace by dropping the last digit", () => {
    const afterTyping = type(["1", "2", "3"]); // 1.23
    const text = display(afterTyping); // "₦ 1.23"
    expect(sanitizeCentsInput(text.slice(0, -1))).toBe("0.12");
  });
});

describe("formatAmountValue", () => {
  it("formats with thousands separators", () => {
    expect(formatAmountValue("1000.55")).toBe("₦ 1,000.55");
  });

  it("keeps a trailing dot while typing", () => {
    expect(formatAmountValue("100.")).toBe("₦ 100.");
  });

  it("pads to two decimals when forced (blur)", () => {
    expect(formatAmountValue("100.5", { forceFixedDecimals: true })).toBe(
      "₦ 100.50",
    );
    expect(formatAmountValue("100", { forceFixedDecimals: true })).toBe(
      "₦ 100.00",
    );
  });
});

describe("typing pipeline (display -> keystroke -> sanitize)", () => {
  const focusedDisplay = (value: string) =>
    value ? formatAmountValue(value) : "";

  const type = (keys: string[]) => {
    let value = "0";
    for (const key of keys) {
      value = sanitizeAmountInput(focusedDisplay(value) + key);
    }
    return value;
  };

  it("supports entering 100.55 digit by digit", () => {
    expect(type(["1", "0", "0", ".", "5", "5"])).toBe("100.55");
  });

  it("supports comma as the decimal key", () => {
    expect(type(["2", "5", ",", "7", "5"])).toBe("25.75");
  });

  it("ignores decimals past the second place", () => {
    expect(type(["1", ".", "2", "5", "9"])).toBe("1.25");
  });
});
