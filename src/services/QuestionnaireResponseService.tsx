// Resources
import { Questionnaire, Parameters, QuestionnaireResponse, Bundle, BundleEntry } from "fhir/r5";
// FHIR
import Client from "fhir-kit-client";
import { error } from "console";

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
 * Load Questionnaire Response from the back to populate the fields.
 *
 * @returns the promise of a Questionnaire Response.
 */
async function loadQuestionnaireResponse(
  questionnaireId: string
): Promise<QuestionnaireResponse> {
  return fhirClient.read({
    resourceType: "QuestionnaireResponse",
    id: questionnaireId ?? "",
  }).then(async response => {
    if ((response as QuestionnaireResponse).questionnaire) {
      await fhirClient.search({
        resourceType: "Questionnaire",
        searchParams: { url: (response as QuestionnaireResponse).questionnaire},
      }).then(questionnairelist => {
        const entries = (questionnairelist as Bundle).entry as BundleEntry<Questionnaire>[];
        (response as QuestionnaireResponse).contained?.push(entries[0].resource as Questionnaire);
      })
    }
    return response;
  }) as Promise<QuestionnaireResponse>;
}

///////////////////////////////
//        exports            //
///////////////////////////////

const QuestionnaireResponseService = {
  loadQuestionnaireResponse,
};

export default QuestionnaireResponseService;
