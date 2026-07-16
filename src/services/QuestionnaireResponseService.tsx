// Resources
import {
  Questionnaire,
  QuestionnaireResponse,
  Bundle,
  BundleEntry,
  FhirResource,
} from "fhir/r5";
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

type ResourceWithOptionalSubject = {
  resourceType: string;
  id?: string;
  subject?: {
    identifier?: {
      value?: string;
    };
    reference?: string;
    type?: string;
  };
};

type BundleEntryWithRequest = BundleEntry<FhirResource> & {
  request?: {
    method?: string;
    url?: string;
  };
  fullUrl?: string;
};

function normalizeResourceSubject(
  resource: FhirResource,
  subjectIdentifierValue: string,
): FhirResource {
  const resourceWithSubject = resource as FhirResource & ResourceWithOptionalSubject;
  const subjectReference = resourceWithSubject.subject?.reference;
  const subjectType = resourceWithSubject.subject?.type;
  const isOrganizationSubject =
    subjectReference?.startsWith("Organization/") ||
    subjectType === "Organization";

  if (!resourceWithSubject.subject || !isOrganizationSubject) {
    return resource;
  }

  return {
    ...resourceWithSubject,
    subject: {
      identifier: {
        value: subjectIdentifierValue,
      },
    },
  } as FhirResource;
}

function normalizeBundleEntryRequest(
  entry: BundleEntryWithRequest,
): BundleEntryWithRequest {
  const resource = entry.resource as ResourceWithOptionalSubject | undefined;

  if (!resource || entry.request?.method !== "PUT") {
    return entry;
  }

  const normalizedResource = {
    ...resource,
    id: undefined,
  } as FhirResource;

  return {
    ...entry,
    fullUrl: undefined,
    resource: normalizedResource,
    request: {
      ...entry.request,
      method: "POST",
      url: resource.resourceType,
    },
  };
}

/////////////////////////////////////
//            Functions            //
/////////////////////////////////////

/**
 * Load Questionnaire Response from the back to populate the fields.
 *
 * @returns the promise of a Questionnaire Response.
 */
async function loadQuestionnaireResponse(
  questionnaireId: string,
): Promise<QuestionnaireResponse> {
  return fhirClient
    .read({
      resourceType: "QuestionnaireResponse",
      id: questionnaireId ?? "",
    })
    .then(async (response) => {
      const questionnaireResponse = response as QuestionnaireResponse;

      if (
        questionnaireResponse.questionnaire &&
        !(questionnaireResponse.contained?.length)
      ) {
        const [questionnaireUrl, questionnaireVersion] =
          questionnaireResponse.questionnaire.split("|");

        await fhirClient
          .search({
            resourceType: "Questionnaire",
            searchParams: {
              url: questionnaireUrl,
              ...(questionnaireVersion ? { version: questionnaireVersion } : {}),
            },
          })
          .then((questionnairelist) => {
            const entries = (questionnairelist as Bundle)
              .entry as BundleEntry<Questionnaire>[];

            if (entries?.[0]?.resource) {
              questionnaireResponse.contained = [
                ...(questionnaireResponse.contained ?? []),
                entries[0].resource as Questionnaire,
              ];
            }
          });
      }

      return questionnaireResponse;
    }) as Promise<QuestionnaireResponse>;
}

/**
 * Extracts the QuestionnaireResponse into a Bundle using the $extract operation.
 *
 * @param questionnaireResponse The QuestionnaireResponse to extract.
 *
 */
async function extract(
  questionnaireResponse: QuestionnaireResponse,
): Promise<Bundle> {
  return fhirOperationClient.operation({
    name: "extract",
    resourceType: "QuestionnaireResponse",
    method: "POST",
    input: {
      resourceType: "Parameters",
      parameter: [
        {
          name: "questionnaire-response",
          resource: questionnaireResponse,
        },
      ],
    },
  });
}

/**
 * Replaces invalid Organization subjects in extracted resources with an identifier.
 */
function normalizeExtractedBundleSubject(
  bundle: Bundle,
  subjectIdentifierValue?: string,
): Bundle {
  if (!subjectIdentifierValue || !bundle.entry?.length) {
    return bundle;
  }

  return {
    ...bundle,
    entry: bundle.entry.map((entry) => {
      if (!entry.resource) {
        return entry;
      }

      const normalizedResource = normalizeResourceSubject(
        entry.resource,
        subjectIdentifierValue,
      );

      if (normalizedResource === entry.resource) {
        return entry;
      }

      return {
        ...entry,
        resource: normalizedResource,
      };
    }),
  };
}

/**
 * Prepares an extracted bundle to be submitted as create requests.
 */
function prepareExtractedBundleForSubmission(
  bundle: Bundle,
  subjectIdentifierValue?: string,
): Bundle {
  const normalizedBundle = normalizeExtractedBundleSubject(
    bundle,
    subjectIdentifierValue,
  );

  return {
    ...normalizedBundle,
    entry: normalizedBundle.entry?.map((entry) =>
      normalizeBundleEntryRequest(entry as BundleEntryWithRequest),
    ),
  };
}

///////////////////////////////
//        exports            //
///////////////////////////////

const QuestionnaireResponseService = {
  loadQuestionnaireResponse,
  extract,
  normalizeExtractedBundleSubject,
  prepareExtractedBundleForSubmission,
};

export default QuestionnaireResponseService;
