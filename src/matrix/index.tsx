import React from 'react';
import * as d3 from 'd3';
import cls from 'classnames';
// import { humanize } from 'utils/datetime';
import { ellipsis } from 'utils/strings';
import TaskStatusConstructor from 'biz/bizcommon/task-status';
import Popup from 'components/antd/popup';
import { NoData } from 'assets/imgs';
import {
  MatrixProps,
  MatrixDataum,
  MatrixItemDataum,
  MatrixStackSliceDataum,
} from './type';

export const get_format_date = (date: Date): string => {
  const formatMillisecond = d3.timeFormat('.%L'),
    formatSecond = d3.timeFormat(':%S'),
    formatMinute = d3.timeFormat('%I:%M'),
    formatHour = d3.timeFormat('%I %p'),
    formatDay = d3.timeFormat('%a %d'),
    formatWeek = d3.timeFormat('%b %d'),
    formatMonth = d3.timeFormat('%B'),
    formatYear = d3.timeFormat('%Y');

  function multiFormat(date: Date) {
    return (d3.timeSecond(date) < date
      ? formatMillisecond
      : d3.timeMinute(date) < date
      ? formatSecond
      : d3.timeHour(date) < date
      ? formatMinute
      : d3.timeDay(date) < date
      ? formatHour
      : d3.timeMonth(date) < date
      ? d3.timeWeek(date) < date
        ? formatDay
        : formatWeek
      : d3.timeYear(date) < date
      ? formatMonth
      : formatYear)(date);
  }

  return multiFormat(date);
};

function Matrix<Dataum extends object = object>({
  width,
  height,
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

  React.useEffect(() => {
    if (!data) return;

    const circleSize = 20;
    const circleSpace = 24;
    const squareSize = 16;
    const squareSpace = 24;
    const rowHeight = 40;
    const duration = 0;
    const treeBoxSpace = 120;
    const axisHeight = 20;
    const barChartHeight = 160;
    const barXAxisHeight = 30;
    const barHeight = barChartHeight - barXAxisHeight;
    const noDataWidth = 300;
    const minBarWidth = 200;
    const padding = {
      top: 20,
      left: 10,
      right: 30,
      bottom: 10,
    };

    const hierarchy =
      id && parent
        ? d3
            .stratify<MatrixDataum<Dataum>>()
            .id((d, i) => id(d, i))
            .parentId((d, i) => parent(d, i))(data as MatrixDataum<Dataum>[])
        : d3.hierarchy(data as MatrixDataum<Dataum>, children);

    let nodeIdx = 0;
    hierarchy.eachBefore(d => {
      // @ts-ignore
      d.index = nodeIdx++;
    });

    let maxNameLength = 0;
    hierarchy.leaves().forEach(d => {
      const len = d.data.name.length;
      if (maxNameLength < len) maxNameLength = len;
    });
    const maxTextLength = 50;
    const maxTextWidth = (Math.min(maxNameLength, maxTextLength) * 6.5) | 0;

    // Sort the nodes.
    if (sort != null) hierarchy.sort(sort);
    const maxDepth = hierarchy
      .descendants()
      .reduce(
        (maxDepth, node) => (node.depth > maxDepth ? node.depth : maxDepth),
        0
      );

    const squareNum: number = hierarchy.data.data?.length ?? 0;
    const squareX =
      (maxDepth + 1) * (circleSize + circleSpace) + maxTextWidth + treeBoxSpace;
    const squareWidth = Math.max(
      minBarWidth,
      squareNum * (squareSize + squareSpace) || noDataWidth
    );
    const chartWidth = squareX + squareWidth + padding.left + padding.right;
    const chartHeight =
      barChartHeight +
      (hierarchy.descendants().length + (skipRootBoxes ? -1 : 0)) * rowHeight +
      padding.top +
      padding.bottom;

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
      chartWidth / (hierarchy.height + padding.left + padding.right);
    const tree = d3
      .tree<MatrixDataum<Dataum>>()
      .nodeSize([nodeSizeX, nodeSizeY]);
    const root = tree(hierarchy);
    const nodes = root.descendants();
    const links = root.links();
    const barData = root.data.data;
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

    const extent = d3.extent(barData ?? [], function(d) {
      return new Date(d.date ?? 0);
    });
    // const niceDate = (
    //   d: [undefined, undefined] | [Date, Date]
    // ): [undefined, undefined] | [Date, Date] => {
    //   const [start, end] = d;
    //   if (!start || !end) return d;
    //   const diff = start && end ? end?.getTime() - start?.getTime() : 0;
    //   const plot = (diff * 1.1 - diff) / 2;
    //   return [new Date(start.getTime() - plot), new Date(end.getTime() + plot)];
    // };
    const tickCount =
      squareNum > 4 ? Math.ceil(squareNum / 3) : Math.max(1, squareNum - 2);
    const xScale = d3
      .scaleTime()
      .domain(extent as [Date, Date])
      .range([
        (squareSpace + squareSize) / 2,
        squareWidth - (squareSpace + squareSize) / 2,
      ]);

    const xAxis = d3
      .axisTop(xScale)
      .offset(0)
      .ticks(tickCount)
      .tickPadding(10)
      .tickSize(0)
      .tickSizeOuter(0)
      .tickSizeInner(3)
      .tickFormat(date => d3.timeFormat('%b %d, %H:%M')(date as Date));

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
      if (niceXUnit === 'day') return `${day} day`;
      if (niceXUnit === 'hour') return `${hour} hour`;
      if (niceXUnit === 'min') return `${min} min`;
      if (niceXUnit === 'sec') return `${sec} sec`;
      if (niceXUnit === 'millisec') return `${millisec} millisec`;
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
    const niceXAxis = nice(maxDuration, 5);
    const niceXUnit = unit(niceXAxis);
    const niceXTicks = ticks(niceXAxis, 5);
    const yScale = d3
      .scaleLinear()
      .domain([0, niceXAxis])
      .range([barHeight, 0])
      .nice();
    const yScale2 = d3
      .scaleLinear()
      .domain([0, niceXAxis])
      .range([0, barHeight]);
    const yAxis = d3
      .axisLeft(yScale)
      .offset(0)
      .tickPadding(10)
      .tickSize(0)
      .tickSizeOuter(0)
      .tickSizeInner(0)
      .tickValues(niceXTicks)
      .tickFormat(d => format(d.valueOf()));

    const colorArr = colorMap
      ? Array.isArray(colorMap)
        ? colorMap
        : Object.entries(colorMap)
      : [];
    const colorScale = d3
      .scaleOrdinal<string | number, string>()
      .domain(colorArr.map(item => String(item[0])))
      .range(colorArr.map(item => item[1]) ?? d3.schemeCategory10);

    const svg = d3
      .select(wrapperRef.current)
      .append('svg')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('viewbox', [chartWidth, chartHeight])
      .attr('class', 'matrix')
      .style('background', '#fff');

    // render intersection start
    const intersectionRender = (
      g: d3.Selection<SVGGElement, unknown, null, undefined>
    ) => {
      g.append('g')
        .attr('class', 'intersection-x')
        .attr(
          'transform',
          `translate(${padding.left},${padding.top +
            axisHeight +
            barChartHeight})`
        )
        .attr('fill', 'none')
        .append('rect')
        .attr('class', 'rect intersection-rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', chartWidth - padding.left - padding.right)
        .attr('height', rowHeight);

      g.append('g')
        .attr('class', 'intersection-y')
        .attr(
          'transform',
          `translate(${squareX + squareSpace / 2},${padding.top + axisHeight})`
        )
        .attr('fill', 'none')
        .append('rect')
        .attr('class', 'rect intersection-rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', squareSize + squareSpace)
        .attr(
          'height',
          chartHeight - padding.top - padding.bottom - axisHeight
        );
    };
    const hoverXIntersectionG = (xIndex = 0, active = false) => {
      intersectionG
        .select('.intersection-x')
        .attr(
          'transform',
          `translate(${padding.left},${padding.top +
            axisHeight +
            barChartHeight +
            (-rowHeight / 2 + xIndex * rowHeight)})`
        )
        .attr('fill', active ? '#F5F9FF' : 'none');
    };
    const hoverYIntersectionG = (yIndex = 0, active = false) => {
      const d = barData?.find((_, i) => yIndex === i);
      const x =
        xScale(new Date(d?.date ?? 0)) -
        (squareSpace + squareSize) / 2 +
        squareX +
        padding.left;
      intersectionG
        .select('.intersection-y')
        .attr('transform', `translate(${x},${padding.top + axisHeight})`)
        .attr('fill', active ? '#F5F9FF' : 'none');
    };
    const hoverIntersectionG = (xIndex = 0, yIndex = 0, active = false) => {
      hoverXIntersectionG(xIndex, active);
      hoverYIntersectionG(yIndex, active);
    };
    const intersectionG = svg
      .append('g')
      .attr('class', 'intersection matrix-intersection')
      .call(intersectionRender, 0, 0, false);
    // render intersection end

    svg
      .append('path')
      .attr('class', 'split split-y')
      .attr('stroke', '#e5e5e5')
      .attr(
        'd',
        () =>
          `M${squareX - 50},${0}L${squareX - 50},${padding.top +
            axisHeight +
            barChartHeight +
            rowHeight -
            circleSize +
            (skipRootBoxes ? rowHeight : 0) * -1}`
      );

    // render bar chart start
    const barChartG = svg
      .append('g')
      .attr('class', 'bar matrix-bar')
      .attr(
        'transform',
        `translate(${squareX + padding.left},${padding.top + axisHeight})`
      );

    // grid
    const barGridG = barChartG.append('g').attr('class', 'grid bar-grid');
    barGridG
      .selectAll('path')
      .data(niceXTicks)
      .enter()
      .append('path')
      .attr('data-index', (_, i) => i)
      .attr('class', 'line line-x')
      .attr('stroke', '#e5e5e5')
      .attr('d', d => `M${0},${yScale2(d)}L${squareWidth},${yScale2(d)}`);

    barChartG
      .append('g')
      .attr('class', 'axis x-axis')
      .call(xAxis);
    barChartG
      .append('g')
      .attr('class', 'axis y-axis')
      .call(yAxis);

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
      .attr(
        'transform',
        d => `translate(${xScale(new Date(d.date ?? 0))},${0})`
      );
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
      .data(d => d.slices ?? [])
      .enter()
      .append('g')
      .attr('class', 'bar-item-slice')
      .attr('data-index', (_, i) => i)
      .attr('transform', function(_, i) {
        if (this.parentNode) {
          const d = d3
            // @ts-ignore
            .select<d3.BaseType, MatrixItemDataum<Dataum>>(this.parentNode)
            .datum();
          const duration = d?.slices
            ?.slice(0, i + 1)
            .reduce((acc, item) => acc + (item.duration ?? 0), 0);
          return `translate(${-squareSize / 2},${barHeight -
            yScale2(duration ?? 0)})`;
        }
        return `translate(0,${0})`;
      })
      .append('rect')
      .attr('class', 'box bar-item-box')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', squareSize)
      .attr('height', d => Math.max(1, yScale2(d.duration ?? 0)))
      .attr('class', d => `status-${d.status}`)
      .attr('fill', d => colorScale(String(d.status)))
      .style('cursor', 'pointer')
      .on('mouseover', function(evt, d) {
        hoverBarSliceHandler(this, evt, d, true);

        popupHoverRef.current = true;
        setPopup({
          visible: true,
          event: evt,
          d: d,
        });
      })
      .on('mouseout', function(evt, d) {
        hoverBarSliceHandler(this, evt, d, false);

        popupHoverRef.current = false;
        setTimeout(() => {
          if (!popupHoverRef.current)
            setPopup(pre => ({
              ...pre,
              visible: false,
            }));
        }, 300);
      })
      .on('click', function(evt, d) {
        onBoxClick && onBoxClick((d3.select(this) as unknown) as never, evt, d);
      });
    // render bar chart end

    // render tree chart start
    const treeG = svg
      .append('g')
      .attr('class', 'tree matrix-tree')
      .attr(
        'transform',
        `translate(${padding.left},${padding.top +
          axisHeight +
          barChartHeight +
          (skipRootBoxes ? rowHeight : 0) * -1})`
      );

    // grid
    const treeGridG = treeG.append('g').attr('class', 'grid tree-grid');
    treeGridG
      .selectAll('path')
      .data(nodes)
      .enter()
      .append('path')
      .attr('data-index', (_, i) => i)
      .attr('class', 'line line-x')
      .attr('stroke', '#e5e5e5')
      .attr(
        'd',
        (_, i) =>
          `M${0},${(i + 1) * rowHeight - rowHeight / 2}L${chartWidth -
            squareSpace -
            padding.right},${(i + 1) * rowHeight - rowHeight / 2}`
      );

    // Add the arrowhead marker definition to the svg element
    const markerMap = new Map<string, number>();
    svg
      .append('defs')
      .selectAll('marker')
      .data(links)
      .enter()
      .append('marker')
      .attr('id', (_, i) => `arrow-${i}`)
      .attr('class', (_, i) => `marker marker-${i}`)
      .attr('data-index', (d, i) => {
        markerMap.set(`${d.source.id}-${d.target.id}`, i);
        return i;
      })
      .attr('viewBox', [0, 0, arrowSize, arrowSize])
      .attr('refX', arrowSize / 2)
      .attr('refY', arrowSize / 2)
      .attr('markerWidth', arrowSize)
      .attr('markerHeight', arrowSize)
      .attr('orient', 90) // 'auto-start-reverse'
      .append('path')
      .attr('d', d3.line()(arrowPoints))
      .attr('stroke', '#D9D9D9')
      .attr('fill', '#D9D9D9');

    // links
    // const curve = d3.line().curve()
    const link = d3
      .linkHorizontal()
      .x(d => d[0])
      .y(d => d[1]);
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
      .attr('stroke', '#D9D9D9')
      .style('cursor', 'pointer')
      .attr('stroke-width', 1)
      .attr('marker-start', (_, i) => `url(#arrow-${i})`)
      .on('mouseover', function(_, d) {
        d3.select(this)
          .attr('stroke', '#2673DD')
          .attr('stroke-width', 2);

        const i = markerMap.get(`${d.source.id}-${d.target.id}`);
        if (i != null) {
          svg
            .select(`marker#arrow-${i}`)
            .select('path')
            .attr('stroke', '#2673DD')
            .attr('fill', '#2673DD')
            .style('position', 'relative')
            .style('z-index', 10);
        }
      })
      .on('mouseout', function(_, d) {
        d3.select(this)
          .attr('stroke', '#D9D9D9')
          .attr('stroke-width', 1);
        const i = markerMap.get(`${d.source.id}-${d.target.id}`);
        if (i != null) {
          svg
            .select(`marker#arrow-${i}`)
            .select('path')
            .attr('stroke', '#D9D9D9')
            .attr('fill', '#D9D9D9')
            .style('position', '')
            .style('z-index', '');
        }
      })
      .transition()
      .duration(duration)
      .attr('d', d => {
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
      .attr('data-index', d => (skipRootBoxes ? d.index - 1 : d.index))
      .attr('class', d => `node node-${d.data.id}`);

    nodeG
      .transition()
      .duration(duration)
      .attr(
        'transform',
        d =>
          //@ts-ignore
          `translate(${d.depth * (circleSize + circleSpace)},${d.index *
            rowHeight})`
      );

    const treeRepeatedNodeMap = new Map<string | number, string | number>();
    nodeG
      .append('circle')
      .attr('class', () => `circle node-circle`)
      .attr('cx', () => circleSize / 2)
      .attr('cy', () => 0)
      .attr('r', circleSize / 2)
      .attr('stroke', d => (d.parent ? '#BFBFBF' : '#262626'))
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', d => {
        const id = d.data.oid ?? d.data.id;
        const repeated = !!treeRepeatedNodeMap.get(id as string | number);
        treeRepeatedNodeMap.set(id, id);
        if (repeated) return [3, 2];
        return 'none';
      })
      .attr('fill', '#fff')
      .style('cursor', 'pointer')
      .on('mouseover', function(evt, d) {
        d3.select(this)
          .attr('stroke', '#2673DD')
          .attr('stroke-width', 2);
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
      .on('mouseout', function(_, d) {
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
            setPopup(pre => ({
              ...pre,
              visible: false,
            }));
        }, 300);
      })
      .on('click', function(evt, d) {
        onTreeNodeClick &&
          onTreeNodeClick((d3.select(this) as unknown) as never, evt, d);
      });

    nodeG
      .append('image')
      .attr('x', () => circleSize + 7 + arrowSize)
      .attr('y', () => -7)
      .attr('href', d => {
        const s = d.data.d && new TaskStatusConstructor(d.data.d).status;
        return TaskStatusConstructor.getImg(s) ?? '';
      });

    nodeG
      .append('text')
      .attr('dy', '0.32em')
      .attr('dx', d => {
        const s = d.data.d && new TaskStatusConstructor(d.data.d).status;
        const img = TaskStatusConstructor.getImg(s) ?? '';
        return circleSize + 7 + arrowSize + (img ? 18 : 0);
      })
      // .attr('title', d => d.data.name)
      .attr('path', d =>
        d
          .ancestors()
          .reverse()
          .map(d => d.data.name)
          .join('/')
      )
      .text(d => ellipsis(d.data.name ?? '', maxTextLength));
    // nodeG.append('title').text(d => d.data.name);

    const nodeBoxG = nodeG
      .filter(d => (skipRootBoxes ? d.parent != null : true))
      .append('g')
      .attr('class', 'boxes')
      .attr(
        'transform',
        d => `translate(${squareX - d.depth * (circleSize + circleSpace)},0)`
      )
      .selectAll('g')
      .data(d => d.data.data ?? [])
      .enter()
      .append('g')
      .attr('data-index', (_, i) => i)
      .attr('class', () => `box-group`)
      .attr('transform', d => `translate(${xScale(new Date(d.date ?? 0))},0)`);
    // nodeBoxG.append('title').text(d => d.name ?? '');

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

      const xIndex = self.parentElement?.parentElement?.parentElement
        ? Number(
            d3
              .select(self.parentElement?.parentElement?.parentElement)
              .attr('data-index')
          ) | 0 ?? 0
        : 0;
      const yIndex = self.parentElement
        ? Number(d3.select(self.parentElement).attr('data-index')) | 0 ?? 0
        : 0;
      hoverIntersectionG(xIndex, yIndex, hover);
    };

    nodeBoxG
      .append('rect')
      .attr('class', d => `box status-${d.status}`)
      .attr('x', -squareSize / 2)
      .attr('y', -squareSize / 2)
      .attr('width', squareSize)
      .attr('height', squareSize)
      .attr('fill', d =>
        d.status != null ? colorScale(String(d.status)) : '#fff'
      )
      .attr('stroke', d =>
        d.status != null ? colorScale(String(d.status)) : '#aaa'
      )
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function(evt, d) {
        hoverBoxHandler(this, evt, d, true);

        popupHoverRef.current = true;
        setPopup({
          visible: true,
          event: evt,
          d: d,
        });
      })
      .on('mouseout', function(evt, d) {
        hoverBoxHandler(this, evt, d, false);

        popupHoverRef.current = false;
        setTimeout(() => {
          if (!popupHoverRef.current)
            setPopup(pre => ({
              ...pre,
              visible: false,
            }));
        }, 300);
      })
      .on('click', function(evt, d) {
        onBoxClick && onBoxClick((d3.select(this) as unknown) as never, evt, d);
      });

    // render tree chart end

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
      setPopup(pre => ({
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
