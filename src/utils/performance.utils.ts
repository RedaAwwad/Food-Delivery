export const performanceContext = async (callback: () => Promise<any>) => {
  const start = performance.now();
  const result = await callback();
  const end = performance.now();
  console.log(`Query duration: ${(end - start).toFixed(2)}ms`);

  return result;
};
