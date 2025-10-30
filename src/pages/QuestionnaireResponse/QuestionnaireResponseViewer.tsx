// React
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
// Components
import SphinxPage from "../../components/SphinxPage/SphinxPage";
import QuestionnaireResponseService from "../../services/QuestionnaireResponseService";
// Resources
import {
  FhirResource,
  Questionnaire,
  Parameters,
  QuestionnaireResponse,
} from "fhir/r5";
// Translation
import i18n from "i18next";
// FHIR
import Client from "fhir-kit-client";
// HL7-Front-Library
import {
  QuestionnaireDisplay,
  submitToast,
  ToastViewer,
  ValueSetLoader,
} from "@fyrstain/hl7-front-library";
import UserService from "../../services/UserService";

const QuestionnaireResponseViewer: FunctionComponent = () => {
  /////////////////////////////////////
  //      Constants / ValueSet       //
  /////////////////////////////////////

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Questionnaire constants
  const { questionnaireResponseId } = useParams();
  const [questionnaireResource, setQuestionnaireResource] = useState(
    {} as Questionnaire,
  );
  const [questionnaireResponseResource, setQuestionnaireResponseResource] =
    useState({} as QuestionnaireResponse);

  // An alert to display success or error message
  const [alert, setAlert] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);

  /////////////////////////////////////
  //             Client              //
  /////////////////////////////////////

  const fhirClient = useMemo(() => {
    return new Client({
      baseUrl: process.env.REACT_APP_FHIR_URL ?? "fhir",
    });
  }, []);

  const libClient = useMemo(() => {
    return new Client({
      baseUrl: process.env.REACT_APP_CQL_URL ?? "fhir",
    });
  }, []);

  //////////////////////////////
  //           Error          //
  //////////////////////////////

  /**
   * Navigate to the Error page
   */
  const onError = useCallback(() => {
    navigate("/Error");
  }, [navigate]);

  ////////////////////////////////
  //           Actions          //
  ////////////////////////////////

  /**
   * To load the Questionnaire and use the $populate operation.
   */
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const questionnaireResponse =
        await QuestionnaireResponseService.loadQuestionnaireResponse(
          questionnaireResponseId as string,
        );
      setQuestionnaireResponseResource(questionnaireResponse);
      const contained = questionnaireResponse.contained as FhirResource[];
      const questionnaire = contained[0] as Questionnaire;
      setQuestionnaireResource(questionnaire);
    } catch (error) {
      onError();
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [questionnaireResponseId, onError]);

  /**
   * To handle the submit of the QuestionnaireResponse.
   * @param response The QuestionnaireResponse to submit.
   */
  const handleSubmit = (response: QuestionnaireResponse) => {
    setQuestionnaireResponseResource(response);
    response.subject = undefined;
    response.author = { identifier: { value: UserService.getEmail() } };
    fhirClient
      .create({ body: response, resourceType: "QuestionnaireResponse" })
      .then(() => {
        setAlert({
          message: "text.successsubmitform",
          isError: false,
        });
        setTimeout(() => {
          navigate("/Home");
        }, 3000);
      })
      .catch(() => {
        setAlert({
          message: "text.errorsubmitform",
          isError: true,
        });
      });
  };

  ///////////////////////////////
  //          Life cycle       //
  ///////////////////////////////

  /**
   * Load the Questionnaire and QuestionnaireResponse when the component is mounted.
   */
  useEffect(() => {
    load();
  }, [load]);

  /**
   * Load the Questionnaire and QuestionnaireResponse when the questionnaireResponseId changes.
   */
  useEffect(() => {
    if (questionnaireResponseResource && questionnaireResponseResource.id) {
      //Builds the parameter for the call
      const parameters: Parameters = {
        resourceType: "Parameters",
        parameter: [
          {
            name: "terminologyEndpoint",
            resource: {
              resourceType: "Endpoint",
              status: "active",
              connectionType: [
                {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystem/endpoint-connection-type",
                      code: "hl7-fhir-rest",
                    },
                  ],
                },
              ],
              address: process.env.REACT_APP_FHIR_URL ?? "/fhir",
              header: ["Content-Type: application/json"],
            },
          },
          {
            name: "contentEndpoint",
            resource: {
              resourceType: "Endpoint",
              status: "active",
              connectionType: [
                {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystem/endpoint-connection-type",
                      code: "hl7-fhir-rest",
                    },
                  ],
                },
              ],
              address: process.env.REACT_APP_FHIR_URL ?? "/fhir",
              header: ["Content-Type: application/json"],
            },
          },
          {
            name: "dataEndpoint",
            resource: {
              resourceType: "Endpoint",
              status: "active",
              connectionType: [
                {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystem/endpoint-connection-type",
                      code: "hl7-fhir-rest",
                    },
                  ],
                },
              ],
              address: process.env.REACT_APP_FHIR_URL ?? "/fhir",
              header: ["Content-Type: application/json"],
            },
          },
          {
            name: "subject",
            valueString:
              questionnaireResponseResource.subject?.reference
                ?.split("/")
                .at(1) ?? "",
          },
        ],
      };

      //Call the library evaluation
      libClient
        .operation({
          resourceType: "Library",
          name: "$evaluate",
          id: "FLUTEPcaInclusionCriteria",
          method: "POST",
          input: parameters,
        })
        .then((response) => {
          //One-sentence, <140-character summary message for display to the user inside of this card.
          var included = (response as Parameters).parameter?.filter(
            (param) => param.name === "isIncluded",
          )[0]?.valueBoolean;

          submitToast({
            summary: included
              ? i18n.t("label.eligible")
              : i18n.t("label.noteligible"),
            indicator: "info",
            source: "CDS Hook : FLUTEPcaInclusionCriteria",
          });
        })
        .catch((error) => {
          onError();
        });
    }
  }, [questionnaireResponseResource, libClient, onError]);

  //////////////////////////////
  //          Content         //
  //////////////////////////////

  return (
    <SphinxPage
      titleKey="title.questionnaireresponseform"
      loading={loading}
      fitFooter={true}
      needsLogin={false}
    >
      <>
        <ToastViewer />
        <QuestionnaireDisplay
          language={i18n.t}
          questionnaire={questionnaireResource}
          questionnaireResponse={questionnaireResponseResource}
          valueSetLoader={new ValueSetLoader(fhirClient)}
          onSubmit={handleSubmit}
          onError={() => {}}
        />
        {alert && (
          <div
            className={`mt-3 alert ${
              alert.isError ? "alert-danger" : "alert-success"
            }`}
            role="alert"
          >
            {i18n.t(alert.message)}
          </div>
        )}
      </>
    </SphinxPage>
  );
};

export default QuestionnaireResponseViewer;
