import React, { useRef, useState, useEffect } from 'react';
import * as d3 from 'd3';
import * as datetime from 'utils/datetime';
import Popup from 'components/antd/popup';
import DOM from '../utils/dom';
import './index.less';

type NumberValue = number | { valueOf(): number };
type DomainValue = string | Date | NumberValue;
export type Period<P> = {
  name: string;
  color?: string;
  start: Date | NumberValue;
  end: Date | NumberValue;
  d?: P;
};
export type Cell<T, P> = {
  root?: boolean;
  name: string;
  periods: Period<P>[];
  d?: T;
};
export type Lengend = {
  name: string;
  color: string;
  shape?: 'circle' | 'rect';
};
export type ColorCell = {
  name: string;
  color: string;
};

const DEFAULT_MINIUM_CELL_WIDTH = 2;
const DEFAULT_MARGIN = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10,
};
function DEFAULT_X_SCALE_MAPPER<T, P>(
  data: Cell<T, P>[]
): [Date | NumberValue, Date | NumberValue] {
  const now = new Date();
  let lowestDate: Date | null = null;
  let highestDate: Date | null = null;
  data.forEach(item => {
    item.periods.forEach(period => {
      if (!lowestDate || +new Date(+period.start) < +lowestDate)
        lowestDate = new Date(+period.start);
      if (!highestDate || +new Date(+period.end) > +highestDate)
        highestDate = new Date(+period.end);
    });
  });
  if (!lowestDate) lowestDate = now;
  if (!highestDate) highestDate = now;
  return [lowestDate, highestDate];
}
function DEFAULT_Y_SCALE_MAPPER<T, P>(d: Cell<T, P>[]): string[] {
  return d.map(item => item.name);
}
function DEFAULT_TOOLTIP_RENDER<P>(data: Period<P>) {
  return (
    <div style={{ width: 'auto', padding: 10 }}>
      <h2>{data.name}</h2>
      <div>
        <span>{datetime.format(new Date(+data.start))}</span>
        <span>{datetime.format(new Date(+data.end))}</span>
      </div>
    </div>
  );
}

interface GanttProps<T, P> {
  className?: string;
  style?: React.CSSProperties;
  width?: string | number;
  height?: string | number;
  data: Cell<T, P>[];
  lengends?: Lengend[];
  colors?: ColorCell[];
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  mininumCellWidth?: number;
  onCellClick?: (evt: MouseEvent, d: Cell<T, P>) => void;
  onXAxisClick?: (evt: MouseEvent, d: Date | NumberValue) => void;
  onYAxisClick?: (evt: MouseEvent, d: Cell<T, P>) => void;
  onCellPeriodClick?: (evt: MouseEvent, d: Period<P>) => void;
  xScaleMapper?: (d: Cell<T, P>[]) => [Date | NumberValue, Date | NumberValue];
  yScaleMapper?: (d: Cell<T, P>[]) => DomainValue[];
  tooltipRender?: (d: Period<P>) => React.ReactElement;
}

function Gantt<T, P>(props: GanttProps<T, P>) {
  const {
    className,
    style,
    width = '100%',
    height = '100%',
    data,
    colors,
    lengends,
    mininumCellWidth = DEFAULT_MINIUM_CELL_WIDTH,
    margin = DEFAULT_MARGIN,
    onCellClick,
    onXAxisClick,
    onYAxisClick,
    onCellPeriodClick,
    xScaleMapper = DEFAULT_X_SCALE_MAPPER,
    yScaleMapper = DEFAULT_Y_SCALE_MAPPER,
    tooltipRender = DEFAULT_TOOLTIP_RENDER,
  } = props;

  const [popup, setPopup] = useState<{
    visible: boolean;
    event?: MouseEvent;
    d?: Period<P>;
  }>({
    visible: false,
    event: undefined,
    d: undefined,
  });

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapperRef.current) {
      const rect = DOM.rect(wrapperRef.current);
      const { width, height } = rect;

      const longestName = data.reduce<string>(
        (longest: string, item: Cell<T, P>) => {
          if (item.name.length > longest.length) {
            return item.name;
          }
          return longest;
        },
        ''
      );

      // variables
      // const lineDash = '5, 10';
      // const lineColor = '#D0D0D0';
      const xAxisHeight = 24; // x-axis height
      // y-axis height
      const yAxisWidth = Math.min(
        400,
        Math.max(longestName.length * 7 + 10, 80)
      );
      const brushOffset = 16; // offset between brush and x-axis
      const brushHeight = 30; // brush height
      const lengendHeight = lengends ? 20 : 0; // lengend height
      const ganttBbox = {
        top: margin.top + lengendHeight,
        left: margin.left + yAxisWidth,
        right: margin.right,
        bottom: brushHeight + brushOffset,
        width: width - margin.left - margin.right - yAxisWidth,
        height:
          height -
          margin.top -
          margin.bottom -
          lengendHeight -
          brushHeight -
          brushOffset -
          xAxisHeight,
      };
      const brushBbox = {
        top: height - margin.bottom - brushHeight,
        left: margin.left + yAxisWidth,
        right: margin.right,
        bottom: margin.bottom,
        width: width - margin.left - margin.right - yAxisWidth,
        height: brushHeight,
      };
      const laneHeight = Math.min(
        12,
        data.length ? Math.floor((ganttBbox.height / data.length) * 0.8) : 12
      );
      const brushLaneHeight =
        Math.floor((laneHeight / ganttBbox.height) * brushBbox.height * 10) /
        10;
      // Math.min(
      //   2,
      //   data.length ? Math.floor((brushBbox.height / data.length) * 0.8) : 2
      // );

      const colorScale = d3
        .scaleOrdinal(colors?.map(color => color.color) || d3.schemeCategory10)
        .domain(colors?.map(color => color.name) || data.map(d => d.name));

      const xScale = d3
        .scaleTime<number>()
        .domain(xScaleMapper(data))
        .range([0, ganttBbox.width]);
      const yScale = d3
        .scaleBand<DomainValue>()
        .round(true)
        .align(0.5)
        .padding(1)
        .domain(yScaleMapper(data))
        .range([0, ganttBbox.height]);
      const xScale2 = d3
        .scaleTime<number>()
        .domain(xScale.domain())
        .range([0, brushBbox.width]);
      const yScale2 = d3
        .scaleBand<DomainValue>()
        .round(true)
        .align(0.5)
        .padding(1)
        .domain(yScale.domain())
        .range([0, brushBbox.height]);
      const xAxis = d3
        .axisBottom<Date | NumberValue>(xScale)
        // .ticks(10)
        .offset(0)
        .tickPadding(5)
        .tickFormat(v => {
          return d3.timeFormat('%H:%M:%S')(v as Date);
        });
      const yAxis = d3
        .axisLeft<DomainValue>(yScale)
        .ticks(data.length + 1)
        .offset(0)
        .tickPadding(10)
        .tickSizeOuter(0)
        .tickSizeInner(0)
        .tickFormat(v => String(v));

      // const xAxis2 = d3
      //   .axisBottom(xScale2)
      //   // .ticks(10)
      //   .offset(0)
      //   .tickPadding(5)
      //   .tickFormat((v, index) => {
      //     // console.log(`v`, v, `index`, index);
      //     // %d %b %H:%M:%S
      //     return (
      //       d3.timeFormat('%H:%M:%S')(v as Date) +
      //       (index === 0 ? '(UTC+8)' : '')
      //     );
      //   });
      // const yAxis2 = d3
      //   .axisLeft(yScale2)
      //   // .tickValues(data.map(item => item.name))
      //   .ticks(data.length + 1)
      //   .offset(0)
      //   .tickPadding(3)
      //   .tickSizeOuter(0)
      //   .tickSizeInner(0);

      const defaultSelection = [xScale2.range()[0], xScale2.range()[1]];
      const brush = d3
        .brushX()
        .extent([
          [0, 0],
          [width - margin.right - margin.left - yAxisWidth, brushHeight],
        ])
        .on('brush', ({ selection }) => {
          if (selection) {
            const ex = selection.map(xScale2.invert, xScale2);
            xScale.domain(ex);
            ganttGroup.select('.lanes').call(ganttLanes, data);
            ganttGroup.select('.x-axis').call(xAxis as never);
          }
        });

      const svg = d3.select(wrapperRef.current).append('svg');

      svg
        .attr('viewBox', `0 0 ${width}, ${height}`)
        .attr('width', `${width}`)
        .attr('height', `${height}`);

      svg
        .append('defs')
        .append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', ganttBbox.width)
        .attr('height', ganttBbox.height);

      // add lengend
      if (lengends) {
        const lengendGroup = svg
          .append('g')
          .attr('class', 'lengends')
          .attr('fill', 'none')
          .attr('transform', `translate(${margin.left}, ${margin.top})`)
          .selectAll('.lengend')
          .data(lengends)
          .join('g')
          .attr('class', 'lengendItem')
          .attr('fill', 'none')
          .attr('transform', (_, index) => `translate(${index * 90}, ${0})`);

        lengendGroup
          .append('circle')
          .attr('x', () => 0)
          .attr('y', () => 0)
          .attr('r', () => 4)
          .attr('fill', d => d.color || colorScale(d.name));
        lengendGroup
          .append('text')
          .attr('x', 10)
          .attr('y', 5)
          .attr('fill', () => 'currentColor')
          .text(d => d.name);
      }

      // add gantt
      const ganttGroup = svg
        .append('g')
        .attr('class', 'gantt')
        .attr('fill', 'none')
        .attr('transform', `translate(${ganttBbox.left}, ${ganttBbox.top})`);

      // X Axis and Ticks
      ganttGroup
        .append('g')
        .attr('class', 'gantt x-axis')
        .attr('transform', `translate(1, ${ganttBbox.height})`)
        .call(xAxis)
        .on('click', evt => {
          if (evt.target.nodeType === 1 && evt.target.nodeName === 'text') {
            onXAxisClick?.(evt, evt.target.__data__);
          }
        });

      // // x Divider lines
      // ganttGroup
      //   .append('g')
      //   .attr('class', 'x-dividers')
      //   .selectAll('.divider')
      //   .data(xScale.ticks().slice())
      //   .enter()
      //   .append('line')
      //   .attr('class', 'divider')
      //   .attr('x1', d => xScale(d))
      //   .attr('x2', d => xScale(d))
      //   .attr('y1', margin.top)
      //   .attr('y2', height - margin.bottom - xAxisHeight - brushHeight)
      //   .attr('stroke', lineColor)
      //   .attr('stroke-dasharray', lineDash);

      // Y Axis and Ticks
      ganttGroup
        .append('g')
        .attr('class', 'gantt y-axis')
        .datum(data)
        .on('click', function(evt, d) {
          const nodes = d3
            .select(this)
            .selectAll('g.tick')
            .nodes();
          const i =
            nodes.findIndex(node => node === evt.target.parentNode) ?? 0;
          const _d = d[i];
          if (evt.target.nodeType === 1 && evt.target.nodeName === 'text') {
            onYAxisClick?.(evt, _d);
          }
        })
        .call(yAxis);
      // .on('mouseenter', function(ev, d) {
      //   console.log(`y-axis mouseenter`, d3.select(this), ev, d);
      // })
      // .on('mouseleave', function(ev, d) {
      //   console.log(`y-axis mouseleave`, d3.select(this), ev, d);
      // });

      // set text bold for root in y-axis
      const rootIdx = data.findIndex(item => item.root);
      if (rootIdx > -1) {
        d3.selectAll('.gantt.y-axis .tick')
          .select('text')
          .attr('font-weight', (_, i) => {
            if (i === rootIdx) return '600';
            return '400';
          });
      }

      // y Divider lines
      // ganttGroup
      //   .append('g')
      //   .attr('class', 'y-dividers')
      //   .selectAll('.divider')
      //   .data(data)
      //   .enter()
      //   .append('line')
      //   .attr('class', 'divider')
      //   .attr('x1', margin.left + 50)
      //   .attr('x2', width - margin.right)
      //   .attr('y1', d => yScale(d.name) as number)
      //   .attr('y2', d => yScale(d.name) as number)
      //   .attr('stroke', lineColor)
      //   .attr('stroke-dasharray', lineDash);

      // const eventsGroup = ganttGroup
      //   .append('g')
      //   .attr('class', 'period-group')
      //   .attr(
      //     'transform',
      //     `translate(${margin.left + margin.right}, ${margin.top})`
      //   );

      // const cells = eventsGroup
      //   .selectAll('.cell')
      //   .data(data)
      //   .enter()
      //   .append('g')
      //   .attr('class', 'cell');
      // // .attr('transform', (d, i) => (yScale(d.name) as number) - 3);

      const ganttLanesGroup = ganttGroup
        .append('g')
        .attr('class', 'lanes')
        .attr('clip-path', 'url(#clip)');

      const ganttLanes = (
        selection: d3.Selection<d3.BaseType, unknown, null, undefined>,
        data: Cell<T, P>[]
      ) => {
        const laneGroup = selection
          .selectAll('.lane-group')
          .data(data)
          .join('g')
          .attr('class', 'gantt lane-group')
          .attr(
            'transform',
            d => `translate(0, ${(yScale(d.name) as number) - laneHeight / 2})`
          )
          .on('click', (evt, d) => {
            if (onCellClick) onCellClick(evt, d);
          });

        laneGroup
          .selectAll('.lane')
          .data(d => d.periods)
          .join('rect')
          .attr('class', 'gantt lane')
          .style('cursor', 'pointer')
          .attr('x', d => xScale(d.start))
          .attr('width', d => {
            const w = xScale(d.end) - xScale(d.start);
            return Math.max(mininumCellWidth, w);
          })
          .attr('y', 0)
          .attr('height', laneHeight)
          .attr('fill', d => d.color || colorScale(d.name))
          .on('click', (evt, d) => {
            if (onCellPeriodClick) onCellPeriodClick(evt, d);
          })
          .on('mouseover', function(evt, d) {
            const h = 6;
            d3.select(this)
              .attr('y', () => -h / 2)
              .attr('height', laneHeight + h);
            setPopup({
              visible: true,
              event: evt,
              d: d,
            });
          })
          .on('mousemove', function(evt, d) {
            setPopup({
              visible: true,
              event: evt,
              d: d,
            });
          })
          .on('mouseout', function(evt, d) {
            d3.select(this)
              .attr('y', () => 0)
              .attr('height', laneHeight);
            setPopup({
              visible: false,
              event: evt,
              d: d,
            });
          })
          .on('mouseleave', function(evt, d) {
            d3.select(this)
              .attr('y', () => 0)
              .attr('height', laneHeight);
            setPopup({
              visible: false,
              event: evt,
              d: d,
            });
          });
      };

      ganttLanesGroup.call(ganttLanes as never, data);

      // add brush
      const brushGroup = svg
        .append('g')
        .attr('class', 'brush')
        .attr('fill', 'none')
        .attr('transform', `translate(${brushBbox.left}, ${brushBbox.top})`);

      // brushGroup
      //   .append('g')
      //   .attr('class', 'brush x-axis')
      //   .attr('transform', `translate(0, ${brushBbox.height})`)
      //   .call(xAxis2);

      const ganttLanes2 = (
        selection: d3.Selection<d3.BaseType, unknown, null, undefined>,
        data: Cell<T, P>[]
      ) => {
        const laneGroup = selection
          .selectAll('.lane-group')
          .data(data)
          .join('g')
          .attr('class', 'brush lane-group')
          .attr(
            'transform',
            d =>
              `translate(0, ${(yScale2(d.name) as number) -
                brushLaneHeight / 2})`
          );

        laneGroup
          .selectAll('.lane')
          .data(d => d.periods)
          .join('rect')
          .attr('class', 'brush lane')
          .attr('x', d => xScale2(d.start))
          .attr('width', d => {
            const w = xScale2(d.end) - xScale2(d.start);
            return Math.max(mininumCellWidth, w);
          })
          .attr('y', 0)
          .attr('height', brushLaneHeight)
          .attr('fill', d => d.color || colorScale(d.name));
      };

      brushGroup
        .append('g')
        .attr('class', 'brush lanes')
        .call(ganttLanes2 as never, data);

      brushGroup
        .append('g')
        .attr('stroke', '#ddd')
        .call(brush)
        .call(brush.move, defaultSelection);

      return () => {
        svg.remove();
      };
    }
  }, [data]);

  return (
    <div
      className={className}
      style={{ ...style, width: '100%', height: '100%' }}
    >
      <div style={{ width: width, height: height }} ref={wrapperRef}></div>
      <Popup
        visible={popup.visible}
        event={popup.event}
        offset={5}
        className="gantt-popup"
      >
        {popup.d && tooltipRender<P>(popup.d)}
      </Popup>
    </div>
  );
}

export default Gantt;
