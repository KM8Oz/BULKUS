import * as React from "react";

function TerminalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
    width={props.width ||98}
    height={props.width ||98}
    fill="none"
    viewBox="0 0 98 98"
      {...props}
    >
      <path
        d="M89.833 49H73.5L61.25 85.75l-24.5-73.5L24.5 49H8.167"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default TerminalIcon;