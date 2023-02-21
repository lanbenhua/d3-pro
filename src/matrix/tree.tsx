// $('span.status_square').tooltip({ html: true });

// var numRuns = 2;
// var data = {
//   name: '[DAG]',
//   children: [
//     {
//       name: 'email',
//       instances: [
//         {
//           task_id: 'email',
//           dag_id: '10.128.152.193_test_dag',
//           execution_date: '2020-03-17T04:30:00+00:00',
//           start_date: '2022-08-02T11:42:30.208857+00:00',
//           end_date: '2022-08-02T11:42:30.208898+00:00',
//           duration: null,
//           state: 'upstream_failed',
//           try_number: 1,
//           max_tries: 3,
//           hostname: '',
//           unixname: 'airflow',
//           job_id: null,
//           pool: 'regbida_airpay',
//           queue: 'default',
//           priority_weight: 1,
//           operator: 'EmailOperator',
//           queued_dttm: null,
//           pid: null,
//           executor_config: {},
//           remote_pid: null,
//           external_trigger: false,
//         },
//         {
//           task_id: 'email',
//           dag_id: '10.128.152.193_test_dag',
//           execution_date: '2022-08-02T04:30:00+00:00',
//           start_date: '2022-08-03T05:59:12.112675+00:00',
//           end_date: '2022-08-03T05:59:12.112708+00:00',
//           duration: null,
//           state: 'upstream_failed',
//           try_number: 1,
//           max_tries: 3,
//           hostname: '',
//           unixname: 'airflow',
//           job_id: null,
//           pool: 'regbida_airpay',
//           queue: 'default',
//           priority_weight: 1,
//           operator: 'EmailOperator',
//           queued_dttm: null,
//           pid: null,
//           executor_config: {},
//           remote_pid: null,
//           external_trigger: false,
//         },
//       ],
//       children: [
//         {
//           name: 'run_test_file',
//           instances: [
//             {
//               task_id: 'run_test_file',
//               dag_id: '10.128.152.193_test_dag',
//               execution_date: '2020-03-17T04:30:00+00:00',
//               start_date: '2022-08-02T11:42:23.284902+00:00',
//               end_date: '2022-08-02T11:42:28.551229+00:00',
//               duration: 5.26633,
//               state: 'failed',
//               try_number: 7,
//               max_tries: 5,
//               hostname: '5f6df28b62cb',
//               unixname: 'airflow',
//               job_id: 413560267,
//               pool: 'regbida_airpay',
//               queue: 'default',
//               priority_weight: 2,
//               operator: 'SSHOperator',
//               queued_dttm: '2022-08-02T11:42:17.480023+00:00',
//               pid: 28624,
//               executor_config: {},
//               remote_pid: null,
//               external_trigger: false,
//             },
//             {
//               task_id: 'run_test_file',
//               dag_id: '10.128.152.193_test_dag',
//               execution_date: '2022-08-02T04:30:00+00:00',
//               start_date: '2022-08-03T05:58:49.307172+00:00',
//               end_date: '2022-08-03T05:58:52.347416+00:00',
//               duration: 3.04024,
//               state: 'failed',
//               try_number: 7,
//               max_tries: 5,
//               hostname: '74b25182d930',
//               unixname: 'airflow',
//               job_id: 414086408,
//               pool: 'regbida_airpay',
//               queue: 'default',
//               priority_weight: 2,
//               operator: 'SSHOperator',
//               queued_dttm: '2022-08-03T05:58:46.342285+00:00',
//               pid: 13875,
//               executor_config: {},
//               remote_pid: null,
//               external_trigger: false,
//             },
//           ],
//           children: [],
//           num_dep: 0,
//           operator: 'SSHOperator',
//           retries: 5,
//           owner: 'regbida_airpay',
//           start_date: '2022-08-02T00:00:00+00:00',
//           end_date: null,
//           depends_on_past: false,
//           ui_color: '#fff',
//         },
//       ],
//       num_dep: 1,
//       operator: 'EmailOperator',
//       retries: 3,
//       owner: 'regbida_airpay',
//       start_date: '2022-08-02T00:00:00+00:00',
//       end_date: null,
//       depends_on_past: false,
//       ui_color: '#e6faf9',
//     },
//   ],
//   instances: [
//     {
//       id: 55765164,
//       dag_id: '10.128.152.193_test_dag',
//       execution_date: '2020-03-17T04:30:00+00:00',
//       start_date: '2022-08-02T10:26:00.904695+00:00',
//       end_date: '2022-08-02T11:42:44.435184+00:00',
//       state: 'failed',
//       run_id: 'scheduled__2020-03-17T04:30:00+00:00',
//       external_trigger: false,
//       conf: null,
//       run_date: '2020-03-18T04:30:00+00:00',
//     },
//     {
//       id: 55789942,
//       dag_id: '10.128.152.193_test_dag',
//       execution_date: '2022-08-02T04:30:00+00:00',
//       start_date: '2022-08-03T04:30:00.418832+00:00',
//       end_date: '2022-08-03T05:59:58.540263+00:00',
//       state: 'failed',
//       run_id: 'scheduled__2022-08-02T04:30:00+00:00',
//       external_trigger: false,
//       conf: null,
//       run_date: '2022-08-03T04:30:00+00:00',
//     },
//   ],
// };
// recursion_sort(data);
// var max_level = 2;
// var max_length = 13;
// var barHeight = 20;
// var axisHeight = 40;
// var square_x = (max_level + 1) * 25 + 6.5 * max_length;
// var square_size = 10;
// var square_spacing = 2;
// var margin = {
//     top: barHeight / 2 + axisHeight,
//     right: 0,
//     bottom: 0,
//     left: barHeight / 2,
//   },
//   width = 1200 - margin.left - margin.right,
//   barWidth = width * 0.9;

// var i = 0,
//   duration = 400,
//   root;

// var tree = d3.layout.tree().nodeSize([0, 25]);
// var nodes = tree.nodes(data);
// var nodeobj = {};
// for (i = 0; i < nodes.length; i++) {
//   node = nodes[i];
//   nodeobj[node.name] = node;
// }

// var diagonal = d3.svg.diagonal().projection(function(d) {
//   return [d.y, d.x];
// });

// var svg = d3
//   .select('svg')
//   //.attr("width", width + margin.left + margin.right)
//   .append('g')
//   .attr('class', 'level')
//   .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// data.x0 = 0;
// data.y0 = 0;

// if (nodes.length == 1) var base_node = nodes[0];
// else var base_node = nodes[1];

// var num_square = base_node.instances.length;
// var extent = d3.extent(base_node.instances, function(d, i) {
//   return new Date(d.execution_date);
// });
// var xScale = d3.time
//   .scale()
//   .domain(extent)
//   .range([
//     square_size / 2,
//     num_square * square_size +
//       (num_square - 1) * square_spacing -
//       square_size / 2,
//   ]);

// d3.select('svg')
//   .insert('g')
//   .attr(
//     'transform',
//     'translate(' + (square_x + margin.left) + ', ' + axisHeight + ')'
//   )
//   .attr('class', 'axis')
//   .call(
//     d3
//       .axisTop(xScale)
//       // .scale(xScale)
//       // .orient('top')
//       .ticks(2)
//   )
//   .selectAll('text')
//   .attr('transform', 'rotate(-30)')
//   .style('text-anchor', 'start');

// function node_class(d) {
//   var sclass = 'node';
//   if (d.children === undefined && d._children === undefined) sclass += ' leaf';
//   else {
//     sclass += ' parent';
//     if (d.children === undefined) sclass += ' collapsed';
//     else sclass += ' expanded';
//   }
//   return sclass;
// }

// update((root = data));
// function update(source) {
//   // Compute the flattened node list. TODO use d3.layout.hierarchy.
//   var nodes = tree.nodes(root);

//   var height = Math.max(
//     500,
//     nodes.length * barHeight + margin.top + margin.bottom
//   );
//   var width =
//     square_x +
//     num_square * (square_size + square_spacing) +
//     margin.left +
//     margin.right +
//     50;
//   d3.select('svg')
//     .transition()
//     .duration(duration)
//     .attr('height', height)
//     .attr('width', width);

//   d3.select(self.frameElement)
//     .transition()
//     .duration(duration)
//     .style('height', height + 'px');

//   // Compute the "layout".
//   nodes.forEach(function(n, i) {
//     n.x = i * barHeight;
//   });

//   // Update the nodes…
//   var node = svg.selectAll('g.node').data(nodes, function(d) {
//     return d.id || (d.id = ++i);
//   });

//   var nodeEnter = node
//     .enter()
//     .append('g')
//     .attr('class', node_class)
//     .attr('transform', function(d) {
//       return 'translate(' + source.y0 + ',' + source.x0 + ')';
//     })
//     .style('opacity', 1e-6)
//     .on('mouseover', function(d, i) {
//       d3.select(this.children[0]).style('fill', 'rgba(0, 0, 0, 0.07)');
//     })
//     .on('mouseout', function(d, i) {
//       d3.select(this.children[0]).style('fill', 'transparent');
//     });

//   var nodeHighlight = nodeEnter
//     .append('rect')
//     .attr('height', barHeight)
//     .attr('width', 0)
//     .style('fill', 'transparent')
//     .attr('transform', function(d, i) {
//       return 'translate(-15, -10)';
//     });

//   nodeEnter
//     .append('circle')
//     .attr('r', barHeight / 3)
//     .attr('class', 'task')
//     .attr('data-toggle', 'tooltip')
//     .attr('title', function(d) {
//       var tt = '';
//       if (d.operator != undefined) {
//         tt += 'operator: ' + d.operator + '<br/>';
//         tt += 'depends_on_past: ' + d.depends_on_past + '<br/>';
//         tt += 'upstream: ' + d.num_dep + '<br/>';
//         tt += 'retries: ' + d.retries + '<br/>';
//         tt += 'owner: ' + d.owner + '<br/>';
//         tt += 'start_date: ' + d.start_date + '<br/>';
//         tt += 'end_date: ' + d.end_date + '<br/>';
//       }
//       return tt;
//     })
//     .attr('height', barHeight)
//     // .attr("width", function(d, i) {return barWidth - d.y;})
//     .style('fill', function(d) {
//       return d.ui_color;
//     })
//     .attr('task_id', function(d) {
//       return d.name;
//     })
//     .on('click', toggles);

//   text = nodeEnter
//     .append('text')
//     .attr('dy', 3.5)
//     .attr('dx', barHeight / 2)
//     .text(function(d) {
//       return d.name;
//     });

//   var timer = 0;
//   var delay = 500;
//   var prevent = false;

//   var nodeStateBoxes = nodeEnter
//     .append('g')
//     .attr('class', 'stateboxes')
//     .attr('transform', function(d, i) {
//       return 'translate(' + (square_x - d.y) + ',0)';
//     });

//   nodeStateBoxes
//     .selectAll('rect')
//     .data(function(d) {
//       return d.instances;
//     })
//     .enter()
//     .append('rect')
//     .on('click', function(d) {
//       timer = setTimeout(function() {
//         if (!prevent) {
//           if ($('#editable').val() == '1') {
//             if (d.task_id === undefined) call_modal_dag(d);
//             else if (nodeobj[d.task_id].operator == 'SubDagOperator')
//               call_modal(d.task_id, d.execution_date, true);
//             else call_modal(d.task_id, d.execution_date);
//           }
//         }
//         prevent = false;
//       }, delay);
//     })
//     .on('dblclick', function(d) {
//       clearTimeout(timer);
//       prevent = true;
//       url =
//         '/admin/airflow/log' +
//         '?task_id=' +
//         encodeURIComponent(d.task_id) +
//         '&dag_id=' +
//         encodeURIComponent(d.dag_id) +
//         '&execution_date=' +
//         encodeURIComponent(d.execution_date);
//       window.location = url;
//     })
//     .attr('class', function(d) {
//       return 'state ' + d.state;
//     })
//     .attr('data-toggle', 'tooltip')
//     .attr('rx', function(d) {
//       return d.run_id != undefined ? '5' : '0';
//     })
//     .attr('ry', function(d) {
//       return d.run_id != undefined ? '5' : '0';
//     })
//     .style('shape-rendering', function(d) {
//       return d.run_id != undefined ? 'auto' : 'crispEdges';
//     })
//     .style('stroke-width', function(d) {
//       return d.run_id != undefined ? '2' : '1';
//     })
//     .style('stroke-opacity', function(d) {
//       return d.external_trigger ? '0' : '1';
//     })
//     .attr('title', function(d) {
//       function msToTime(duration) {
//         var milliseconds = parseInt((duration % 1000) / 100),
//           seconds = parseInt((duration / 1000) % 60),
//           minutes = parseInt((duration / (1000 * 60)) % 60),
//           hours = parseInt((duration / (1000 * 60 * 60)) % 24);

//         hours = hours < 10 ? '0' + hours : hours;
//         minutes = minutes < 10 ? '0' + minutes : minutes;
//         seconds = seconds < 10 ? '0' + seconds : seconds;

//         return hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
//       }
//       s = 'Task_id: ' + d.task_id + '<br>';
//       s +=
//         'Run: ' +
//         moment(d.execution_date).format('YYYY-MM-DD HH:mm:ss') +
//         '<br>';
//       if (d.run_id != undefined) {
//         s += 'run_id: <nobr>' + d.run_id + '</nobr><br>';
//       }
//       s += 'Operator: ' + d.operator + '<br>';
//       if (d.start_date != undefined) {
//         s +=
//           'Started: ' +
//           moment(d.start_date).format('YYYY-MM-DD HH:mm:ss.SS') +
//           '<br>';
//         s +=
//           'Ended: ' +
//           moment(d.end_date).format('YYYY-MM-DD HH:mm:ss.SS') +
//           '<br>';
//         if (d.duration != undefined) {
//           s += 'Duration: ' + msToTime(d.duration * 1000) + '<br>';
//         } else {
//           s += 'Duration: ' + d.duration + '<br>';
//         }
//         if (d.eta != undefined) {
//           s +=
//             'ETA: ' + moment(d.eta).format('YYYY-MM-DD HH:mm:ss.SS') + '<br>';
//         }
//         s += 'State: ' + d.state + '<br>';
//       }
//       return s;
//     })
//     .attr('x', function(d, i) {
//       return i * (square_size + square_spacing);
//     })
//     .attr('y', -square_size / 2)
//     .attr('width', 10)
//     .attr('height', 10)
//     .on('mouseover', function(d, i) {
//       d3.select(this)
//         .transition()
//         .style('stroke-width', 3);
//     })
//     .on('mouseout', function(d, i) {
//       d3.select(this)
//         .transition()
//         .style('stroke-width', function(d) {
//           return d.run_id != undefined ? '2' : '1';
//         });
//     });

//   nodeHighlight.attr('width', function(d, i) {
//     return square_x + (square_size + square_spacing) * numRuns + 20 - d.y;
//   });

//   // Transition nodes to their new position.
//   nodeEnter
//     .transition()
//     .duration(duration)
//     .attr('transform', function(d) {
//       return 'translate(' + d.y + ',' + d.x + ')';
//     })
//     .style('opacity', 1);

//   node
//     .transition()
//     .duration(duration)
//     .attr('class', node_class)
//     .attr('transform', function(d) {
//       return 'translate(' + d.y + ',' + d.x + ')';
//     })
//     .style('opacity', 1);

//   // Transition exiting nodes to the parent's new position.
//   node
//     .exit()
//     .transition()
//     .duration(duration)
//     .attr('transform', function(d) {
//       return 'translate(' + source.y + ',' + source.x + ')';
//     })
//     .style('opacity', 1e-6)
//     .remove();

//   // Update the links…
//   var link = svg.selectAll('path.link').data(tree.links(nodes), function(d) {
//     return d.target.id;
//   });

//   // Enter any new links at the parent's previous position.
//   link
//     .enter()
//     .insert('path', 'g')
//     .attr('class', 'link')
//     .attr('d', function(d) {
//       var o = { x: source.x0, y: source.y0 };
//       return diagonal({ source: o, target: o });
//     })
//     .transition()
//     .duration(duration)
//     .attr('d', diagonal);

//   // Transition links to their new position.
//   link
//     .transition()
//     .duration(duration)
//     .attr('d', diagonal);

//   // Transition exiting nodes to the parent's new position.
//   link
//     .exit()
//     .transition()
//     .duration(duration)
//     .attr('d', function(d) {
//       var o = { x: source.x, y: source.y };
//       return diagonal({ source: o, target: o });
//     })
//     .remove();

//   // Stash the old positions for transition.
//   nodes.forEach(function(d) {
//     d.x0 = d.x;
//     d.y0 = d.y;
//   });

//   $('#loading').remove();
// }

// function set_tooltip() {
//   $('rect.state').tooltip({
//     html: true,
//     container: 'body',
//   });
//   $('circle.task').tooltip({
//     html: true,
//     container: 'body',
//   });
// }
// function recursion_sort(data) {
//   // recursively sort the tasks in the dag
//   let children_tag = data['_children'] === undefined ? 'children' : '_children';
//   if (data[children_tag].length === 0) {
//     return;
//   }
//   data[children_tag].sort((a, b) => (a.name > b.name ? 1 : -1));
//   data[children_tag].forEach(child => {
//     recursion_sort(child);
//   });
// }
// function toggles(clicked_d) {
//   // Collapse nodes with the same task id
//   d3.selectAll("[task_id='" + clicked_d.name + "']").each(function(d) {
//     if (clicked_d != d && d.children) {
//       d._children = d.children;
//       d.children = null;
//       update(d);
//     }
//   });

//   // Toggle clicked node
//   if (clicked_d._children) {
//     clicked_d.children = clicked_d._children;
//     clicked_d._children = null;
//   } else {
//     clicked_d._children = clicked_d.children;
//     clicked_d.children = null;
//   }
//   update(clicked_d);
//   set_tooltip();
// }
// // Toggle children on click.
// function click(d) {
//   if (d.children || d._children) {
//     if (d.children) {
//       d._children = d.children;
//       d.children = null;
//     } else {
//       d.children = d._children;
//       d._children = null;
//     }
//     update(d);
//     set_tooltip();
//   }
// }
// set_tooltip();

// $(document).ready(function() {
//   if ($('#editable').val() == '0') {
//     $('#pause_resume').attr('disabled', 'disabled');
//   }
// });
