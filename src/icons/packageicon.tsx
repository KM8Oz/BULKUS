import * as React from "react";

function PackageIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width={props.width || 98}
            height={props.width || 98}
            fill="none"
            viewBox="0 0 98 98"
            {...props}
        >
            <path
                d="M85.75 65.333V32.667a8.167 8.167 0 00-4.083-7.065L53.083 9.27a8.166 8.166 0 00-8.166 0L16.333 25.602a8.167 8.167 0 00-4.083 7.065v32.666a8.167 8.167 0 004.083 7.064l28.584 16.334a8.167 8.167 0 008.166 0l28.584-16.334a8.167 8.167 0 004.083-7.064z"
                stroke="#fff"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M13.352 28.42L49 49.04l35.647-20.62M49 90.16V49"
                stroke="#fff"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default PackageIcon;