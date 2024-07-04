type useCheckboxProps = {
  data: unknown[];
  checkedValues: string[];
};

type useCheckboxReturnType = {
  isChecked: boolean;
  isIndeterminate: boolean;
};

export function useCheckbox({ data, checkedValues }: useCheckboxProps): useCheckboxReturnType {
  const isChecked = data.length === checkedValues.length;
  const isIndeterminate = checkedValues.length > 0 && checkedValues.length < data.length;
  return { isChecked, isIndeterminate };
}
