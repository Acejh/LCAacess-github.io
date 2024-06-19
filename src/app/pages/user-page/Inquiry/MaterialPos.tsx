import React from "react";

export function MaterialPos() {
  const data = [
    { id: 1, name: "Item 1", price: "$10", quantity: 5 },
    { id: 2, name: "Item 2", price: "$15", quantity: 3 },
    { id: 3, name: "Item 3", price: "$7", quantity: 10 },
    { id: 4, name: "Item 4", price: "$25", quantity: 2 },
  ];

  return (
    <div style={{ margin:"0 20px"}}>
      <h1>MaterialPos</h1>
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid black", }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black" }}>ID</th>
            <th style={{ border: "1px solid black" }}>Name</th>
            <th style={{ border: "1px solid black" }}>Price</th>
            <th style={{ border: "1px solid black" }}>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td style={{ border: "1px solid black" }}>{item.id}</td>
              <td style={{ border: "1px solid black" }}>{item.name}</td>
              <td style={{ border: "1px solid black" }}>{item.price}</td>
              <td style={{ border: "1px solid black" }}>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}