import * as React from "react";
import styled from "styled-components";

function BlockIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="126"
            height="126"
            viewBox="0 0 126 126"
            fill="none"
            {...props}
        >
            <path
                d="M122.417 3.583H3.125v119.292h119.292V3.583z"
                stroke="#fff"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
const AnimatedBlock = styled(BlockIcon) <{ key?: number }>`
        flex: 1;
        order: ${({ key }) => key};
    `;
let Blocks = (props: any) => {
    return (
        <div {...props}>
            <AnimatedBlock className="animatedblock0" key={0} />
            <AnimatedBlock className="animatedblock1" key={1} />
            <AnimatedBlock className="animatedblock2" key={2} />
            <AnimatedBlock className="animatedblock3" key={3} />
        </div>
    )
}
export { BlockIcon, Blocks };