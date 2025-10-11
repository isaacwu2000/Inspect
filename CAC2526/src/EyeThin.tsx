import React from "react";

type Props = {size?: number; stroke?: number; className?: string};

export default function EyeThin({size = 120, stroke = 1.25, className}: Props){
    return(
        <svg
            width = {size}
            height = {size}
            viewBox = "0 0 24 24"
            fill = "none"
            stroke = "currentColor"
            className = {className}
        >
            {/* Outer part of the eye lesss goooo */}
            <path
                d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"
                strokeWidth={stroke}
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/*Inner outline */}
            <circle
                cx = "12"
                cy = "12"
                r = "3.5"
                strokeWidth = {stroke}
                vectorEffect = "non-scaling-stroke"
            />
            {/*inner filling */}
            <circle 
                cx = "12" 
                cy = "12" 
                r = "1.2" 
                fill = "currentColor" 
            />
        </svg>
    );
}