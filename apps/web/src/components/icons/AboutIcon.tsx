import { SVGProps } from "react";

const AboutIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="800px"
    height="800px"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    {...props}
  >
    <path
      fill="#000000"
      fillRule="evenodd"
      d="M8 16A8 8 0 108 0a8 8 0 000 16zm0-9a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 7zm0-3a1 1 0 000 2h.007a1 1 0 000-2H8z"
      clipRule="evenodd"
    />
  </svg>
);

export default AboutIcon;
