import { CDSCardProps } from "@fyrstain/hl7-front-library";

export type CDSCard = CDSCardProps["card"];

export interface CDSHooksContext {
  patientId: string;
  studyId: string;
  libraryId: string;
  inclusionExpression: string;
  contentServer?: string;
  terminologyServer?: string;
  CQLEngineServer?: string;
}

async function callResearchEligibilityCheck(
  context: CDSHooksContext,
): Promise<CDSCard[]> {
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

const CDSHooksService = {
  callResearchEligibilityCheck,
};

export default CDSHooksService;