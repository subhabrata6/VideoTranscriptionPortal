let showLoaderFn = null;
let hideLoaderFn = null;

export const registerLoaderFunctions = (showFn, hideFn) => {
  showLoaderFn = showFn;
  hideLoaderFn = hideFn;
};

export const showLoader = () => {
  if (showLoaderFn) showLoaderFn();
};

export const hideLoader = () => {
  if (hideLoaderFn) hideLoaderFn();
};
