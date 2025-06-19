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
  // Use the parameter questionnaire
  let parameter: Parameters = {
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
  });
}

///////////////////////////////
//        exports            //
///////////////////////////////

const QuestionnaireService = {
  populate,
  createQuestionnaire,
  loadQuestionnaire,
};

export default QuestionnaireService;
