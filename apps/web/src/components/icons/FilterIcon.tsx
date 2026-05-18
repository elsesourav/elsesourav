import { SVGProps } from "react";
const FilterIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="#000000"
    width="800px"
    height="800px"
    viewBox="0 0 24 24"
    id="filter"
    data-name="Flat Color"
    xmlns="http://www.w3.org/2000/svg"
    className="icon flat-color"
    {...props}
  >
    <path
      id="primary"
      d="M18,2H6A2,2,0,0,0,4,4V6.64a2,2,0,0,0,.46,1.28L9,13.36V21a1,1,0,0,0,.47.85A1,1,0,0,0,10,22a1,1,0,0,0,.45-.11l4-2A1,1,0,0,0,15,19V13.36l4.54-5.44A2,2,0,0,0,20,6.64V4A2,2,0,0,0,18,2Z"
      style={{
        fill: "rgb(0, 0, 0)",
      }}
    />
  </svg>
);
export default FilterIcon;
