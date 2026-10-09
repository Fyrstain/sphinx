import { TextDecoder as NodeTextDecoder } from "util";
import QuestionnaireService from "./QuestionnaireService";

const mockRead = jest.fn();
const mockCreate = jest.fn();
const mockOperation = jest.fn();

jest.mock("fhir-kit-client", () => ({
  __esModule: true,
  default: class {
    read(...args: unknown[]) { return mockRead(...args); }
    create(...args: unknown[]) { return mockCreate(...args); }
    operation(...args: unknown[]) { return mockOperation(...args); }
  },
}));

const originalFetch = global.fetch;
const originalDecoder = global.TextDecoder;

beforeAll(() => {
  Object.defineProperty(global, "TextDecoder", { configurable: true, value: NodeTextDecoder });
});

afterAll(() => {
  Object.defineProperty(global, "TextDecoder", { configurable: true, value: originalDecoder });
  global.fetch = originalFetch;
});

beforeEach(() => {
  mockRead.mockReset();
  mockCreate.mockReset();
  mockOperation.mockReset();
});

test("reads and creates questionnaires using FHIR resources", async () => {
  const questionnaire = { resourceType: "Questionnaire", id: "q-1", status: "active" };
  mockRead.mockResolvedValue(questionnaire);
  mockCreate.mockResolvedValue(questionnaire);

  await expect(QuestionnaireService.loadQuestionnaire("q-1")).resolves.toBe(questionnaire);
  await expect(QuestionnaireService.createQuestionnaire(questionnaire as any)).resolves.toBe(questionnaire);
  expect(mockRead).toHaveBeenCalledWith({ resourceType: "Questionnaire", id: "q-1" });
  expect(mockCreate).toHaveBeenCalledWith({ resourceType: "Questionnaire", body: questionnaire });
});

test("calls $populate with the questionnaire and the subject", async () => {
  const questionnaire = { resourceType: "Questionnaire", id: "q-1", status: "active" };
  const response = { resourceType: "QuestionnaireResponse", status: "in-progress" };
  mockOperation.mockResolvedValue(response);

  await expect(QuestionnaireService.populate(questionnaire as any, "Patient/123"))
    .resolves.toBe(response);
  expect(mockOperation).toHaveBeenCalledWith({
    name: "populate",
    resourceType: "Questionnaire",
    input: { resourceType: "Parameters", parameter: [
      { name: "questionnaire", resource: questionnaire },
      { name: "subject", valueString: "Patient/123" },
    ] },
  });
});

test("resolves a versioned canonical from a FHIR bundle", async () => {
  const questionnaire = { resourceType: "Questionnaire", id: "q-2" };
  const bytes = Uint8Array.from(Buffer.from(JSON.stringify({ entry: [{ resource: questionnaire }] })));
  global.fetch = jest.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => bytes.buffer }) as any;

  await expect(QuestionnaireService.loadQuestionnaireByCanonical("https://example.test/questionnaire|2"))
    .resolves.toEqual(questionnaire);
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringMatching(/Questionnaire\?url=https%3A%2F%2Fexample\.test%2Fquestionnaire&version=2$/),
    { method: "GET", headers: { Accept: "application/fhir+json" } },
  );
});

test("returns undefined for an empty canonical search and rejects server errors", async () => {
  const bytes = Uint8Array.from(Buffer.from(JSON.stringify({ entry: [] })));
  global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, arrayBuffer: async () => bytes.buffer })
    .mockResolvedValueOnce({ ok: false, status: 503 }) as any;

  await expect(QuestionnaireService.loadQuestionnaireByCanonical("https://example.test/q"))
    .resolves.toBeUndefined();
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringMatching(/Questionnaire\?url=https%3A%2F%2Fexample\.test%2Fq$/),
    expect.any(Object),
  );
  await expect(QuestionnaireService.loadQuestionnaireByCanonical("https://example.test/q"))
    .rejects.toThrow("Questionnaire search error: 503");
});

test("handles a missing id and a bundle without entries using an explicit server URL", async () => {
  const previousFhirUrl = process.env.REACT_APP_FHIR_URL;
  const previousOperationUrl = process.env.REACT_APP_QUESTIONNAIRE_URL;
  try {
    process.env.REACT_APP_FHIR_URL = "https://fhir.example.test";
    process.env.REACT_APP_QUESTIONNAIRE_URL = "https://operations.example.test";
    jest.resetModules();
    const configuredService = require("./QuestionnaireService").default;
    mockRead.mockResolvedValue({ resourceType: "Questionnaire" });
    const bytes = Uint8Array.from(Buffer.from(JSON.stringify({ resourceType: "Bundle" })));
    global.fetch = jest.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => bytes.buffer }) as any;

    await expect(configuredService.loadQuestionnaire(null)).resolves.toMatchObject({ resourceType: "Questionnaire" });
    expect(mockRead).toHaveBeenCalledWith({ resourceType: "Questionnaire", id: "" });
    await expect(configuredService.loadQuestionnaireByCanonical("https://example.test/q"))
      .resolves.toBeUndefined();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\/fhir\.example\.test\/Questionnaire\?/),
      expect.any(Object),
    );
  } finally {
    if (previousFhirUrl === undefined) delete process.env.REACT_APP_FHIR_URL;
    else process.env.REACT_APP_FHIR_URL = previousFhirUrl;
    if (previousOperationUrl === undefined) delete process.env.REACT_APP_QUESTIONNAIRE_URL;
    else process.env.REACT_APP_QUESTIONNAIRE_URL = previousOperationUrl;
  }
});

test("uses the relative FHIR URL when no server URLs are configured", async () => {
  const previousFhirUrl = process.env.REACT_APP_FHIR_URL;
  const previousOperationUrl = process.env.REACT_APP_QUESTIONNAIRE_URL;
  try {
    delete process.env.REACT_APP_FHIR_URL;
    delete process.env.REACT_APP_QUESTIONNAIRE_URL;
    jest.resetModules();
    const defaultService = require("./QuestionnaireService").default;
    const bytes = Uint8Array.from(Buffer.from(JSON.stringify({ entry: [] })));
    global.fetch = jest.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => bytes.buffer }) as any;

    await expect(defaultService.loadQuestionnaireByCanonical("https://example.test/q"))
      .resolves.toBeUndefined();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/^fhir\/Questionnaire\?/),
      expect.any(Object),
    );
  } finally {
    if (previousFhirUrl !== undefined) process.env.REACT_APP_FHIR_URL = previousFhirUrl;
    if (previousOperationUrl !== undefined) process.env.REACT_APP_QUESTIONNAIRE_URL = previousOperationUrl;
  }
});
