type Key = string | number;

interface TreeBaseDataum {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface TreeDataum<Dataum> extends TreeBaseDataum {
  id: Key;
  name: string;
  status?: number;
  d?: Dataum;
}

export interface TreeProps<Dataum extends object = object> {
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  data?: TreeDataum<Dataum> | TreeDataum<Dataum>[];
  id?: (d: TreeDataum<Dataum>, i: number) => string | null | undefined;
  parent?: (d: TreeDataum<Dataum>, i: number) => string | null | undefined;
  sort?: (
    a: d3.HierarchyNode<TreeDataum<Dataum>>,
    b: d3.HierarchyNode<TreeDataum<Dataum>>
  ) => number;
  onNodeClick?: (
    selection: d3.Selection<
      d3.BaseType,
      TreeDataum<Dataum>,
      d3.BaseType,
      TreeDataum<Dataum>
    >,
    evt: Event,
    d: d3.HierarchyPointNode<TreeDataum<Dataum>>
  ) => void;
  popupRender?: (d?: TreeDataum<Dataum>) => React.ReactNode;
  children?: (
    d: TreeDataum<Dataum>
  ) => Iterable<TreeDataum<Dataum>> | null | undefined;
}
