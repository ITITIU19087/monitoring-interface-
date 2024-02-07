import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import io from 'socket.io-client';

const OrderChart = () => {
    const [data, setData] = useState([]); 
    const [error, setError] = useState(null);

    const [buyData, setBuyData] = useState(null);
    const [sellData, setSellData] = useState(null);
    

    const socket = io('http://localhost:9999', {
        transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
        console.log('Connected:', socket.connected);
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected:', socket.connected);
    });

    socket.on('connect_error', (error) => {
        console.log('Connection Error:', error);
    });

    socket.on("buyEvent", (data) => {
        setBuyData(data);
    });

    socket.on("sellEvent", (data) => {
        setSellData(data);
    });


    const fetchData = async (dataBuy, dataSell) => {
        try {
            const dataArraySell = Object.entries(dataSell).map(([key, value]) => ({ price: parseFloat(key), orders: value, side: 'SELL' }));
            const dataArrayBuy = Object.entries(dataBuy).map(([key, value]) => ({ price: parseFloat(key), orders: value, side: 'BUY' }));

            let dataArray = dataArraySell.concat(dataArrayBuy);
            dataArray.sort((a, b) => a.price - b.price);

            setData(dataArray);
            setError(null);
        } catch (error) {
            console.error("Error fetching data: ", error);
            setError(error);
        }
    };

    useEffect(() => {
        if (buyData && sellData) {
            console.log("Buy Data: ", buyData);
            console.log("Sell Data: ", sellData);
            if (buyData != null && sellData != null){
                fetchData(buyData, sellData);
            }
            setBuyData(null);
            setSellData(null);
        }
    }, [buyData, sellData]); 


    useEffect(() => {
        if (data.length === 0) {
            return;
        }
        renderChart(data);
    }, [data]);

    const renderChart = (dataArray) => {
        d3.select("#chart").selectAll("*").remove(); // Clear existing SVG content

        const svg = d3.select("#chart"),
            margin = {top: 20, right: 50, bottom: 30, left: 50},
            width = 500 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

        const x = d3.scaleLinear().range([0, width / 4]);
        const y = d3.scaleBand().range([height, 0]).padding(0.1 );

        y.domain(dataArray.map(d => d.price));
        x.domain([0, d3.max(dataArray, d => d.orders)]);

        const g = svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const axisGap = 10;

        g.selectAll(".bar")
            .data(dataArray)
            .enter().append("rect")
            .attr("class", d => `bar-${d.side.toLowerCase()}`)
            .attr("y", d => y(d.price))
            .attr("height", y.bandwidth())
            .attr("x", d => {
                if (d.side === 'BUY') {
                    return (width / 2) - x(d.orders) - axisGap;
                } else {
                    return (width / 2) + axisGap;
                }
            })
            .attr("width", d => x(d.orders));

        const yAxisBuy = d3.axisLeft(y).tickValues([]);
        const yAxisSell = d3.axisRight(y).tickValues([]);

        g.append("g")
            .attr("transform", `translate(${width / 2 + axisGap}, 0)`)
            .call(yAxisSell);

        g.append("g")
            .attr("transform", `translate(${width / 2 - axisGap}, 0)`)
            .call(yAxisBuy);

        g.selectAll(".axis-text")
            .data(y.domain())
            .enter().append("text")
            .attr("class", "axis-text")
            .attr("y", d => y(d) + y.bandwidth() / 2)
            .attr("dy", ".35em")
            .attr("x", width / 2)
            .attr("text-anchor", "middle")
            .text(d => d);

        const buyAnnotationY = 10;
        const sellAnnotationY = buyAnnotationY + 30;

        const annotationX = 10;

        g.append("rect")
            .attr("x", annotationX)
            .attr("y", buyAnnotationY)
            .attr("width", 20)
            .attr("height", 20)
            .attr("class", "bar-buy");
        g.append("text")
            .attr("x", annotationX + 30)
            .attr("y", buyAnnotationY + 15)
            .attr("class", "annotation")
            .text("BUY orders");

        g.append("rect")
            .attr("x", annotationX)
            .attr("y", sellAnnotationY)
            .attr("width", 20)
            .attr("height", 20)
            .attr("class", "bar-sell");
        g.append("text")
            .attr("x", annotationX + 30)
            .attr("y", sellAnnotationY + 15)
            .attr("class", "annotation")
            .text("SELL orders");
    };

    if (error) {
        return <div>Error fetching data: {error.message}</div>;
    }

    return (
        <div>
            <style>
                {`
                  .bar-sell { fill: green; }
                  .bar-buy { fill: red; }
                  .axis-text { font-size: 12px; fill: black; }
                `}
            </style>
            <svg id="chart"></svg>
        </div>
    );
};

export default OrderChart;
