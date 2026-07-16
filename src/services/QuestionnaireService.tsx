// Resources
import { Questionnaire, Parameters, QuestionnaireResponse } from "fhir/r5";
// FHIR
import Client from "fhir-kit-client";

/////////////////////////////////////
//             Client              //
/////////////////////////////////////

const fhirClient = new Client({
  baseUrl: process.env.REACT_APP_FHIR_URL ?? "fhir",
});

const fhirOperationClient = new Client({
  baseUrl: process.env.REACT_APP_QUESTIONNAIRE_URL ?? "fhir",
});

/**
 * Load Questionnaire from the back to populate the fields.
 *
 * @returns the promise of a Questionnaire.
 */
async function loadQuestionnaire(
  questionnaireId: string,
): Promise<Questionnaire> {
  return fhirClient.read({
    resourceType: "Questionnaire",
    id: questionnaireId ?? "",
  }) as Promise<Questionnaire>;
}

/**
 * Load Questionnaire from its canonical URL.
 */
async function loadQuestionnaireByCanonical(
  canonical: string,
): Promise<Questionnaire | undefined> {
  const [url, version] = canonical.split("|");
  const searchParams = new URLSearchParams({ url });

  if (version) {
    searchParams.set("version", version);
  }

  const response = await fetch(
    `${
      process.env.REACT_APP_FHIR_URL ?? "fhir"
    }/Questionnaire?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/fhir+json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Questionnaire search error: ${response.status}`);
  }

  const responseBuffer = await response.arrayBuffer();
  const responseText = new TextDecoder("utf-8").decode(responseBuffer);
  const bundle = JSON.parse(responseText) as {
    entry?: Array<{ resource?: Questionnaire }>;
  };

  return bundle.entry?.[0]?.resource;
}

/**
 * Create Questionnaire in the FHIR server.
 *
 * @returns the promise of a Questionnaire.
 */
async function createQuestionnaire(
  questionnaire: Questionnaire,
): Promise<Questionnaire> {
  return fhirClient.create({
    resourceType: "Questionnaire",
    body: questionnaire,
  }) as Promise<Questionnaire>;
}

/**
 * Function to use the operation Populate for a questionnaire
 */
async function populate(
  questionnaire: Questionnaire,
  subjectID: string,
): Promise<QuestionnaireResponse> {
  const parameter: Parameters = {
    resourceType: "Parameters",
    parameter: [
      {
        name: "questionnaire",
        resource: questionnaire,
      },
      {
        name: "subject",
        valueString: subjectID,
      },
    ],
  };

  return fhirOperationClient.operation({
    name: "populate",
    input: parameter,
    resourceType: "Questionnaire",
  }) as Promise<QuestionnaireResponse>;
}

///////////////////////////////
//        exports            //
///////////////////////////////

const QuestionnaireService = {
  populate,
  createQuestionnaire,
  loadQuestionnaire,
  loadQuestionnaireByCanonical,
};

export default QuestionnaireService;
