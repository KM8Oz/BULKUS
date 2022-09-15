import styled from "styled-components";
import React from "react";
import { Blocks } from "./icons/Blockicon";
import { animated } from "react-spring";
import ContentEditable from 'react-contenteditable'

export default {
    DraggableContent: styled.div`
        position: relative;
        width: 97%;
        margin: 0px  auto;
        max-height: 570px;
        min-height: 570px;
        /* padding: 2em 0em; */
        overflow-y: scroll;
        /* align-items: center; */
        display: flex;
        flex-direction: column ;
        justify-content: flex-start;
        gap: 1em;
        /* div {
          position: absolute;
          width: 95%;
          height: 70px;
          max-height: 500px;
          overflow: visible;
          padding: unset;
          display: flex;
          flex-direction:column ;
          align-items:center ;
          pointer-events: auto;
          transform-origin: 50% 50% 0px;
          border-radius: 5px;
          color: white;
          line-height: 90px;
          padding-left: 32px;
          font-size: 14.5px;
          background: #FFFFFF;
          user-select: none;
          cursor: pointer;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 2px;
        } */
    `,
    Capp: styled.div`
        background-color: #0C2B35;
        position: absolute;
        top:0;
        left:0;
        right:0;
        bottom:0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding-top: 10px;
        padding-bottom: 10px;
        gap:10px;
    `,
    Cheader: styled.div`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        height: 71px;
        width: 94%;
        align-self: center;
    `,
    Cstatus: styled.div<{ status: boolean }>`
        ::after {
            content: '${({ status }) => status ? "online" : "offline"}';
            font-size: 17px;
            font-family: 'Josefin Sans';
            font-weight: 400;
            color: #FFFFFF;
            position: absolute;
            left: 40px;
            z-index: 99;
            line-height: 20px;
        }
        /* position: absolute; */
        width: 17px;
        height: 17px;
        /* left: auto; */
        background: ${({ status }) => status ? '#31B702' : '#AE3737'};
        border-radius: 50%;
    `,
    Cbody: styled.div`
        width:96%;
        /* height: 100%; */
        flex-direction: row;
        background-color: rgba(237, 237, 237, 0.52);
        box-shadow: inset 0px 4px 4px rgba(0, 0, 0, 0.25);
        border-radius: 11px;
        align-items:center;
        /* justify-content: first baseline; */
        display: flex;
        flex: 1;
        order: 0;
        position: relative;
    `,
    Cinput: styled(ContentEditable)`
        position: absolute;
        top: 5px;
        left: 5px;
        right: 5px;
        bottom: 5px;
        padding-bottom: 11%;
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
        outline: unset;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 5px;
        line-height: 1.6em;
        overflow-y: scroll ;
        overflow-x: hidden ;
        background-color:#ffffff00;
        /* height: auto; */
        border: unset;
        font-family: 'Josefin Sans';
        text-align: start;
        display: block;
        text-rendering: optimizeSpeed ; 
        /* text-indent: justify; */
        /* overflow-wrap: break-word; */
        color: #ffffff ;
        /* max-height: auto; */
        ::-webkit-scrollbar {
            display: none;
        }
        .validation-Safe {
            margin: 5px 5px;
            background-color: rgb(14, 198, 136);
            padding: 0px 5px;
            float:left;
            border-radius: 10px;
            max-width: fit-content;
        }
        .validation-Invalid {
            margin: 5px 5px;
            float:left;
            background-color: rgb(198, 14, 14);
            padding: 0px 5px;
            border-radius: 10px;
            max-width: fit-content;
        }
        .validation-Unknown {
            margin: 5px 5px;
            background-color: rgb(198, 14, 14);
            padding: 0px 5px;
            float:left;
            border-radius: 10px;
        }
        .validation-Risky {
            margin: 5px 5px;
            float:left;
            background-color: rgb(198, 161, 14);
            padding: 0px 5px;
            border-radius: 10px;
            max-width: fit-content;
        }
    `,
    Cbutton: styled.button<any>`
        display: flex;
        flex-direction: row;
        gap:10px;
        justify-content: center;
        position: relative;
        ::after {
            content: ${({ loading, percentage }) => percentage};
            width: ${({ loading, percentage }) => loading == 1 ? Number(percentage || 100) : 100}%;
            height: 100%;
            position: absolute;
            background-color: rgb(14,198,136);
            border-radius: ${({ loading, percentage }) => loading == 1 ? (Number(percentage || 100) / 100) * 33 : 33}px;
            opacity: ${({ loading, percentage }) => loading == 1 ? 0 : .3};
            left: 0px;
        }
        align-items: center;
        /* @keyframes rotation {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(359deg);
          }
        }
        ::after {
            font-size: 30px;
            animation: rotation 2s infinite linear;
        } */
        /* align-self: flex-end; */
        margin-left: auto;
        margin-right: auto;
        margin-top:.3em;
        margin-bottom:.3em;
        padding: 0px;
        border: unset;
        user-select: none;
        font-family: 'Josefin Sans';
        font-style: normal;
        font-weight: 400;
        font-size:${({ fontsize }) => fontsize || 14}px;
        color:#fff;
        background: linear-gradient(180deg, #175A6F 0%, #114353 100%);
        box-shadow: 3.9801e-15px 65px 130px rgba(4, 16, 20, 0.24), inset -1.23825e-15px -20.2222px 20.2222px #10404F, inset 1.23825e-15px 20.2222px 20.2222px #175D73;
        border-radius: 33px;
        :active{
            background: linear-gradient(213deg, #104050 0%, #175C71 72.29%);
            box-shadow: -35.4015px 54.5136px 130px rgba(4, 16, 20, 0.2995), inset 12.3512px -19.0192px 22.6778px #0F3D4B, inset -12.3512px 19.0192px 22.6778px #185F76;
        }
        isolation: isolate;
        width: ${({ width }) => width || 456}px;
        height: ${({ width }) => (width || 456) * 92 / 456}px;
        flex: none;
        order: 1;
        flex-grow: 0;
    `,
    SaveBtn: styled.button<any>`
        display: flex;
        flex-direction: row;
        gap:10px;
        justify-content: center;
        position: relative;
        ::after {
            content: ${({ loading, percentage }) => percentage};
            width: ${({ loading, percentage }) => loading == 1 ? Number(percentage || 100) : 100}%;
            height: 100%;
            position: absolute;
            background-color: rgb(14,198,136);
            border-radius: ${({ loading, percentage }) => loading == 1 ? (Number(percentage || 100) / 100) * 33 : 33}px;
            opacity: ${({ loading, percentage }) => loading == 1 ? 0 : .3};
            left: 0px;
        }
        align-items: center;
        /* @keyframes rotation {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(359deg);
          }
        }
        ::after {
            font-size: 30px;
            animation: rotation 2s infinite linear;
        } */
        /* align-self: flex-end; */
        margin-left: auto;
        margin-right: auto;
        margin-top:.3em;
        margin-bottom:.3em;
        padding: 0px;
        border: unset;
        user-select: none;
        font-family: 'Josefin Sans';
        font-style: normal;
        font-weight: 400;
        font-size:${({ fontsize }) => fontsize || 14}px;
        color:#fff;
        background: linear-gradient(180deg, #3A9918 0%, #6D9616 100%);
        box-shadow: 3.9801e-15px 65px 130px rgba(4, 16, 20, 0.24), inset -1.23825e-15px -20.2222px 20.2222px #40B318, inset 1.23825e-15px 20.2222px 20.2222px #85C008;
        border-radius: 33px;
        :active{
            background: linear-gradient(213deg, #104050 0%, #175C71 72.29%);
            box-shadow: -35.4015px 54.5136px 130px rgba(4, 16, 20, 0.2995), inset 12.3512px -19.0192px 22.6778px #0F3D4B, inset -12.3512px 19.0192px 22.6778px #185F76;
        }
        isolation: isolate;
        width: ${({ width }) => width || 456}px;
        height: ${({ width }) => (width || 456) * 92 / 456}px;
        flex: none;
        order: 1;
        flex-grow: 0;
    `,
    Blocks: styled(Blocks)`
        width: 309px;
        height: 309px;
        line-height: 12px;
        flex-direction: row ;
        flex-wrap: wrap ;
        justify-content: space-around ;
        align-items: stretch;
        /* background-color: #ccc; */
        align-self: center;
        margin-bottom: 20%;
    `,
    CMenu: styled(animated.button) <{}>`
        width: 100px;
        height: 60px;
        background: #185F76;
        backdrop-filter: blur(2px);
        /* Note: backdrop-filter has minimal browser support */
        border-radius: 100px;
        display: flex;
        justify-content: center;
        align-items: center ;
        /* Inside auto layout */
        flex: none;
        order: ${({ key }) => key};
        flex-grow: 0;
        cursor: pointer;
        transform: scale(1);
        transition: 100ms ease-in-out;
        :active {
            transform: scale(.95);
        }
    `,
    Cfooter: styled(animated.div)`
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 10px;
        /* align-self: flex-end ; */
        /* bottom: 10px; */
        width: 90%;
        gap: 40px;
        user-select:none;
        /* :active {
            cursor: grab;
        } */
        -webkit-user-select: none;
        cursor: grab;
        transform-origin: 50% 50% 0px;
        /* margin-bottom: -100px; */
        position: relative;
        background: #FFFFFF;
        border-radius: 100px;
    `
}