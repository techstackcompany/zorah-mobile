const {
  withAndroidStyles,
  withDangerousMod,
} = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

/**
 * Expo config plugin to customize Android DatePicker colors and border radius
 * This sets the primary color used in date picker header and adds rounded corners
 */
module.exports = function withCustomDatePickerColors(config) {
  // Add drawable for rounded corners
  config = withDatePickerDrawable(config);

  return withAndroidStyles(config, (config) => {
    const styles = config.modResults;

    // Find or create AppTheme style
    let appTheme = styles.resources.style?.find(
      (style) => style.$.name === "AppTheme",
    );

    if (!appTheme) {
      if (!styles.resources.style) {
        styles.resources.style = [];
      }
      appTheme = {
        $: { name: "AppTheme", parent: "Theme.AppCompat.DayNight.NoActionBar" },
        item: [],
      };
      styles.resources.style.push(appTheme);
    }

    // Helper to add or update style item
    const setStyleItem = (style, name, value) => {
      if (!style.item) style.item = [];
      const existing = style.item.find((item) => item.$.name === name);
      if (existing) {
        existing._ = value;
      } else {
        style.item.push({ $: { name }, _: value });
      }
    };

    // Set primary colors (affects DatePicker header)
    setStyleItem(appTheme, "colorPrimary", "#1A43BE");
    setStyleItem(appTheme, "colorPrimaryDark", "#142F8A");
    setStyleItem(appTheme, "colorAccent", "#1A43BE");

    // Add DatePicker dialog style with rounded corners
    setStyleItem(
      appTheme,
      "android:datePickerDialogTheme",
      "@style/DatePickerDialogTheme",
    );

    // Create DatePickerDialogTheme style
    let datePickerTheme = styles.resources.style?.find(
      (style) => style.$.name === "DatePickerDialogTheme",
    );

    if (!datePickerTheme) {
      datePickerTheme = {
        $: {
          name: "DatePickerDialogTheme",
          parent: "Theme.AppCompat.Light.Dialog",
        },
        item: [],
      };
      styles.resources.style.push(datePickerTheme);
    }

    // Apply rounded background to dialog
    setStyleItem(
      datePickerTheme,
      "android:windowBackground",
      "@drawable/date_picker_background",
    );
    setStyleItem(datePickerTheme, "colorPrimary", "#1A43BE");
    setStyleItem(datePickerTheme, "colorAccent", "#1A43BE");

    return config;
  });
};

// Plugin to add drawable XML for rounded corners
function withDatePickerDrawable(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const drawablePath = path.join(
        projectRoot,
        "android",
        "app",
        "src",
        "main",
        "res",
        "drawable",
      );

      // Create drawable directory if it doesn't exist
      if (!fs.existsSync(drawablePath)) {
        fs.mkdirSync(drawablePath, { recursive: true });
      }

      // Create rounded background drawable
      const drawableXml = `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="@android:color/white"/>
    <corners android:radius="16dp"/>
</shape>`;

      const drawableFile = path.join(
        drawablePath,
        "date_picker_background.xml",
      );
      fs.writeFileSync(drawableFile, drawableXml);

      return config;
    },
  ]);
}
