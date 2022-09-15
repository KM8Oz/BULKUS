import React from "react";
import { SpringRef } from "react-spring";
const menu  = {
    status: true,
    set isopen(val:boolean){
        this.status = val
    },
    get isopen(){
        return this.status
    }
}
export const MenuContext = React.createContext({ menu })