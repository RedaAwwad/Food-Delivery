const appConfig = (): AppConfig => {
  return {
    debug: JSON.parse(process.env.APP_DEBUG || "false"),
  };
};

export { appConfig };
