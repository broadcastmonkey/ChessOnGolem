import React from "react";
import "./signalStrengthIcon.css";
const SignalStrengthIcon = ({ label, signalValue, additionalText }) => {
  let classes = "signal-circle signal-";

  if (signalValue > 0) classes += "green";
  else classes += "red";
  //  console.log("value ", signalValue);
  return (
    <div
      style={{
        float: "right",
        overflow: "auto",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* <h3 style={{ float: "right" }}>{label}</h3> */}

      <div
        style={{
          display: "flex",
          margin: "auto",
          fontSize: 12,
          color: "white",
          marginRight: 20,
          padding: "10px 0",
          float: "none",
        }}
      >
        {additionalText}
      </div>

      <div className={classes}></div>
    </div>
  );
};

export default SignalStrengthIcon;
