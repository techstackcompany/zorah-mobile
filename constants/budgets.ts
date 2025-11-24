const BUDGET_STATUS = {
  ON_TRACK: "on-track",
  APPROACHING: "approaching",
  EXCEEDED: "exceeded",
};


const statusMeta: Record<
typeof BUDGET_STATUS[keyof typeof BUDGET_STATUS],
{ label: string; badgeBg: string; textColor: string; accentColor: string }
> = {
    "on-track": {
        label: "On Track",
        badgeBg: "#E6F5F3",
        textColor: "#2FA89A",
        accentColor: "#2FA89A",
    },
    exceeded: {
        label: "Budget Exceeded",
        badgeBg: "#FDE8E8",
        textColor: "#D14343",
        accentColor: "#D14343",
    },
    approaching: {
        label: "Approaching Limit",
        badgeBg: "#FFF7E6",
        textColor: "#E9781A",
        accentColor: "#E9781A",
    },
};
export  {BUDGET_STATUS, statusMeta};