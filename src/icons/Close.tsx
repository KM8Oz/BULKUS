import * as React from "react";

function Close(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={props.width || 52}
      height={props.width || 52}
      viewBox="0 0 52 52"
      fill="none"
      {...props}
    >
      <path
        d="M44.667 2H7.333A5.333 5.333 0 002 7.333v37.334A5.333 5.333 0 007.333 50h37.334A5.333 5.333 0 0050 44.667V7.333A5.333 5.333 0 0044.667 2zM18 18l16 16M34 18L18 34"
        stroke="#d81111"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Close;