import React from "react";
import TableHeader from "./tableHeader";
import TableBody from "./tableBody";
import { Table } from "react-bootstrap";

const GenericTable = ({ columns, sortColumn, onSort, data }) => {
  return (
    <Table table striped hover bordered>
      <TableHeader columns={columns} sortColumn={sortColumn} onSort={onSort} />
      <TableBody columns={columns} data={data} />
    </Table>
  );
};

export default GenericTable;
