import * as React from "react";

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
    width={props.width ||98}
    height={props.width ||98}
      fill="none"
      viewBox="0 0 98 98"
      {...props}
    >
      <path
        d="M12.25 36.75L49 8.167 85.75 36.75v44.917a8.166 8.166 0 01-8.167 8.166H20.417a8.166 8.166 0 01-8.167-8.166V36.75z"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M36.75 89.833V49h24.5v40.833"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default HomeIcon;