// TODO: Format

import React, { useRef, useEffect, useState } from 'react';
import {
  drag,
  event,
  forceSimulation,
  hierarchy,
  select,
  forceLink,
  forceManyBody,
  forceX,
  forceY,
  SimulationNodeDatum,
  SimulationLinkDatum,
  zoom,
  forceCenter
} from 'd3';

import { UserTeamInfo } from '../../../shared/types';
import { userAvatarUrl } from '../../../client/util/profile';

import styles from './ForceTreeChart.scss';

export interface HierarchyDatum {
  id?: string;
  name?: string;
  value?: number;
  image?: string;
  children?: Array<HierarchyDatum>;
  skillArea?: string;
  jobTitle?: string;
}

export interface ForceTreeChartProps {
  /** Content to display inside the form */
  data?: UserTeamInfo[];
  /** Zoom slider value */
  zoomValue?: {value: number, active: boolean};
  /** Display data type */
  viewBy?: string;
  /** Hanlde zoom slider */
  handleZoomSlider: (value: number, active: boolean) => void;
}

export function ForceTreeChart({ data, zoomValue, viewBy = 'name', handleZoomSlider }: ForceTreeChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const svg = select(svgRef.current);
  let g = svg.append("g");

  const tooltipDiv = select(tooltipRef.current).attr("class", styles.NodeTooltip);

  const radius = 30;
  const duration = 300;
  let isDragging = false;

  const [simulation, setSimulation] = useState(forceSimulation());
  const [nodes, setNodes] = useState<SimulationNodeDatum[]>([]);
  const [links, setLinks] = useState<SimulationLinkDatum<SimulationNodeDatum>[]>([]);
  const [hiddenNodes, setHiddenNodes] = useState<SimulationNodeDatum[]>([]);
  const [hiddenLinks, setHiddenLinks] = useState<SimulationLinkDatum<SimulationNodeDatum>[]>([]);
  const [scale, setScale] = useState(1);
  const [zoomType, setZoomType] = useState('slider');

  //add zoom capabilities
  const zoomHandler = zoom().on("zoom",zoomAction);

  function convertData() {
    let relations: any = {};
    let slaves = new Set();

    const updated = data?.filter(item => (item.directManager || []).length > 0);

    updated?.forEach(element => {
      slaves.add(element.user.id);
      element?.directManager?.forEach(member => {
        if (member in relations) relations[member].add(element.user.id);
        else {
          relations[member] = new Set();
          relations[member].add(element.user.id);
        }
      });
    });
    
    let children: any = {};

    const dfs = (member: string) => {
      let deep = 0;
      if (member in children) return children[member];
      children[member] = [];
      if (member in relations) {
        relations[member].forEach((child: any) => {
          const res = dfs(child);
          const hasMember = data?.find(tm => tm.user.id === child);

          if (res.length > 0) {
            children[member].push({
              "id": hasMember?.user.id, 
              "name": hasMember?.user.name, 
              "children": res,
              "image": userAvatarUrl(hasMember?.user),
              "skillArea": hasMember?.skillArea,
              "jobTitle": hasMember?.user.jobTitle,
            });
          }
          else {
            children[member].push({
              "id": hasMember?.user.id,
              "name": hasMember?.user.name,
              "image": userAvatarUrl(hasMember?.user),
              "skillArea": hasMember?.skillArea,
              "jobTitle": hasMember?.user.jobTitle,
            });
          }
        });
      }
      return children[member];
    }
    
    let second_data: HierarchyDatum[] = [];

    Object.keys(relations).forEach(member => {
      if (!slaves.has(member)){
        const hasMember = data?.find(tm => tm.user.id === member);
        second_data.push({
          "id": hasMember?.user.id,
          "name": hasMember?.user.name,
          "children": dfs(member),
          "image": userAvatarUrl(hasMember?.user),
        });
      }
    });

    return second_data[0];
  }

  function dragging(simulation: any) {
    
    function dragstarted(d: any) {
      isDragging = true;
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(d: any) {
      isDragging = false;
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    return drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  function onNodeClick(d: any) {
    let updatedLinks: SimulationLinkDatum<SimulationNodeDatum>[] = [];

    const hasHiddenNode = hiddenNodes.find((hNode: any) => hNode.parent === d);
    const hasHiddenLink = hiddenLinks.find((hLink: any) => hLink.source.data.id === d.data.id);

    const updateNode = (data: any) => {
      if (!data.children) return;

      data.children.forEach((child: any) => {
        if(child.children && child.children.length > 0) {
          updateNode(child);
        }
        if (!hasHiddenNode) {
          nodes.forEach((node: any, index: number) => {
            if (node.data.id === child.id) {
              const hasHiddenIndex = hiddenNodes.findIndex(hNode => hNode === node);
              if (hasHiddenIndex < 0) {
                hiddenNodes.push(node);
                nodes.splice(index, 1);
              }
            }
          });
        } else {
          const hasChild = hiddenNodes.find((hNode: any) => hNode.data.id === child.id);
          if (hasChild){
            hiddenNodes.splice(hiddenNodes.indexOf(hasChild), 1);
            nodes.push(hasChild);
          };
        }
      });
    };

    const updateLink = (data: any) => {
      if (!data.children) return;

      data.children.forEach((child: any) => {
        if(child.children && child.children.length > 0) {
          updateLink(child);
        }

        if (!hasHiddenLink) {
          let tempLinks: SimulationLinkDatum<SimulationNodeDatum>[] = [];
          links.forEach((link: any) => {
            if (link.target.data.id === child.id) {
              const hasHNode= hiddenLinks.find(hLink => hLink === link);
              if (!hasHNode) {
                tempLinks.push(link);
                hiddenLinks.push(link);
              }
            }
          });

          tempLinks.forEach((tLink: any) => {
            links.splice(links.indexOf(tLink), 1);
          });
          
          setLinks([...links]);
        } else {
          let tempLinks: SimulationLinkDatum<SimulationNodeDatum>[] = [];
          hiddenLinks.forEach((hLink: any) => {
            if (hLink.target.data.id === child.id) {
              tempLinks.push(hLink);
            }
          });
  
          tempLinks.forEach((tLink: any) => {
            hiddenLinks.splice(hiddenLinks.indexOf(tLink), 1);
          });

          updatedLinks = [...updatedLinks, ...tempLinks];
        }
      });

      (updatedLinks.length > 0 && updatedLinks !== links) && setLinks([...links, ...updatedLinks]);
    }

    if (!event.defaultPrevented) {
      updateNode(d.data);
      updateLink(d.data);
    }

    onTooltipOpen(d);
  }

  function onTooltipClose() {
    tooltipDiv && tooltipDiv.transition()
      .duration(duration)
      .style("opacity", 0)
      .style("display", "none");
  }

  function onTooltipOpen(d: any) {
    const user = data?.find(item => item.user.id === d.data.id);

    tooltipDiv && tooltipDiv.transition()
      .duration(duration)
      .style("opacity", (d: any) => (!isDragging) ? 0.97 : 0)
      .style("display", (d: any) => (!isDragging) ? 'block' : 'none');
    
    tooltipDiv && tooltipDiv?.html(() => {
      return (
        `
          <div class="${styles.Header}">
            <div class="${styles.Action}">
              <button class="${styles.BtnClose}" />
            </div>
            <div class="${styles.Content}">
              <img src="${d.data.image}" alt="" />
              <div class="${styles.Info}">
                <div class="${styles.Name}">
                  ${user?.user.name}
                </div>
                <div class="${styles.jobTitle}">
                  ${user?.user.jobTitle || ""}
                </div>
              </div>
            </div>
          </div>
          <div class="node-tooltip__body">
          </div>
          <div class="${styles.Footer}">
            <div class="${styles.ViewProfile}">
              <a href="/user/${user?.user.alias}">View profile</a>
            </div>
          </div>
        `
      )
    })
    .style("left", (event.pageX + 50) + "px")
    .style("top", (event.pageY - 100) + "px");

    tooltipDiv && tooltipDiv.select('button').on('click', onTooltipClose);
  }

  function onMouseWheel() {
    setZoomType('mouse');
  }

  function onMouseLeave() {
    setZoomType('slider');
  }

  function getChildCount(node: any) {
    let count = 0;

    const countChildren = (data: any) => {
      if (data.children) {
        count += data.children.length;
        data.children.forEach((child: any) => {
          countChildren(child);
        });
      }

      return count;
    }

    if (node.children) {
      count = countChildren(node);
    }

    return count;
  }

  function getCircleR(node: any) {
    let deep = 0;

    const countDeep = (data: any) => {
      if (data.parent) {
        deep += 1;
        countDeep(data.parent);
      }
      return deep;
    }

    if (node.parent) {
      deep = countDeep(node);
    }

    return radius - 5 * deep > 10 ? radius - 5 * deep : 10;
  }

  function getLinkDistance(link: any) {
    let distance = 1;

    if (link.target.children) {
      distance = link.target.children.length;
    }

    distance *= 60;

    return distance;
  }

  function getTextRectWidth(text: string) {
    return text.length > 10 ? 80 : text.length * 7;
  }

  function getTextRender(text: string) {
    return text.length > 10 ? text.substring(0, 10) + '...' : text; 
  }

  function getLabel(d: any) {
    const content = viewBy === 'name'
      ? d.data.name
      : viewBy === 'department'
      ? d.data.skillArea
      : viewBy === 'title'
      ? d.data.jobTitle
      : d.data.name;
    
    return content || '';
  }

  function isCollapsed(node: any) {
    const hasHNode = hiddenNodes.find((hNode: any) => hNode.parent === node);

    if (hasHNode) return true;
    else return false;
  }

  //Zoom functions
  function zoomAction() {
    const width = svgRef.current?.clientWidth || 0;
    const height = svgRef.current?.clientHeight || 0;
    const scaleValue = event.transform.k > 3 ? 3 : event.transform.k;

    g.attr("transform", `translate(${width / 2 + event.transform.x}, ${height / 2 + event.transform.y}) scale(${scaleValue})`);

    setScale(scaleValue);
  };

  function update() {
    const width = svgRef.current?.clientWidth || 0;
    const height = svgRef.current?.clientHeight || 0;

    simulation
      .force("charge", forceManyBody().strength(-1500))
      .force("center", forceCenter())
      .force("link", forceLink(links).distance((link: any) => getLinkDistance(link)))
      .force("x", forceX())
      .force("y", forceY());
    
    svg
      .attr("width",'100%')
      .attr("height", '650px')
      .style("cursor","move")
      .on("wheel", onMouseWheel)
      .on("mouseleave", onMouseLeave);
    
    svg.text("");
    g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2}) scale(1,1)`);

    const defs = svg.append("defs");

    nodes?.map((d: any) => (
      defs
        .append("pattern")
            .attr("id", d.data.id)
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", getCircleR(d) * 2)
            .attr("height", getCircleR(d) * 2)
          .append("image")
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", getCircleR(d) * 2)
            .attr("height", getCircleR(d) * 2)
            .attr("xlink:href", d.data.image)
    ));

    const link = g.append("g")
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-width", "1.5px")
      .selectAll("path")
      .data(links)
      .join("path");
    
    const out_circle = g.append("g")
      .attr("class", "out_circles")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
        .attr("style", "fill:#fff;")
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
        .attr("r", (d: any) => d.data.children ? getCircleR(d) + 6 : getCircleR(d))
        .call(dragging(simulation) as any);

    const node = g.append("g")
      .attr("fill", "#fff")
      .attr("stroke", "#000")
      .attr("stroke-width", 2.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
        .attr("fill", (d: any) => 'url(#' + d.data.id + ')')
        .attr("stroke", "#000")
        .attr("r", (d: any) => getCircleR(d))
        .style("fill", (d: any) => 'url(#' + d.data.id + ')')
        .on("click", onNodeClick)
        .call(dragging(simulation) as any);

    const rect = g.append("g")
      .attr("class", "rects")
      .selectAll("rect")
      .data(nodes)
      .enter()
      .append("rect")
        .attr("width", (d: any) => getTextRectWidth(getLabel(d)))
        .attr("height", "15")
        .attr("fill", "white")
        .attr("rx", "10")
        .attr("ry", "10");
    
    const label = g.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('style', 'font-size: 9px;fill: black;')
      .text((d: any) => getTextRender(getLabel(d)))
      .call(dragging(simulation) as any);

    const child_count_circle = g.append("g")
      .attr("class", "child-counts")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
        .attr("fill", "#000")
        .attr("r", ((d: any) => isCollapsed(d) && getChildCount(d) > 0 ? 8: 0))
        .style("fill", "#000");

    const child_count_label = g.append("g")
      .attr("class", "child-count_labels")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('style', 'font-size: 8px;fill: white;')
      .text((d: any) => isCollapsed(d) && getChildCount(d) > 0 ? getChildCount(d) + '+' : '');
    
    simulation.on("tick", () => {
      link.attr("d", function (d: any) {
        var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 1 0,1 " + d.target.x + "," + d.target.y;
      });
      // link
      //   .attr("x1", (d: any) => d.source.x)
      //   .attr("y1", (d: any) => d.source.y)
      //   .attr("x2", (d: any) => d.target.x)
      //   .attr("y2", (d: any) => d.target.y);
  
      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      out_circle
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      label
        .attr("x", (d: any) => { return d.x; })
        .attr("y", (d: any) => { return d.y + getCircleR(d) + 5; });
      
      rect
        .attr("x", (d: any) => { return d.x - getTextRectWidth(getLabel(d)) / 2; })
        .attr("y", (d: any) => { return d.y + getCircleR(d) - 2; });

      child_count_circle
        .attr("cx", (d: any) => d.x + 30)
        .attr("cy", (d: any) => d.y + 10);

      child_count_label
        .attr("x", (d: any) => { return d.x + 30; })
        .attr("y", (d: any) => { return d.y + 10; });
    });

    zoomHandler(svg as any);
  }

  useEffect(() => {
    simulation.stop();

    const root = hierarchy(convertData() || {});
    const nodes = convertData() ? root.descendants() : [];
    const links = root.links();

    setNodes(nodes as SimulationNodeDatum[]);
    setLinks(links as SimulationLinkDatum<SimulationNodeDatum>[]);
    setSimulation(forceSimulation(nodes as SimulationNodeDatum[]));
  }, [data]);

  useEffect(() => {
    if (nodes.length > 0){
      simulation.restart();
      update();
    }
    else svg.text("");
  }, [simulation, svgRef.current]);

  useEffect(() => {
    if (nodes.length > 0) {
      simulation.restart();
      update();
    }
  }, [nodes, links]);

  useEffect(() => {
    if (zoomValue && zoomValue.active && zoomValue.value !== Math.ceil(scale * 100)) {
      const scaleValue = zoomValue.value/100/scale;
      zoomHandler.scaleBy((svg as any).transition().duration(5), scaleValue);
      simulation.restart();
      if (nodes.length > 0) update();
      else svg.text("");
    }
  }, [zoomValue]);

  useEffect(() => {
    handleZoomSlider(Math.ceil(scale * 100), zoomType === 'slider' ? true : false);
  }, [scale]);

  useEffect(() => {
    if (nodes.length > 0) {
      simulation.restart();
      update();
    }
  }, [viewBy]);

  return (
    <>
      <div ref={tooltipRef} />
      <div ref={wrapperRef}>
        <svg ref={svgRef}></svg>
      </div>
    </>
  )

}