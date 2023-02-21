import React from 'react';
import * as d3 from 'd3';
import cls from 'classnames';
import SplitPane from 'react-split-pane';
import consoler from 'lib/consoler';
import { debounce } from 'utils/helper';
import Popup from 'components/antd/popup';
import { NoData } from 'assets/imgs';
import { getLetterWidth } from 'lib/graph/utils/getWidthUtil';
import {
  MatrixProps,
  MatrixDataum,
  MatrixItemDataum,
  MatrixStackSliceDataum,
} from './type';
import './index.less';

function Matrix<Dataum extends object = object>({
  width,
  height,
  size,
  sizeRange = [0, 750],
  skipRootBoxes,
  data,
  colorMap,
  id,
  parent,
  children,
  sort,
  className,
  style,
  onBoxClick,
  onTreeNodeClick,
  popupRender,
}: MatrixProps<Dataum>) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const treeWrapperRef = React.useRef<HTMLDivElement>(null);
  const matrixWrapperRef = React.useRef<HTMLDivElement>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const popupHoverRef = React.useRef<boolean>(false);

  const [popup, setPopup] = React.useState<{
    visible: boolean;
    event?: MouseEvent;
    d?:
      | MatrixDataum<Dataum>
      | MatrixItemDataum<Dataum>
      | MatrixStackSliceDataum<Dataum>;
  }>({
    visible: false,
    event: undefined,
    d: undefined,
  });

  const [redrawFlag, setRedrawFlag] = React.useState<boolean>(false);
  const debounceSetRedrawFlag = React.useMemo<
    React.Dispatch<React.SetStateAction<boolean>>
  >(() => {
    return debounce(setRedrawFlag, (5 * 1000) / 60);
  }, []);

  const wrapperWidth = wrapperRef.current?.getBoundingClientRect().width ?? 0;
  const rowHeight = 40;
  const barChartHeight = 160;
  const treePadding = {
    top: 10,
    left: 10,
    right: 10,
    bottom: 0,
  };
  const matrixPadding = {
    top: 10,
    left: 70,
    right: 30,
    bottom: 0,
  };
  const hierarchy = React.useMemo(() => {
    const h =
      id && parent
        ? d3
            .stratify<MatrixDataum<Dataum>>()
            .id((d, i) => id(d, i))
            .parentId((d, i) => parent(d, i))(data as MatrixDataum<Dataum>[])
        : d3.hierarchy((data || {}) as MatrixDataum<Dataum>, children);

    // Sort the nodes.
    if (sort != null) h.sort(sort);

    let nodeIdx = 0;
    h.eachBefore((d) => {
      // @ts-ignore
      d.index = nodeIdx++;
    });

    return h;
  }, [data]);

  const circleSize = 20;
  const circleSpace = 24;
  let maxTreeContentWidth = 0;
  hierarchy.descendants().forEach((d) => {
    const textWidth = getLetterWidth(d.data.name, 14);
    const w = (d.depth + 1) * (circleSize + circleSpace) + textWidth;
    if (w > maxTreeContentWidth) maxTreeContentWidth = w;
  });
  maxTreeContentWidth += 16;

  const getAutoSize = () =>
    Math.min(
      wrapperWidth,
      sizeRange?.[1] ?? Number.MAX_SAFE_INTEGER,
      Math.ceil(maxTreeContentWidth + treePadding.left + treePadding.right)
    );
  const initialSize =
    (typeof size === 'function' ? size(getAutoSize()) : size) ?? getAutoSize();

  React.useEffect(() => {
    if (!data) return;

    const container = treeWrapperRef.current;
    // const duration = 0;
    const chartWidth = Math.max(
      Math.ceil(maxTreeContentWidth + treePadding.left + treePadding.right),
      container?.getBoundingClientRect().width ?? 0
    );
    const chartHeight = Math.ceil(
      hierarchy.descendants().length * rowHeight +
        treePadding.top +
        treePadding.bottom
    );

    // Define the arrowhead marker variables
    const arrowSize = 6;
    const arrowPoints: [number, number][] = [
      [0, 0],
      [0, arrowSize],
      [arrowSize, arrowSize / 2],
    ];

    // Compute the layout.
    const nodeSizeX = 10;
    const nodeSizeY =
      10 ||
      chartWidth / (hierarchy.height + treePadding.left + treePadding.right);
    const tree = d3
      .tree<MatrixDataum<Dataum>>()
      .nodeSize([nodeSizeX, nodeSizeY]);
    const root = tree(hierarchy);
    const nodes = root.descendants();
    const links = root.links();

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('viewbox', [chartWidth, chartHeight])
      .attr('class', 'tree')
      .style('background', '#fff');

    const defs = svg.append('defs');

    // render intersection start
    const intersectionRender = (
      g: d3.Selection<SVGGElement, unknown, null, undefined>
    ) => {
      g.append('g')
        .attr('class', 'intersection-x')
        .attr('transform', `translate(${treePadding.left},${treePadding.top})`)
        .attr('fill', 'none')
        .append('rect')
        .attr('class', 'rect intersection-rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', chartWidth - treePadding.left)
        .attr('height', rowHeight);
    };
    const hoverXIntersectionG = (xIndex = 0, active = false) => {
      intersectionG
        .select('.intersection-x')
        .attr(
          'transform',
          `translate(${treePadding.left},${
            treePadding.top + xIndex * rowHeight
          })`
        )
        .attr('fill', active ? '#F5F9FF' : 'none');

      d3.select(matrixWrapperRef.current)
        .select('.matrix .intersection .intersection-x')
        .attr(
          'transform',
          `translate(${0},${
            matrixPadding.top +
            barChartHeight +
            (skipRootBoxes ? rowHeight : 0) * -1 +
            xIndex * rowHeight
          })`
        )
        .attr('fill', active ? '#F5F9FF' : 'none');
    };
    const intersectionG = svg
      .append('g')
      .attr('class', 'intersection')
      .call(intersectionRender, 0, 0, false);
    // render intersection end

    // render tree chart start
    const treeG = svg
      .append('g')
      .attr('class', 'g')
      .attr(
        'transform',
        `translate(${treePadding.left},${treePadding.top + rowHeight / 2})`
      );

    // grid
    defs
      .append('line')
      .attr('id', 'line')
      .attr('class', 'line line-x')
      .attr('stroke', '#e5e5e5')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', chartWidth - treePadding.left)
      .attr('y2', 0);

    const treeGridG = treeG.append('g').attr('class', 'grid');
    treeGridG
      .selectAll('line')
      .data(nodes)
      .enter()
      .append('use')
      .attr('href', '#line')
      .attr('data-index', (_, i) => i)
      .attr(
        'transform',
        (_, i) => `translate(0,${(i + 1) * rowHeight - rowHeight / 2})`
      );

    // Add the arrowhead marker definition to the svg element
    // let arrowMarkerMap = new Map<string | number, number>();
    const markers = new Set(
      links.map(
        (link) => link.source.data.oid ?? link.source.id ?? link.source.data.id
      )
    );

    defs
      .selectAll('marker')
      .data(markers)
      .enter()
      .append('marker')
      .attr('id', (d) => `arrow-${d}`)
      .attr('class', (d) => `arrow arrow-${d}`)
      .attr('data-index', (d) => d)
      .attr('viewBox', [0, 0, arrowSize, arrowSize])
      .attr('refX', arrowSize / 2)
      .attr('refY', arrowSize / 2)
      .attr('markerWidth', arrowSize)
      .attr('markerHeight', arrowSize)
      .attr('orient', 90) // 'auto-start-reverse'
      .append('path')
      .attr('d', d3.line()(arrowPoints))
      .attr('stroke-width', 0)
      .attr('stroke', '#D9D9D9')
      .attr('fill', '#D9D9D9');

    // links
    // const curve = d3.line().curve()
    const link = d3
      .linkHorizontal()
      .x((d) => d[0])
      .y((d) => d[1]);

    treeG
      .append('g')
      .attr('class', 'links')
      .attr('fill', 'none')
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('data-index', (_, i) => i)
      .attr('class', 'link')
      .style('cursor', 'pointer')
      .attr('stroke', '#D9D9D9')
      .attr('stroke-width', 1)
      .attr(
        'marker-start',
        (d) =>
          `url(#arrow-${d.source.data.oid ?? d.source.id ?? d.source.data.id})`
      )
      .on('mouseover', function (_, d) {
        d3.select(this).attr('stroke', '#2673DD').attr('stroke-width', 2);

        const id = d.source.data.oid ?? d.source.id ?? d.source.data.id;
        if (id != null) {
          svg
            .select(`marker[data-index='${id}'] path`)
            .attr('stroke', '#2673DD')
            .attr('fill', '#2673DD')
            .style('position', 'relative')
            .style('z-index', 10);
        }
      })
      .on('mouseout', function (_, d) {
        d3.select(this).attr('stroke', '#D9D9D9').attr('stroke-width', 1);
        const id = d.source.data.oid ?? d.source.id ?? d.source.data.id;
        if (id != null) {
          svg
            .select(`marker[data-index='${id}'] path`)
            .attr('stroke', '#D9D9D9')
            .attr('fill', '#D9D9D9')
            .style('position', '')
            .style('z-index', '');
        }
      })
      // .transition()
      // .duration(duration)
      .attr('d', (d) => {
        const sp: [number, number] = [
          d.source.depth * (circleSize + circleSpace) +
            circleSize +
            arrowSize / 2,
          // @ts-ignore
          d.source.index * rowHeight,
        ];
        const ep: [number, number] = [
          d.target.depth * (circleSize + circleSpace),
          // @ts-ignore
          d.target.index * rowHeight,
        ];
        // const cp: [number, number] = [(sp[0] + ep[0]) / 2, (sp[1] + ep[1]) / 2];
        // const path = d3.path();
        // path.moveTo(sp[0], sp[1]);
        // path.quadraticCurveTo(cp[0], sp[1], cp[0], cp[1]);
        // path.quadraticCurveTo(cp[0], ep[1], ep[0], ep[1]);
        // return path.toString();

        return link({ source: sp, target: ep });
      });

    // nodes
    const nodeG = treeG
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      // @ts-ignore
      .attr('data-index', (d) => d.index)
      .attr('path', (d) =>
        d
          .ancestors()
          .reverse()
          .map((d) => d.data.name)
          .join('/')
      )
      .attr('class', (d) => `node node-${d.data.id}`);

    nodeG
      // .transition()
      // .duration(duration)
      .attr(
        'transform',
        (d) =>
          //@ts-ignore
          `translate(${d.depth * (circleSize + circleSpace)},${
            d.index * rowHeight
          })`
      );

    const treeRepeatedNodeMap = new Map<string | number, string | number>();

    defs
      .append('circle')
      .attr('id', 'circle')
      .attr('class', () => `circle node-circle`)
      .attr('r', circleSize / 2)
      .attr('cx', () => circleSize / 2)
      .attr('cy', () => 0)
      .attr('fill', '#fff')
      .style('cursor', 'pointer');

    nodeG
      .append('use')
      .attr('href', '#circle')
      .attr('stroke', (d) => (d.parent ? '#BFBFBF' : '#262626'))
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', (d) => {
        const id = d.data.oid ?? d.data.id;
        const repeated = !!treeRepeatedNodeMap.get(id as string | number);
        treeRepeatedNodeMap.set(id, id);
        if (repeated) return [3, 2];
        return 'none';
      })
      .on('mouseover', function (evt, d) {
        d3.select(this).attr('stroke', '#2673DD').attr('stroke-width', 2);
        const xIndex = this.parentElement
          ? Number(d3.select(this.parentElement).attr('data-index')) | 0 ?? 0
          : 0;
        hoverXIntersectionG(xIndex, true);

        popupHoverRef.current = true;
        setPopup({
          visible: true,
          event: evt,
          d: d.data,
        });
      })
      .on('mouseout', function (_, d) {
        d3.select(this)
          .attr('stroke', d.parent ? '#BFBFBF' : '#262626')
          .attr('stroke-width', 1);

        const xIndex = this.parentElement
          ? Number(d3.select(this.parentElement).attr('data-index')) | 0 ?? 0
          : 0;
        hoverXIntersectionG(xIndex, false);

        popupHoverRef.current = false;
        setTimeout(() => {
          if (!popupHoverRef.current)
            setPopup((pre) => ({
              ...pre,
              visible: false,
            }));
        }, 300);
      })
      .on('click', function (evt, d) {
        onTreeNodeClick &&
          onTreeNodeClick(
            d3.select(this) as unknown as d3.Selection<
              d3.BaseType,
              MatrixDataum<Dataum>,
              d3.BaseType,
              MatrixDataum<Dataum>
            >,
            evt,
            d
          );
      });

    const imageSize = 14;
    nodeG
      .append('image')
      .attr('x', () => circleSize + imageSize / 2 + arrowSize)
      .attr('y', () => -imageSize / 2)
      .attr('width', (d) => (d.data.image ? imageSize : 0))
      .attr('height', (d) => (d.data.image ? imageSize : 0))
      .attr('href', (d) => d.data.image ?? '');

    nodeG
      .append('text')
      .attr(
        'dx',
        (d) => circleSize + 7 + arrowSize + (d.data.image ? imageSize + 4 : 0)
      )
      .attr('dy', '0.32em')
      .style('cursor', 'pointer')
      .text((d) => d.data.name ?? '')
      .on('mouseover', function () {
        d3.select(this).attr('fill', '#2673DD');
        const xIndex = this.parentElement
          ? Number(d3.select(this.parentElement).attr('data-index')) | 0 ?? 0
          : 0;
        hoverXIntersectionG(xIndex, true);
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', 'rgba(0, 0, 0, 0.85)');

        const xIndex = this.parentElement
          ? Number(d3.select(this.parentElement).attr('data-index')) | 0 ?? 0
          : 0;
        hoverXIntersectionG(xIndex, false);
      })
      .on('click', function (evt, d) {
        onTreeNodeClick &&
          onTreeNodeClick(
            d3.select(this) as unknown as d3.Selection<
              d3.BaseType,
              MatrixDataum<Dataum>,
              d3.BaseType,
              MatrixDataum<Dataum>
            >,
            evt,
            d
          );
      });
    // nodeG.append('title').text(d => d.data.name);
    // render tree chart end

    return () => {
      svg.remove();
      treeRepeatedNodeMap.clear();
      //@ts-ignore
      treeRepeatedNodeMap = null;
    };
  }, [data, redrawFlag]);

  React.useEffect(() => {
    if (!data) return;

    const container = matrixWrapperRef.current;
    const squareSize = 16;
    const squareSpace = 24;
    const axisHeight = 20;
    const barXAxisHeight = 30;
    const barHeight = barChartHeight - barXAxisHeight;
    const noDataWidth = 300;
    const minBarWidth = 200;
    const squareNum: number = hierarchy.data.data?.length ?? 0;
    const squareWidth = Math.max(
      minBarWidth,
      squareNum * (squareSize + squareSpace) || noDataWidth
    );
    const chartWidth = squareWidth + matrixPadding.left + matrixPadding.right;
    const chartHeight =
      barChartHeight +
      (hierarchy.descendants().length + (skipRootBoxes ? -1 : 0)) * rowHeight +
      matrixPadding.top +
      matrixPadding.bottom;
    const nodes = hierarchy.descendants();
    const barData = hierarchy.data.data;

    const colorArr = colorMap
      ? Array.isArray(colorMap)
        ? colorMap
        : Object.entries(colorMap)
      : [];
    const colorScale = d3
      .scaleOrdinal<string | number, string>()
      .domain(colorArr.map((item) => String(item[0])))
      .range(colorArr.map((item) => item[1]) ?? d3.schemeCategory10);
    const maxDuration: number = Math.max(
      0,
      barData?.reduce<number>(
        (acc, item) =>
          Math.max(
            acc,
            item.slices?.reduce(
              (acc, slice) => acc + (slice.duration ?? 0),
              0
            ) ?? 0
          ),
        0
      ) ?? 0
    );
    // const niceDate = (
    //   d: [undefined, undefined] | [Date, Date]
    // ): [undefined, undefined] | [Date, Date] => {
    //   const [start, end] = d;
    //   if (!start || !end) return d;
    //   const diff = start && end ? end?.getTime() - start?.getTime() : 0;
    //   const plot = (diff * 1.1 - diff) / 2;
    //   return [new Date(start.getTime() - plot), new Date(end.getTime() + plot)];
    // };
    // const xDomain = d3.extent(barData ?? [], function(d) {
    //   return new Date(d.date ?? 0);
    // });
    const xDomain = d3.extent(barData ?? [], function (_, i) {
      return i;
    });
    const xRange = [
      (squareSpace + squareSize) / 2,
      squareWidth - (squareSpace + squareSize) / 2,
    ];
    const xTicks =
      barData?.reduce<number[]>((o, _, i) => {
        if (i % 3 === 0) {
          return o.concat(i);
        }
        return o;
      }, []) ?? [];
    const xScale = d3
      .scaleLinear()
      .domain(xDomain as [number, number])
      .range(xRange);
    const xAxis = d3
      .axisTop(xScale)
      .offset(0)
      .tickPadding(10)
      .tickSize(0)
      .tickSizeOuter(0)
      .tickSizeInner(3)
      .tickValues(xTicks)
      .tickFormat((d) => {
        const date = new Date((barData ?? [])[d as number]?.date ?? 0);
        return d3.timeFormat('%b %d, %H:%M')(date);
      });
    const nice = (n: number, t: number): number => {
      n = n * 1.2;
      const millisec = n;
      const sec = n / 1000;
      const min = n / 60 / 1000;
      const hour = n / 60 / 60 / 1000;
      const day = n / 24 / 60 / 60 / 1000;

      const multipleN = (n: number, t: number): number => {
        let u = (n * 10) / t;
        if (u > (u | 0)) u = (u | 0) + 1;
        return (u * t) / 10;
      };

      let d = 0;
      if (day >= 1) {
        d = multipleN(day, t) * 24 * 60 * 60 * 1000;
      } else if (hour >= 1) {
        d = multipleN(hour, t) * 60 * 60 * 1000;
      } else if (min >= 1) {
        d = multipleN(min, t) * 60 * 1000;
      } else if (sec >= 1) {
        d = multipleN(sec, t) * 1000;
      } else {
        d = multipleN(millisec, t);
      }

      return d;
    };
    const unit = (n: number): 'day' | 'hour' | 'min' | 'sec' | 'millisec' => {
      if (n === 0) return 'millisec';
      const millisec = n;
      const sec = n / 1000;
      const min = n / 60 / 1000;
      const hour = n / 60 / 60 / 1000;
      const day = n / 24 / 60 / 60 / 1000;

      if (day >= 1) return 'day';
      if (hour >= 1) return 'hour';
      if (min >= 1) return 'min';
      if (sec >= 1) return 'sec';
      if (millisec >= 1) return 'millisec';
      return 'millisec';
    };
    const format = (n: number): string => {
      if (n === 0) return '0';
      const millisec = n;
      const sec = n / 1000;
      const min = n / 60 / 1000;
      const hour = n / 60 / 60 / 1000;
      const day = n / 24 / 60 / 60 / 1000;
      if (YUnit === 'day') return `${day} day`;
      if (YUnit === 'hour') return `${hour} hour`;
      if (YUnit === 'min') return `${min} min`;
      if (YUnit === 'sec') return `${sec} sec`;
      if (YUnit === 'millisec') return `${millisec} millisec`;
      return '';
    };
    const ticks = (n: number, t: number): number[] => {
      if (n === 0) return [];
      const r = [];
      let i = 0;
      while (i <= t) {
        r.unshift((n / t) * i);
        i++;
      }
      return r;
    };
    const YMaximum = nice(maxDuration, 5);
    const YUnit = unit(YMaximum);
    const yTicks = ticks(YMaximum, 5);
    const yScale = d3
      .scaleLinear()
      .domain([0, YMaximum])
      .range([barHeight, 0])
      .nice();
    const yScale2 = d3
      .scaleLinear()
      .domain([0, YMaximum])
      .range([0, barHeight]);
    const yAxis = d3
      .axisLeft(yScale)
      .offset(0)
      .tickPadding(10)
      .tickSize(0)
      .tickSizeOuter(0)
      .tickSizeInner(0)
      .tickValues(yTicks)
      .tickFormat((d) => format(d.valueOf()));

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('viewbox', [chartWidth, chartHeight])
      .attr('class', 'matrix')
      .style('background', '#fff');

    const defs = svg.append('defs');

    // render intersection start
    const intersectionRender = (
      g: d3.Selection<SVGGElement, unknown, null, undefined>
    ) => {
      g.append('g')
        .attr('class', 'intersection-x')
        .attr('transform', `translate(0,0)`)
        .attr('fill', 'none')
        .append('rect')
        .attr('class', 'rect intersection-rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', chartWidth - matrixPadding.right)
        .attr('height', rowHeight);

      g.append('g')
        .attr('class', 'intersection-y')
        .attr('transform', `translate(0,0)`)
        .attr('fill', 'none')
        .append('rect')
        .attr('class', 'rect intersection-rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', squareSize + squareSpace)
        .attr('height', chartHeight - matrixPadding.top - matrixPadding.bottom);
    };
    const hoverXIntersectionG = (xIndex = 0, active = false) => {
      consoler.log(`hoverXIntersectionG: xIndex=%o, active=%o`, xIndex, active);
      d3.select(treeWrapperRef.current)
        .select('.tree .intersection .intersection-x')
        .attr(
          'transform',
          `translate(${treePadding.left},${
            treePadding.top + xIndex * rowHeight
          })`
        )
        .attr('fill', active ? '#F5F9FF' : 'none');
      intersectionG
        .select('.intersection-x')
        .attr(
          'transform',
          `translate(${0},${
            matrixPadding.top +
            barChartHeight +
            (skipRootBoxes ? rowHeight : 0) * -1 +
            xIndex * rowHeight
          })`
        )
        .attr('fill', active ? '#F5F9FF' : 'none');
    };
    const hoverYIntersectionG = (yIndex = 0, active = false) => {
      consoler.log(`hoverYIntersectionG: yIndex=%o, active=%o`, yIndex, active);
      // const d = barData?.find((_, i) => yIndex === i);
      const x =
        xScale(yIndex) - (squareSize + squareSpace) / 2 + matrixPadding.left;
      intersectionG
        .select('.intersection-y')
        .attr('transform', `translate(${x},${matrixPadding.top + axisHeight})`)
        .attr('fill', active ? '#F5F9FF' : 'none');
    };
    const hoverIntersectionG = (xIndex = 0, yIndex = 0, active = false) => {
      hoverXIntersectionG(xIndex, active);
      hoverYIntersectionG(yIndex, active);
    };
    const intersectionG = svg
      .append('g')
      .attr('class', 'intersection')
      .attr('transform', `translate(0,0)`)
      .call(intersectionRender, 0, 0, false);
    // render intersection end

    // render bar chart start
    const barChartG = svg
      .append('g')
      .attr('class', 'bar')
      .attr(
        'transform',
        `translate(${matrixPadding.left},${matrixPadding.top + axisHeight})`
      );

    // grid
    defs
      .append('line')
      .attr('id', 'bar-line')
      .attr('class', 'line line-x')
      .attr('stroke', '#e5e5e5')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', squareWidth)
      .attr('y2', 0);

    const barGridG = barChartG.append('g').attr('class', 'grid bar-grid');
    barGridG
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('use')
      .attr('href', '#bar-line')
      .attr('data-index', (_, i) => i)
      .attr('transform', (d) => `translate(0,${yScale2(d)})`);

    // x-axis
    barChartG.append('g').attr('class', 'axis x-axis').call(xAxis);

    // y-axis
    barChartG.append('g').attr('class', 'axis y-axis').call(yAxis);

    barChartG.select('.axis.x-axis .domain').attr('stroke', 'none');
    barChartG.select('.axis.y-axis .domain').attr('stroke', 'none');

    if (!barData || barData.length === 0) {
      const noDataG = barChartG.append('g').attr('class', 'bar-no-data');

      noDataG
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', noDataWidth)
        .attr('height', barHeight)
        .attr('fill', 'none');

      noDataG
        .append('image')
        .attr('x', () => (noDataWidth - 110) / 2)
        .attr('y', () => (barHeight - 111) / 2 - 10)
        .attr('width', 110)
        .attr('height', 111)
        .attr('href', NoData);

      noDataG
        .append('text')
        .attr('dx', () => (noDataWidth - 110) / 2 + 110 / 2)
        .attr('dy', () => (barHeight - 111) / 2 + 111)
        .attr('text-anchor', 'middle')
        .attr('stroke', '#999')
        .text('No Data');
    }

    const bargGroupG = barChartG.append('g').attr('class', 'bar-group');

    const barItemG = bargGroupG
      .selectAll('g')
      .data(barData ?? [])
      .enter()
      .append('g')
      .attr('class', 'bar-item')
      .attr('data-index', (_, i) => i)
      .attr('transform', (_, i) => `translate(${xScale(i)},${0})`);
    // barItemG.append('title').text(d => d.name ?? '');

    const hoverBarSliceHandler = (
      self: SVGRectElement,
      _: Event,
      d: MatrixItemDataum<Dataum>,
      hover: boolean
    ) => {
      const selection = d3.select(self);
      const c = d.status != null ? colorScale(String(d.status)) : '#aaa';
      selection
        .attr('stroke', hover ? '#2673DD' : c)
        .attr('stroke-width', hover ? 2 : 0);

      const yIndex = self.parentElement?.parentElement
        ? Number(
            d3.select(self.parentElement?.parentElement).attr('data-index')
          ) | 0 ?? 0
        : 0;
      hoverYIntersectionG(yIndex, hover);
    };

    barItemG
      .selectAll('g')
      .data((d) => d.slices ?? [])
      .enter()
      .append('g')
      .attr('class', 'bar-item-slice')
      .attr('data-index', (_, i) => i)
      .attr('transform', function (_, i) {
        if (this.parentNode) {
          const d = d3
            // @ts-ignore
            .select<d3.BaseType, MatrixItemDataum<Dataum>>(this.parentNode)
            .datum();
          const duration = d?.slices
            ?.slice(0, i + 1)
            .reduce((acc, item) => acc + (item.duration ?? 0), 0);
          return `translate(${-squareSize / 2},${
            barHeight - yScale2(duration ?? 0)
          })`;
        }
        return `translate(0,${0})`;
      })
      .append('rect')
      .attr('class', (d) => `box bar-item-box status-${d.status}`)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', squareSize)
      .attr('height', (d) => Math.max(1, yScale2(d.duration ?? 0)))
      .attr('fill', (d) => colorScale(String(d.status)))
      .style('cursor', 'pointer')
      .on('mouseover', function (evt, d) {
        hoverBarSliceHandler(this, evt, d, true);

        popupHoverRef.current = true;
        setPopup({
          visible: true,
          event: evt,
          d: d,
        });
      })
      .on('mouseout', function (evt, d) {
        hoverBarSliceHandler(this, evt, d, false);

        popupHoverRef.current = false;
        setTimeout(() => {
          if (!popupHoverRef.current)
            setPopup((pre) => ({
              ...pre,
              visible: false,
            }));
        }, 300);
      })
      .on('click', function (evt, d) {
        onBoxClick && onBoxClick(d3.select(this) as unknown as never, evt, d);
      });
    // render bar chart end

    // grid
    defs
      .append('line')
      .attr('id', 'box-line')
      .attr('class', 'line line-x')
      .attr('stroke', '#e5e5e5')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', chartWidth - matrixPadding.right)
      .attr('y2', 0);

    const boxGridG = svg
      .append('g')
      .attr('class', 'grid box-grid')
      .attr(
        'transform',
        `translate(${0},${
          matrixPadding.top +
          axisHeight +
          barChartHeight +
          (skipRootBoxes ? rowHeight : 0) * -1
        })`
      );
    boxGridG
      .selectAll('line')
      .data(nodes)
      .enter()
      .append('use')
      .attr('href', '#box-line')
      .attr('data-index', (_, i) => i)
      .attr(
        'transform',
        (_, i) => `translate(0,${(i + 1) * rowHeight - rowHeight / 2})`
      );

    const boxesG = svg
      .append('g')
      .attr('class', 'boxes')
      .attr(
        'transform',
        `translate(${matrixPadding.left},${
          matrixPadding.top +
          axisHeight +
          barChartHeight +
          (skipRootBoxes ? rowHeight : 0) * -1
        })`
      );

    const boxG = boxesG
      .selectAll('g')
      .data(nodes)
      .enter()
      .filter((d) => (skipRootBoxes ? d.parent != null : true))
      .append('g')
      .attr('class', 'box-row')
      // @ts-ignore
      .attr('data-index', (d) => d.index)
      // @ts-ignore
      .attr('transform', (d) => `translate(0,${rowHeight * d.index})`)
      .selectAll('g')
      .data((d) => d.data.data ?? [])
      .enter()
      .append('g')
      .attr('data-index', (_, i) => i)
      .attr('class', () => `box-group`)
      .attr('transform', (_, i) => `translate(${xScale(i)},0)`);
    // boxG.append('title').text(d => d.name ?? '');

    const hoverBoxHandler = (
      self: SVGRectElement,
      _: Event,
      d: MatrixItemDataum<Dataum>,
      hover: boolean
    ) => {
      const selection = d3.select(self);
      const c = d.status != null ? colorScale(String(d.status)) : '#aaa';
      selection
        .attr('stroke', hover ? '#2673DD' : c)
        .attr('stroke-width', hover ? 2 : 1);

      const xIndex = self.parentElement?.parentElement
        ? Number(
            d3.select(self.parentElement?.parentElement).attr('data-index')
          ) | 0 ?? 0
        : 0;
      const yIndex = self.parentElement
        ? Number(d3.select(self.parentElement).attr('data-index')) | 0 ?? 0
        : 0;
      consoler.log(`hoverBoxHandler: xIndex=%o, yIndex=%o`, xIndex, yIndex);
      hoverIntersectionG(xIndex, yIndex, hover);
    };

    defs
      .append('rect')
      .attr('id', 'box')
      .attr('x', -squareSize / 2)
      .attr('y', -squareSize / 2)
      .attr('width', squareSize)
      .attr('height', squareSize);

    boxG
      .append('use')
      .attr('href', '#box')
      .attr('class', (d) => `box status-${d.status}`)
      .attr('fill', (d) =>
        d.status != null ? colorScale(String(d.status)) : '#fff'
      )
      .attr('stroke', (d) =>
        d.status != null ? colorScale(String(d.status)) : '#aaa'
      )
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function (evt, d) {
        //@ts-ignore
        hoverBoxHandler(this, evt, d, true);

        popupHoverRef.current = true;
        setPopup({
          visible: true,
          event: evt,
          d: d,
        });
      })
      .on('mouseout', function (evt, d) {
        //@ts-ignore
        hoverBoxHandler(this, evt, d, false);

        popupHoverRef.current = false;
        setTimeout(() => {
          if (!popupHoverRef.current)
            setPopup((pre) => ({
              ...pre,
              visible: false,
            }));
        }, 300);
      })
      .on('click', function (evt, d) {
        onBoxClick && onBoxClick(d3.select(this) as unknown as never, evt, d);
      });

    return () => {
      svg.remove();
    };
  }, [data]);

  React.useEffect(() => {
    const enter = () => {
      popupHoverRef.current = true;
    };
    const leave = () => {
      popupHoverRef.current = false;
      setPopup((pre) => ({
        ...pre,
        visible: false,
      }));
    };
    popupRef.current?.addEventListener('mouseenter', enter);
    popupRef.current?.addEventListener('mouseleave', leave);

    return () => {
      popupRef.current?.removeEventListener('mouseenter', enter);
      popupRef.current?.removeEventListener('mouseleave', leave);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={cls('sp-matrix-wrapper', className)}
      style={{
        ...style,
        width: width ?? style?.width,
        height: height ?? style?.height,
      }}
    >
      <SplitPane
        allowResize
        split="vertical"
        primary="first"
        minSize={0}
        maxSize={Math.min(
          wrapperWidth,
          sizeRange?.[1] ?? Number.MAX_SAFE_INTEGER
        )}
        size={initialSize}
        onChange={() => debounceSetRedrawFlag((pre) => !pre)}
        paneStyle={{
          position: 'relative',
          overflow: 'auto hidden',
        }}
        style={{ position: 'relative' }}
      >
        <div
          style={{
            paddingTop: skipRootBoxes
              ? barChartHeight - rowHeight
              : barChartHeight,
          }}
          ref={treeWrapperRef}
        ></div>
        <div ref={matrixWrapperRef}></div>
      </SplitPane>

      <div ref={popupRef}></div>
      <Popup
        visible={popup.visible}
        event={popup.event}
        offset={5}
        className="matrix-popup"
        getPopContainer={popupRef.current ?? undefined}
      >
        {popupRender && popupRender(popup.d)}
      </Popup>
    </div>
  );
}

export * from './type';
export default Matrix;
