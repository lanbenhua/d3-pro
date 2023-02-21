import React from 'react';
import * as d3 from 'd3';
import cls from 'classnames';
import TaskStatusConstructor from 'biz/bizcommon/task-status';
import Popup from 'components/antd/popup';
import { TreeDataum, TreeProps } from './type';
import { getLetterWidth } from 'lib/graph/utils/getWidthUtil';

function Tree<Dataum extends object = object>({
  width,
  height,
  data,
  id,
  parent,
  children,
  sort,
  className,
  style,
  onNodeClick,
  popupRender,
}: TreeProps<Dataum>) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const popupHoverRef = React.useRef<boolean>(false);

  const [popup, setPopup] = React.useState<{
    visible: boolean;
    event?: MouseEvent;
    d?: TreeDataum<Dataum>;
  }>({
    visible: false,
    event: undefined,
    d: undefined,
  });

  React.useEffect(() => {
    if (!data) return;

    const circleSize = 20,
      circleSpace = 24,
      rowHeight = 40,
      duration = 0,
      padding = {
        top: 10,
        left: 10,
        right: 10,
        bottom: 10,
      };

    const hierarchy =
      id && parent
        ? d3
            .stratify<TreeDataum<Dataum>>()
            .id((d, i) => id(d, i))
            .parentId((d, i) => parent(d, i))(data as TreeDataum<Dataum>[])
        : d3.hierarchy(data as TreeDataum<Dataum>, children);

    // Sort the nodes.
    if (sort != null) hierarchy.sort(sort);

    let nodeIdx = 0;
    hierarchy.eachBefore((d) => {
      // @ts-ignore
      d.index = nodeIdx++;
    });

    let maxTreeContentWidth = 0;
    hierarchy.descendants().forEach((d) => {
      const textWidth = getLetterWidth(d.data.name, 14);
      const w = (d.depth + 1) * (circleSize + circleSpace) + textWidth;
      if (w > maxTreeContentWidth) maxTreeContentWidth = w;
    });

    const chartWidth = Math.ceil(
      maxTreeContentWidth + padding.left + padding.right
    );
    const chartHeight = Math.ceil(
      hierarchy.descendants().length * rowHeight + padding.top + padding.bottom
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
      10 || chartWidth / (hierarchy.height + padding.left + padding.right);
    const tree = d3.tree<TreeDataum<Dataum>>().nodeSize([nodeSizeX, nodeSizeY]);
    const root = tree(hierarchy);
    const nodes = root.descendants();
    const links = root.links();

    const svg = d3
      .select(wrapperRef.current)
      .append('svg')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('viewbox', [chartWidth, chartHeight])
      .attr('class', 'tree')
      .style('background', '#fff');

    // render intersection start
    const intersectionRender = (
      g: d3.Selection<SVGGElement, unknown, null, undefined>
    ) => {
      g.append('g')
        .attr('class', 'intersection-x')
        .attr('transform', `translate(${padding.left},${padding.top})`)
        .attr('fill', 'none')
        .append('rect')
        .attr('class', 'rect intersection-rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', chartWidth - padding.left)
        .attr('height', rowHeight);
    };
    const hoverXIntersectionG = (xIndex = 0, active = false) => {
      intersectionG
        .select('.intersection-x')
        .attr(
          'transform',
          `translate(${padding.left},${padding.top + xIndex * rowHeight})`
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
        `translate(${padding.left},${padding.top + rowHeight / 2})`
      );

    // grid
    const treeGridG = treeG.append('g').attr('class', 'grid');
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
          `M${0},${(i + 1) * rowHeight - rowHeight / 2}L${
            chartWidth - padding.left
          },${(i + 1) * rowHeight - rowHeight / 2}`
      );

    // Add the arrowhead marker definition to the svg element
    const arrowMarkerMap = new Map<string, number>();
    svg
      .append('defs')
      .selectAll('marker')
      .data(links)
      .enter()
      .append('marker')
      .attr('id', (_, i) => `arrow-${i}`)
      .attr('class', (_, i) => `arrow arrow-${i}`)
      .attr('data-index', (d, i) => {
        arrowMarkerMap.set(`${d.source.id}-${d.target.id}`, i);
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
      .attr('marker-start', (_, i) => `url(#arrow-${i})`)
      .on('mouseover', function (_, d) {
        d3.select(this).attr('stroke', '#2673DD').attr('stroke-width', 2);

        const i = arrowMarkerMap.get(`${d.source.id}-${d.target.id}`);
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
      .on('mouseout', function (_, d) {
        d3.select(this).attr('stroke', '#D9D9D9').attr('stroke-width', 1);
        const i = arrowMarkerMap.get(`${d.source.id}-${d.target.id}`);
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
      .attr('class', (d) => `node node-${d.data.id}`);

    nodeG
      .transition()
      .duration(duration)
      .attr(
        'transform',
        (d) =>
          //@ts-ignore
          `translate(${d.depth * (circleSize + circleSpace)},${
            d.index * rowHeight
          })`
      );

    const treeRepeatedNodeMap = new Map<string | number, string | number>();
    nodeG
      .append('circle')
      .attr('class', () => `circle node-circle`)
      .attr('cx', () => circleSize / 2)
      .attr('cy', () => 0)
      .attr('r', circleSize / 2)
      .attr('stroke', (d) => (d.parent ? '#BFBFBF' : '#262626'))
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', (d) => {
        const id = d.data.oid ?? d.data.id;
        const repeated = !!treeRepeatedNodeMap.get(id as string | number);
        treeRepeatedNodeMap.set(id, id);
        if (repeated) return [3, 2];
        return 'none';
      })
      .attr('fill', '#fff')
      .style('cursor', 'pointer')
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
        onNodeClick &&
          onNodeClick(
            d3.select(this) as unknown as d3.Selection<
              d3.BaseType,
              TreeDataum<Dataum>,
              d3.BaseType,
              TreeDataum<Dataum>
            >,
            evt,
            d
          );
      });

    nodeG
      .append('image')
      .attr('x', () => circleSize + 7 + arrowSize)
      .attr('y', () => -7)
      .attr('href', (d) => {
        const s = d.data.d && new TaskStatusConstructor(d.data.d).status;
        return TaskStatusConstructor.getImg(s) ?? '';
      });

    nodeG
      .append('text')
      .attr('dy', '0.32em')
      .attr('dx', (d) => {
        const s = d.data.d && new TaskStatusConstructor(d.data.d).status;
        const img = TaskStatusConstructor.getImg(s) ?? '';
        return circleSize + 7 + arrowSize + (img ? 18 : 0);
      })
      // .attr('title', d => d.data.name)
      .attr('path', (d) =>
        d
          .ancestors()
          .reverse()
          .map((d) => d.data.name)
          .join('/')
      )
      .text((d) => d.data.name ?? '');
    // nodeG.append('title').text(d => d.data.name);

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
      className={cls('tree-wrapper', className)}
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
        className="tree-popup"
        getPopContainer={popupRef.current ?? undefined}
      >
        {popupRender && popupRender(popup.d)}
      </Popup>
    </div>
  );
}

export default Tree;
export * from './type';
