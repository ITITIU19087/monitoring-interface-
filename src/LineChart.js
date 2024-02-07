import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LineChart = () => {
  const [data, setData] = useState([]);
  const svgRef = useRef();

  const width = 1500; // Adjust as needed
  const height = 400; // Adjust as needed

  useEffect(() => {
    fetch('http://localhost:8888/hazelcast/trade-price')
      .then(response => response.json())
      .then(dataMap => {
        const dataArray = Array.from(Object.entries(dataMap)).map(([key, value]) => {
          return { x: new Date(key), y: value }; // Use Date objects directly
        }).sort((a, b) => a.x - b.x); // Sorting by timestamp
        setData(dataArray);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(svgRef.current).select('g');
    g.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 50 };

    const xScale = d3.scaleTime() // Using a time scale
      .domain(d3.extent(data, d => d.x))
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 100]) // Assuming your Y values range from 0 to 100
      .range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%H:%M:%S.%L"));
    const yAxis = d3.axisLeft(yScale);

    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y));

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    g.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 5)
      .attr("fill", "orange");

    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);

  }, [data]);

  return <svg ref={svgRef} width={width} height={height}><g /></svg>;
};

export default LineChart;
