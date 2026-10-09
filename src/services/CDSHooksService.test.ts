import CDSHooksService from "./CDSHooksService";

const context = {
  patientId: "patient-1",
  studyId: "study-1",
  libraryId: "library-1",
  inclusionExpression: "Inclusion Criteria",
};

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

test("posts the eligibility context and returns decision cards", async () => {
  process.env.REACT_APP_CDSHOOKS_URL = "https://cds.example.test";
  process.env.REACT_APP_FHIR_URL = "https://fhir.example.test";
  const card = { summary: "Eligible", indicator: "info" };
  const network = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ cards: [card] }) });
  global.fetch = network as any;

  await expect(CDSHooksService.callResearchEligibilityCheck(context)).resolves.toEqual([card]);
  expect(network).toHaveBeenCalledWith("https://cds.example.test/cds-services/research-eligibility-check", expect.objectContaining({
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }));
  const payload = JSON.parse(network.mock.calls[0][1].body);
  expect(payload).toMatchObject({ hook: "patient-view", fhirServer: "https://fhir.example.test", context });
  expect(payload.hookInstance).toMatch(/^\d+$/);
});

test("returns an empty list when the CDS service has no cards", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) }) as any;
  await expect(CDSHooksService.callResearchEligibilityCheck(context)).resolves.toEqual([]);
});

test("reports an HTTP failure", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 }) as any;
  await expect(CDSHooksService.callResearchEligibilityCheck(context)).rejects.toThrow("CDS Hooks error: 503");
});
