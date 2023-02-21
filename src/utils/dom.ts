import rect, { DOMRect } from './rect';

const DOM = {
  svg: (container: HTMLElement, width: number, height: number): HTMLElement => {
    const svg = document.createElement('svg');
    svg.setAttribute('viewBox', `0 0 ${width}, ${height}`);
    svg.setAttribute('width', `${width}`);
    svg.setAttribute('height', `${height}`);
    container.append(svg);
    return svg;
  },

  rect: (element: HTMLElement): DOMRect => {
    return rect(element);
  },
};

export default DOM;
