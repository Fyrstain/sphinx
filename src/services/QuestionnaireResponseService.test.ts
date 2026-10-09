import QuestionnaireResponseService from "./QuestionnaireResponseService";

const mockRead = jest.fn();
const mockSearch = jest.fn();
const mockOperation = jest.fn();

jest.mock("fhir-kit-client", () => ({
  __esModule: true,
  default: class {
    read(...args: unknown[]) { return mockRead(...args); }
    search(...args: unknown[]) { return mockSearch(...args); }
    operation(...args: unknown[]) { return mockOperation(...args); }
  },
}));

beforeEach(() => {
  mockRead.mockReset();
  mockSearch.mockReset();
  mockOperation.mockReset();
});

test("loads a response and resolves its versioned questionnaire canonical", async () => {
  const response = { resourceType: "QuestionnaireResponse", questionnaire: "https://example.test/q|2" };
  const questionnaire = { resourceType: "Questionnaire", id: "q-2" };
  mockRead.mockResolvedValue(response);
  mockSearch.mockResolvedValue({ resourceType: "Bundle", entry: [{ resource: questionnaire }] });

  await expect(QuestionnaireResponseService.loadQuestionnaireResponse("response-1"))
    .resolves.toEqual({ ...response, contained: [questionnaire] });
  expect(mockRead).toHaveBeenCalledWith({ resourceType: "QuestionnaireResponse", id: "response-1" });
  expect(mockSearch).toHaveBeenCalledWith({
    resourceType: "Questionnaire",
    searchParams: { url: "https://example.test/q", version: "2" },
  });
});

test("keeps contained questionnaires and responses without a canonical unchanged", async () => {
  const contained = { resourceType: "Questionnaire", id: "inline" };
  const withContained = { resourceType: "QuestionnaireResponse", questionnaire: "https://example.test/q", contained: [contained] };
  mockRead.mockResolvedValueOnce(withContained).mockResolvedValueOnce({ resourceType: "QuestionnaireResponse", id: "plain" });

  await expect(QuestionnaireResponseService.loadQuestionnaireResponse("inline"))
    .resolves.toBe(withContained);
  await expect(QuestionnaireResponseService.loadQuestionnaireResponse("plain"))
    .resolves.toMatchObject({ id: "plain" });
  expect(mockSearch).not.toHaveBeenCalled();
});

test("does not invent contained resources when a canonical search is empty", async () => {
  const response = { resourceType: "QuestionnaireResponse", questionnaire: "https://example.test/q" };
  mockRead.mockResolvedValue(response);
  mockSearch.mockResolvedValue({ resourceType: "Bundle", entry: [] });

  await expect(QuestionnaireResponseService.loadQuestionnaireResponse("missing"))
    .resolves.toBe(response);
  expect(mockSearch).toHaveBeenCalledWith({
    resourceType: "Questionnaire",
    searchParams: { url: "https://example.test/q" },
  });
});

test("sends the response to the FHIR extract operation", async () => {
  const response = { resourceType: "QuestionnaireResponse", id: "response-1", status: "completed" };
  const bundle = { resourceType: "Bundle", type: "transaction", entry: [] };
  mockOperation.mockResolvedValue(bundle);

  await expect(QuestionnaireResponseService.extract(response as any)).resolves.toBe(bundle);
  expect(mockOperation).toHaveBeenCalledWith({
    name: "extract",
    resourceType: "QuestionnaireResponse",
    method: "POST",
    input: { resourceType: "Parameters", parameter: [{ name: "questionnaire-response", resource: response }] },
  });
});

test("normalizes only Organization subjects in extracted resources", () => {
  const organization = { resourceType: "Observation", id: "o-1", subject: { reference: "Organization/old" } };
  const typedOrganization = { resourceType: "Observation", subject: { type: "Organization" } };
  const patient = { resourceType: "Observation", subject: { reference: "Patient/1" } };
  const bundle = { resourceType: "Bundle", type: "transaction", entry: [
    { resource: organization }, { resource: typedOrganization }, { resource: patient }, {},
  ] } as any;

  expect(QuestionnaireResponseService.normalizeExtractedBundleSubject(bundle))
    .toBe(bundle);
  const normalized = QuestionnaireResponseService.normalizeExtractedBundleSubject(bundle, "org-1");
  expect((normalized.entry?.[0].resource as any)?.subject).toEqual({ identifier: { value: "org-1" } });
  expect((normalized.entry?.[1].resource as any)?.subject).toEqual({ identifier: { value: "org-1" } });
  expect(normalized.entry?.[2].resource).toBe(patient);
  expect(normalized.entry?.[3]).toEqual({});
  expect(bundle.entry[0].resource).toBe(organization);
  expect(QuestionnaireResponseService.normalizeExtractedBundleSubject({ resourceType: "Bundle", type: "transaction" } as any, "org-1"))
    .toMatchObject({ resourceType: "Bundle" });
});

test("converts extracted PUT entries to POST without changing unrelated entries", () => {
  const original = { resourceType: "Observation", id: "old", subject: { reference: "Organization/old" } };
  const postResource = { resourceType: "Patient", id: "new" };
  const bundle = { resourceType: "Bundle", type: "transaction", entry: [
    { fullUrl: "urn:uuid:old", resource: original, request: { method: "PUT", url: "Observation/old" } },
    { resource: postResource, request: { method: "POST", url: "Patient" } },
    {},
  ] } as any;

  const prepared = QuestionnaireResponseService.prepareExtractedBundleForSubmission(bundle, "org-1");
  expect(prepared.entry?.[0]).toMatchObject({
    resource: { resourceType: "Observation", subject: { identifier: { value: "org-1" } } },
    request: { method: "POST", url: "Observation" },
  });
  expect(prepared.entry?.[0].resource?.id).toBeUndefined();
  expect(prepared.entry?.[0].fullUrl).toBeUndefined();
  expect(prepared.entry?.[1].resource).toBe(postResource);
  expect(prepared.entry?.[2]).toEqual({});
  expect(bundle.entry[0].resource.id).toBe("old");
});
