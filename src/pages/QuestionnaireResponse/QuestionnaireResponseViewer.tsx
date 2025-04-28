// React
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// Components
import SphinxPage from "../../components/SphinxPage/SphinxPage";
import QuestionnaireResponseService from "../../services/QuestionnaireResponseService";
// Resources
import { FhirResource, Questionnaire, QuestionnaireResponse } from "fhir/r5";
// Translation
import i18n from "i18next";
// FHIR
import Client from "fhir-kit-client";
// HL7-Front-Library
import { QuestionnaireDisplay, ValueSetLoader } from "@fyrstain/hl7-front-library";
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
    {} as Questionnaire
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

  const fhirClient = new Client({
    baseUrl: process.env.REACT_APP_FHIR_URL ?? "fhir",
  });

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

  useEffect(() => {
    load();
  }, []);

  /**
   * To load the Questionnaire and use the $populate operation.
   */
  async function load() {
    try {
      setLoading(true);
      const questionnaireResponse = await QuestionnaireResponseService.loadQuestionnaireResponse(
        questionnaireResponseId as string
      );
      setQuestionnaireResponseResource(questionnaireResponse);
      const contained = questionnaireResponse.contained as FhirResource[]
      const questionnaire = contained[0]  as Questionnaire
      setQuestionnaireResource(questionnaire);
    } catch (error) {
      onError();
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  /**
   * To handle the submit of the QuestionnaireResponse.
   * @param response The QuestionnaireResponse to submit.
   */
  const handleSubmit = (response: QuestionnaireResponse) => {
    setQuestionnaireResponseResource(response);
    response.subject = undefined;
    response.author = {identifier : {value : UserService.getEmail()}}
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
