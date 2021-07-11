export const DbType = {
  END_DATE: {
    name: "End Date",
    type: "formula",
    nestedType: "date",
  },
  START_DATE: {
    name: "Start Date",
    nestedType: "created_time",
    type: "date",
  },
} as const;

const createPageNumbers = () => {
  return new Array(7).map((_, i) => ({ [`#${i}`]: { number: 0 } }));
};

export const PageNumbers = createPageNumbers();
