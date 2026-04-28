import { useEffect } from "react";
import type { RefObject } from "react";

type ClickOutsideEvent = MouseEvent | TouchEvent;


export const useClickOutside = <T extends HTMLElement = HTMLElement> (ref: RefObject<T>, handler: (event: ClickOutsideEvent) => void) => {

  useEffect(() => {
    const listener = (event: ClickOutsideEvent) => {
      const el = ref.current;
      if(!el || el.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};


