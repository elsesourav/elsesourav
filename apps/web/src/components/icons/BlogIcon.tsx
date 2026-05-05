import { SVGProps } from "react";

const BlogIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="#000000"
    width="800px"
    height="800px"
    viewBox="-4 -2 24 24"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMinYMin"
    className="jam jam-document-f"
    {...props}
  >
    <path d="M3 0h10a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3zm1 7a1 1 0 1 0 0 2h8a1 1 0 0 0 0-2H4zm0 8a1 1 0 0 0 0 2h5a1 1 0 0 0 0-2H4zM4 3a1 1 0 1 0 0 2h8a1 1 0 0 0 0-2H4zm0 8a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2H4z" />
  </svg>
);

export default BlogIcon;
