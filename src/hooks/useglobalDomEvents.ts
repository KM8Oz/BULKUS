import { useEffect } from "react";
interface appmenuEvents {
    readonly closed: boolean;
    readonly open: boolean;
}
interface WindowEventMap2 extends WindowEventMap {
    "appmenu": appmenuEvents;
}
type Props = {
  [key in keyof WindowEventMap2]?: EventListenerOrEventListenerObject;
};

export default function useGlobalDOMEvents(props: Props) {
  useEffect(() => {
    const MenuClose = new Event('MenuClose');
    const MenuOpen = new Event('MenuOpen');
    window.dispatchEvent(MenuClose)
    window.dispatchEvent(MenuOpen)
    for (let [key, func] of Object.entries(props)) {
      window.addEventListener(key, func, false);
    }
    return () => {
      for (let [key, func] of Object.entries(props)) {
        window.removeEventListener(key, func, false);
      }
    };
  }, []);
}