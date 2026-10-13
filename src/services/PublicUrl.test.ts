describe("deployment URL handling", () => {
  const previousPublicUrl = process.env.PUBLIC_URL;

  afterEach(() => {
    if (previousPublicUrl === undefined) delete process.env.PUBLIC_URL;
    else process.env.PUBLIC_URL = previousPublicUrl;
    jest.resetModules();
  });

  it("keeps the application base path in navigation links", () => {
    process.env.PUBLIC_URL = "/sphinx/";
    jest.resetModules();
    const { getPublicPath, toPublicUrl } = require("./PublicUrl");

    expect(getPublicPath()).toBe("/sphinx");
    expect(toPublicUrl("ImplementationGuide")).toBe("/sphinx/ImplementationGuide");
  });
});

export {};
