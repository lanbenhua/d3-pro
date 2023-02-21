import { HierarchyNode } from 'd3';

type Key = string | number;

interface MatrixBaseDataum {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const enum MatrixType {
  BAR_ITEM = 'bar_item',
  BAR_STACK_SLICE = 'bar_stack_slice',
  TREE_NODE = 'tree_node',
}

export interface MatrixStackSliceDataum<Dataum> extends MatrixBaseDataum {
  id?: Key;
  name?: string;
  type?: MatrixType;
  date?: string | number;
  duration?: number;
  status?: number;
  d?: Dataum;
}

export interface MatrixItemDataum<Dataum> extends MatrixBaseDataum {
  id?: Key;
  name?: string;
  type?: MatrixType;
  date?: string | number;
  status?: number;
  slices?: MatrixStackSliceDataum<Dataum>[];
  d?: Dataum;
}

export interface MatrixDataum<Dataum> extends MatrixBaseDataum {
  id: Key;
  oid?: Key;
  name: string;
  type?: MatrixType;
  status?: number;
  parent?: string | null;
  children?: MatrixDataum<Dataum>[];
  data?: MatrixItemDataum<Dataum>[];
  d?: Dataum;
}

export interface MatrixProps<Dataum extends object = object> {
  width?: number | string;
  height?: number | string;
  skipRootBoxes?: boolean;
  data?: MatrixDataum<Dataum> | MatrixDataum<Dataum>[];
  colorMap?: Record<string, string> | [string | number, string][];
  id?: (d: MatrixDataum<Dataum>, i: number) => string | null | undefined;
  parent?: (d: MatrixDataum<Dataum>, i: number) => string | null | undefined;
  children?: (
    d: MatrixDataum<Dataum>
  ) => Iterable<MatrixDataum<Dataum>> | null | undefined;
  sort?: (
    a: HierarchyNode<MatrixDataum<Dataum>>,
    b: HierarchyNode<MatrixDataum<Dataum>>
  ) => number;
  className?: string;
  style?: React.CSSProperties;
  onBoxClick?: (
    selection: d3.Selection<
      d3.BaseType,
      MatrixItemDataum<Dataum>,
      d3.BaseType,
      MatrixItemDataum<Dataum>
    >,
    evt: Event,
    d: MatrixItemDataum<Dataum>
  ) => void;
  onTreeNodeClick?: (
    selection: d3.Selection<
      d3.BaseType,
      MatrixDataum<Dataum>,
      d3.BaseType,
      MatrixDataum<Dataum>
    >,
    evt: Event,
    d: d3.HierarchyPointNode<MatrixDataum<Dataum>>
  ) => void;
  popupRender?: (
    d?:
      | MatrixDataum<Dataum>
      | MatrixItemDataum<Dataum>
      | MatrixStackSliceDataum<Dataum>
  ) => React.ReactNode;
}
