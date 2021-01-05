import React, { Component } from "react";
import GenericTable from "./common/table/genericTable";

import { toast } from "react-toastify";
import { Link } from "react-router-dom";
class MovesTable extends Component {
  columns = [
    {
      path: "nr",
      label: "nr",
      key: "nr",
      content: (user) => (
        <Link key={user} onClick={() => toast.error("clicked: " + user.nr)}>
          {user.nr}
        </Link>
      ),
    },
    { path: "turn", label: "turn" },
    { path: "move", label: "move" },
    { path: "depth", label: "depth" },

    {
      path: "worker",
      label: "worker",
      //content: (worker) => toast.error("worker info: " + worker),
    },
    { path: "failed_times", label: "fails" },
    { path: "vm_time", label: "vm time [ms]" },
    { path: "total_time", label: "total time [ms]" },
    { path: "offers_count", label: "proposals" },
    { path: "cost", label: "cost" },
  ];

  render() {
    const { users } = this.props;

    return (
      <GenericTable
        columns={this.columns}
        data={users}
        //sortColumn={sortColumn}
        //onSort={onSort}
      />
    );
  }
}

export default MovesTable;
