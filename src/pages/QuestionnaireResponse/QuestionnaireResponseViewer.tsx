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
import QuestionnaireResponseService from "../../services/QuestionnaireResponseService";
import CDSHooksService, {
  CDSHooksContext,
  CDSCard,
} from "../../services/CDSHooksService";
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
  CDSCards
} from "@fyrstain/hl7-front-library";

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

  // Alerts and cards
  const [alert, setAlert] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);
  const [cards, setCards] = useState<CDSCard[]>([]);
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
    const fetchCDSCards = async () => {
      if (!questionnaireResponseResource?.id) return;

      try {
        const context: CDSHooksContext = {
          patientId:
            questionnaireResponseResource.subject?.reference?.split("/")?.at(1) ??
            "",
          studyId: "FLUTE",
          libraryId: "FLUTEPcaInclusionCriteria",
          inclusionExpression: "isIncluded",
          contentServer: process.env.REACT_APP_FHIR_URL,
          terminologyServer: process.env.REACT_APP_TERMINOLOGY_URL,
          CQLEngineServer: process.env.REACT_APP_CQL_URL,
        };

        const result = await CDSHooksService.callResearchEligibilityCheck(context);
        setCards(result);
        setShowCDSToast(true);
        window.setTimeout(() => setShowCDSToast(false), 20000);
      } catch (error) {
        console.error("CDS Hooks error:", error);
        onError();
      }
    };

    fetchCDSCards();
  }, [questionnaireResponseResource, onError]);

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
          className="position-fixed"
          position="top-end"
          style={{
            zIndex: 1060,
            transform: 'translate(-0.75rem, 5rem)'
          }}
        >
          <Toast
            onClose={() => setShowCDSToast(false)}
            show={showCDSToast}
            autohide
            delay={100000}
            style={{
              minWidth: "28rem",
              maxWidth: "32rem",
              backgroundColor: "transparent",
              border: "none",
              boxShadow: "none",
            }}
          >
            <Toast.Body className="p-0 position-relative">
              <button
                type="button"
                onClick={() => setShowCDSToast(false)}
                aria-label="Close"
                className="btn-close position-absolute top-0 end-0 m-3"
                style={{ zIndex: 2 }}
              ></button>

              <CDSCards cards={cards} />
            </Toast.Body>
          </Toast>
        </ToastContainer>

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
