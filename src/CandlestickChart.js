import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CandlestickChart = () => {
  const [data, setData] = useState([]);
  const [tooltipData, setTooltipData] = useState(null);
  const svgRef = useRef(null);

  const apiEndpoint = 'http://localhost:8888/jet/trade';

  const fetchData = async () => {
    try {
      const response = await fetch(apiEndpoint);
      const jsonData = await response.json();
      const intervalDate = new Date(jsonData.interval);
      if (!isNaN(intervalDate.getTime())) {
        setData(currentData => [...currentData, { ...jsonData, interval: intervalDate }]);
      } else {
        console.error("Received date is invalid");
      }
    } catch (error) {
      console.error("Could not fetch data from API", error);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (svgRef.current) {
      const margin = { top: 20, right: 50, bottom: 50, left: 40 };
      const width = 2000 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      d3.select(svgRef.current).selectAll('*').remove();

      const svg = d3.select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Define scales and axes
      const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.interval))
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.maxPrice)])
        .range([height, 0]);

      const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat("%H:%M:%S"));

      const yAxis = d3.axisLeft(yScale);

      // Append axes to the SVG
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

      svg.append("g").call(yAxis);

      // Drawing the candlesticks
      data.forEach(d => {
        const x = xScale(d.interval) - 10;
        const y = yScale(Math.max(d.openPrice, d.closePrice));
        const height = Math.abs(yScale(d.openPrice) - yScale(d.closePrice));
        const candleColor = d.openPrice > d.closePrice ? 'red' : 'green';

        const rect = svg.append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', 20)
          .attr('height', height)
          .attr('fill', candleColor);
        
        rect.on('click', () => {
          setTooltipData({
            open: d.openPrice,
            close: d.closePrice,
            high: d.maxPrice,
            low: d.minPrice,
            time: d3.timeFormat("%Y-%m-%d %H:%M")(d.interval)
          });
        });

        svg.append('line')
          .attr('x1', x + 10)
          .attr('x2', x + 10)
          .attr('y1', yScale(d.maxPrice))
          .attr('y2', yScale(d.minPrice))
          .attr('stroke', candleColor);
      });
    }
  }, [data]);

  return (
    <div>
      <svg ref={svgRef}></svg>
      <Tooltip data={tooltipData} />
    </div>
  );
};
const Tooltip = ({ data }) => {
  if (!data) return null;

  return (
    <div style={{ position: 'absolute', border: '1px solid black', padding: '10px', background: 'white' }}>
      <div><strong>Time:</strong> {data.time}</div>
      <div><strong>Open:</strong> {data.open}</div>
      <div><strong>Close:</strong> {data.close}</div>
      <div><strong>High:</strong> {data.high}</div>
      <div><strong>Low:</strong> {data.low}</div>
    </div>
  );
};

export default CandlestickChart;
