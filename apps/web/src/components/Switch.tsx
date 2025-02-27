/* eslint-disable no-unused-vars */
import { ChangeEvent, useState } from "react";
import { styled } from "@web/stitches.config";

const SwitchElement = styled("label", {
  position: "relative",
  display: "inline-block",
});

const Slider = styled("span", {
  position: "relative",
  cursor: "pointer",
  textIndent: "-9999px",
  width: "55px",
  height: "25px",
  display: "block",
  borderRadius: "100px",
  background: "$primary900",

  "&:after": {
    content: "",
    position: "absolute",
    top: "5px",
    left: "5px",
    width: "15px",
    height: "15px",
    borderRadius: "90px",
    transition: "0.3s",
    background: "$error",
  },
});

const CheckBox = styled("input", {
  height: "0",
  width: "0",
  visibility: "hidden",

  [`&:checked + ${Slider}:after`]: {
    width: "8px",
    background: "$success",
    transform: "translateX(35px)",
  },

  [`&:disabled + ${Slider}`]: {
    opacity: "0.5",
    cursor: "not-allowed",
  },
});

export interface ISwitchProps {
  toggled?: boolean;
  onToggle: (e?: ChangeEvent<HTMLSelectElement>) => unknown;
  disabled?: boolean;
}

function Switch({ toggled, onToggle, disabled }: ISwitchProps): JSX.Element {
  const [checked, setChecked] = useState(toggled);

  return (
    <SwitchElement>
      <CheckBox
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={() => {
          setChecked(!checked);
          onToggle();
        }}
      />
      <Slider />
    </SwitchElement>
  );
}

export default Switch;
