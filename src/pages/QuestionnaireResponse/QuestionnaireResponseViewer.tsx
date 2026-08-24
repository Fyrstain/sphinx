// React
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Toast, ToastContainer } from "react-bootstrap";
// Components
import SphinxPage from "../../components/SphinxPage/SphinxPage";
// Services
import QuestionnaireService from "../../services/QuestionnaireService";
import QuestionnaireResponseService from "../../services/QuestionnaireResponseService";
import CDSHooksService, { CDSHooksContext } from "../../services/CDSHooksService";
import UserService from "../../services/UserService";
// Resources
import {
  FhirResource,
  Questionnaire,
  QuestionnaireResponse,
} from "fhir/r5";
// Translation
import i18n from "i18next";
// FHIR
import Client from "fhir-kit-client";
// HL7-Front-Library
import {
  QuestionnaireDisplay,
  ValueSetLoader,
  CDSCards,
  CDSCardData,
} from "@fyrstain/hl7-front-library";
// CSS
import "./QuestionnaireResponseViewer.css";

const QuestionnaireResponseViewer: FunctionComponent = () => {
  /////////////////////////////////////
  //      Constants / ValueSet       //
  /////////////////////////////////////

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Questionnaire constants
  const { questionnaireResponseId } = useParams();

  const [questionnaireResource, setQuestionnaireResource] =
    useState<Questionnaire>({} as Questionnaire);

  const [questionnaireResponseResource, setQuestionnaireResponseResource] =
    useState<QuestionnaireResponse>({} as QuestionnaireResponse);

  // Alerts and cards
  const [alert, setAlert] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);

  const [cards, setCards] = useState<CDSCardData[]>([]);
  const [showCDSToast, setShowCDSToast] = useState(false);

  /////////////////////////////////////
  //             Client              //
  /////////////////////////////////////

  const fhirClient = useMemo(
    () =>
      new Client({
        baseUrl: process.env.REACT_APP_FHIR_URL ?? "fhir",
      }),
    [],
  );

  const valueSetLoader = useMemo(
    () => new ValueSetLoader(fhirClient),
    [fhirClient],
  );

  //////////////////////////////
  //           Error          //
  //////////////////////////////

  /**
   * Navigate to the Error page.
   */
  const onError = useCallback(() => {
    navigate("/Error");
  }, [navigate]);

  ////////////////////////////////
  //           Actions          //
  ////////////////////////////////

  /**
   * Load the Questionnaire and QuestionnaireResponse.
   */
  const load = useCallback(async () => {
    if (!questionnaireResponseId) {
      onError();
      return;
    }

    try {
      setLoading(true);

      const questionnaireResponse =
        await QuestionnaireResponseService.loadQuestionnaireResponse(
          questionnaireResponseId,
        );

      setQuestionnaireResponseResource(questionnaireResponse);

      const containedQuestionnaire = (
        questionnaireResponse.contained as FhirResource[] | undefined
      )?.find(
        (resource): resource is Questionnaire =>
          resource.resourceType === "Questionnaire",
      );

      const questionnaire = questionnaireResponse.questionnaire
        ? await QuestionnaireService.loadQuestionnaireByCanonical(
            questionnaireResponse.questionnaire,
          )
        : undefined;

      const resolvedQuestionnaire = questionnaire ?? containedQuestionnaire;

      if (!resolvedQuestionnaire) {
        throw new Error("Questionnaire not found in QuestionnaireResponse");
      }

      setQuestionnaireResource(resolvedQuestionnaire);
    } catch (error) {
      console.error(
        "Error while loading QuestionnaireResponse:",
        error,
      );

      onError();
    } finally {
      setLoading(false);
    }
  }, [questionnaireResponseId, onError]);

  /**
   * Handle the submit of the QuestionnaireResponse.
   *
   * @param response The QuestionnaireResponse to submit.
   */
  const handleSubmit = (response: QuestionnaireResponse): void => {
    setQuestionnaireResponseResource(response);

    response.subject = undefined;
    response.author = {
      identifier: {
        value: UserService.getEmail(),
      },
    };

    fhirClient
      .create({
        body: response,
        resourceType: "QuestionnaireResponse",
      })
      .then(() => {
        setAlert({
          message: "text.successsubmitform",
          isError: false,
        });

        setTimeout(() => {
          navigate("/Home");
        }, 3000);
      })
      .catch((error) => {
        console.error(
          "Error while creating QuestionnaireResponse:",
          error,
        );

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
   * Fetch CDS cards when the QuestionnaireResponse is loaded.
   */
  useEffect(() => {
    const fetchCDSCards = async (): Promise<void> => {
      if (!questionnaireResponseResource.id) {
        return;
      }

      try {
        const context: CDSHooksContext = {
          patientId:
            questionnaireResponseResource.subject?.reference
              ?.split("/")
              .at(1) ?? "",
          studyId: "FLUTE",
          libraryId: "FLUTEPcaInclusionCriteria",
          inclusionExpression: "isIncluded",
          contentServer: process.env.REACT_APP_FHIR_URL,
          terminologyServer: process.env.REACT_APP_TERMINOLOGY_URL,
          CQLEngineServer: process.env.REACT_APP_CQL_URL,
        };

        const result =
          await CDSHooksService.callResearchEligibilityCheck(context);

        setCards(result);
        setShowCDSToast(true);

        window.setTimeout(() => {
          setShowCDSToast(false);
        }, 20000);
      } catch (error) {
        console.error("CDS Hooks error:", error);
      }
    };

    fetchCDSCards();
  }, [questionnaireResponseResource]);

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
        <ToastContainer
          className="position-fixed qrv-toast-container"
          position="top-end"
        >
          <Toast
            onClose={() => setShowCDSToast(false)}
            show={showCDSToast}
            autohide
            delay={10000}
            className="qrv-toast"
          >
            <Toast.Body className="p-0 position-relative">
              <button
                type="button"
                onClick={() => setShowCDSToast(false)}
                aria-label="Close"
                className="btn-close position-absolute top-0 end-0 m-3 qrv-toast-close"
              />

              <CDSCards cards={cards} language={i18n.t} />
            </Toast.Body>
          </Toast>
        </ToastContainer>

        {questionnaireResponseResource.subject?.reference && (
          <div className="mb-3">
            <label className="form-label">
              Ressource sélectionnée
            </label>

            <select
              className="form-select"
              value={questionnaireResponseResource.subject.reference}
              disabled
            >
              <option value={questionnaireResponseResource.subject.reference}>
                {questionnaireResponseResource.subject.display ??
                  questionnaireResponseResource.subject.reference}
              </option>
            </select>
          </div>
        )}

        <QuestionnaireDisplay
          language={i18n.t}
          questionnaire={questionnaireResource}
          questionnaireResponse={questionnaireResponseResource}
          valueSetLoader={valueSetLoader}
          readOnly={true}
          onSubmit={handleSubmit}
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
