export const DbType = {
  INTERVALL: { name: "Intervall (Days)", val: "number" },
  NEXT_DUE: { name: "Next Due", val: "date" },
  STATE: {
    name: "State",
    val: "select",
    selectValue: "🏁 SELECTED",
    selectId: "{Qrh",
    selectColor: "pink",
  },
} as const;
