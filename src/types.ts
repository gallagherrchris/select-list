export interface SelectFile {
  name: string;
  device: string;
  path: string;
  status: string;
}

export type SelectListFile = SelectFile & {
  selected: boolean;
};

export interface SelectListState {
  data: Array<SelectListFile>;
  checkedState: CheckedState;
  selectedText: string;
};

export enum CheckedState {
  CHECKED,
  UNCHECKED,
  INDETERMINATE
}

export enum SelectListAction {
  INIT,
  SELECTALL,
  SELECT,
  DOWNLOAD,
}