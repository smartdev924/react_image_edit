import React from "react";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
/**
 *
 * @param {string} str
 * @returns {string}
 */
const capitalizeFirstLowercaseRest = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
const CustomToolTip = styled(Tooltip)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}));

export const CustomIconButton = ({
  icon,
  title,
  custom = false,
  shadow = false,
  active = false,
  ...props
}) => {
  return (
    <CustomToolTip title={capitalizeFirstLowercaseRest(title)}>
      <button
        {...props}
        className={`${
          custom ? "" : "w-10"
        } h-10 px-3 flex justify-center items-center  disabled:opacity-50 ${
          shadow ? "drop-shadow-md " : ""
        }	${active ? "bg-pink-500 text-white" : "bg-white text-pink-500"}`}
      >
        {icon}
      </button>
    </CustomToolTip>
  );
};
