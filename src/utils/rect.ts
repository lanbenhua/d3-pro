export type Offset = { x: number; y: number };
export type DOMRect = { height: number; width: number } & Offset;

const getOffset = (ele: HTMLElement): Offset => {
  const offset = { x: 0, y: 0 };
  let curEle = ele;
  while (
    curEle.offsetParent !== null &&
    (curEle.offsetParent !== document.body ||
      curEle.offsetParent !== document.documentElement)
  ) {
    offset.x += curEle.offsetLeft;
    offset.y += curEle.offsetTop;
    curEle = curEle.offsetParent as HTMLElement;
  }
  return offset;
};

const rect = (ele: HTMLElement): DOMRect => {
  return ele.getBoundingClientRect
    ? ele.getBoundingClientRect()
    : { width: ele.clientWidth, height: ele.clientHeight, ...getOffset(ele) };
};

export default rect;
