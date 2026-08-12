


import { setThemeHandler, initThemeHandler } from './setThemeHandler';





export const handlers = {
  setTheme: setThemeHandler,
  initTheme: initThemeHandler,
};


export const handlerMap = handlers;


export type GlitterGalleryHandlers = typeof handlers;


export {
  setThemeHandler,
  initThemeHandler,
};
