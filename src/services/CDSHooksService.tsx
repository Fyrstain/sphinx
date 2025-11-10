import { CDSCardData } from "@fyrstain/hl7-front-library";

/**
 * Context required by the CDS Hooks to evaluate study eligibility.
 */
export interface CDSHooksContext {
  /** ID of the patient to evaluate */
  patientId: string;

  /** Clinical study ID, e.g., "FLUTE" */
  studyId: string;

  /** ID of the CQL library to use for the calculation */
  libraryId: string;

  /** CQL expression to evaluate for inclusion */
  inclusionExpression: string;

  /** Optional FHIR server URL containing the patient's data */
  contentServer?: string;

  /** Optional terminology server URL (ValueSet, CodeSystem) */
  terminologyServer?: string;

  /** Optional CQL/Expression Engine server URL */
  CQLEngineServer?: string;
}

/**
 * Calls the CDS Service "Research Eligibility Check" to retrieve Clinical Decision Support cards.
 * @param context - Context including patientId, studyId, libraryId, inclusionExpression, and optional servers
 * @returns A promise resolved with a list of CDS cards (CDSCardData[])
 * @throws Error if the CDS service response is not OK
 */
async function callResearchEligibilityCheck(
  context: CDSHooksContext,
): Promise<CDSCardData[]> {
  const payload = {
    hook: "patient-view",
    hookInstance: `${Date.now()}`,
    fhirServer: process.env.REACT_APP_FHIR_URL,
    context,
  };

  const response = await fetch(
    `${process.env.REACT_APP_CDSHOOKS_URL}/cds-services/research-eligibility-check`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(`CDS Hooks error: ${response.status}`);
  }

  const data = await response.json();
  return data.cards || [];
}

/**
 * CDS Hooks service containing available CDS service calls
 */
const CDSHooksService = {
  callResearchEligibilityCheck,
};

export default CDSHooksService;