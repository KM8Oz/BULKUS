import * as React from "react";

function AddIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={props.width ||98}
      height={props.width ||98}
      fill="none"
      viewBox="0 0 98 98"
      {...props}
    >
      <path
        d="M49 89.833c22.552 0 40.833-18.281 40.833-40.833S71.552 8.167 49 8.167 8.167 26.449 8.167 49c0 22.552 18.281 40.833 40.833 40.833zM49 32.667v32.666M32.667 49h32.666"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default AddIcon;