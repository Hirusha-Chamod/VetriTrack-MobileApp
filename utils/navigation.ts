export const safeGoBack = (router: any, fallbackPath: string) => {
  const canGoBack =
    typeof router?.canGoBack === "function" ? router.canGoBack() : false;

  if (canGoBack) {
    router.back();
  } else {
    router.replace(fallbackPath as any);
  }
};
