// React
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// Components
import SphinxPage from "../../components/SphinxPage/SphinxPage";
import QuestionnaireService from "../../services/QuestionnaireService";
// Resources
import { FhirResource, QuestionnaireResponse, Questionnaire } from "fhir/r5";
// Translation
import i18n from "i18next";
// FHIR
import Client from "fhir-kit-client";
// HL7-Front-Library
import { QuestionnaireComponent, QuestionnaireDisplay, ValueSetLoader } from "@fyrstain/hl7-front-library";
import UserService from "../../services/UserService";
import QuestionnaireResponseService from "../../services/QuestionnaireResponseService";

const QuestionnaireResponseFiller: FunctionComponent = () => {
  /////////////////////////////////////
  //      Constants / ValueSet       //
  /////////////////////////////////////

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questionnaireResource, setQuestionnaireResource] = useState<Questionnaire>();
  const [questionnaireResponseResource, setQuestionnaireResponseResource] = useState<QuestionnaireResponse>();
  const [selectedContextReference, setSelectedContextReference] = useState<string>();

  // Questionnaire constants
  const { questionnaireId } = useParams();

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

  const extractedClient = new Client({
    baseUrl: process.env.REACT_APP_EXTRACTED_URL ?? "fhir",
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

  /**
   * To load the Questionnaire and use the $populate operation.
   */
  const load = useCallback(async () => {
    try {
      setLoading(true);

      const questionnaire = await QuestionnaireService.loadQuestionnaire(
        questionnaireId as string,
      );
      setQuestionnaireResource(questionnaire);
    } catch (error) {
      onError();
    } finally {
      setLoading(false);
    }
  }, [questionnaireId, onError]);

  /**
   * To handle the submit of the QuestionnaireResponse.
   * @param response The QuestionnaireResponse to submit.
   */
  const handleSubmit = (response: QuestionnaireResponse) => {
   // setQuestionnaireResponseResource(response);
    response.author = { identifier: { value: UserService.getEmail() } };
    fhirClient
      .create({ body: response, resourceType: "QuestionnaireResponse" })
      .then((created) => {
        QuestionnaireResponseService.extract(response).then((bundle) => {
          extractedClient.batch({
            body: bundle as FhirResource & { type: "batch" },
          }).catch((e) => {
            //TODO Voir ce qu'on fait ici !
            console.log(e)
          });;
        }).catch((e) => {
          //TODO Voir ce qu'on fait ici !
          console.log(e)
        });

        setAlert({
          message: "text.successsubmitform",
          isError: false,
        });
        setTimeout(() => {
          navigate("/EditQuestionnaire/" + created.id);
        }, 3000);
      })
      .catch(() => {
        setAlert({
          message: "text.errorsubmitform",
          isError: true,
        });
      });
  };

 /**
   * Handle to change select context.
   *
   * @param event the change event
   */
const handleContextSelected = async (reference: string) => {
  try {
      setLoading(true);
      setSelectedContextReference(reference);

      if (!questionnaireResource) {
        return;
      }

      const questionnaireResponse = await QuestionnaireService.populate(
        questionnaireResource,
        reference,
      );
          console.log("Populate response:", questionnaireResponse);
          console.log("Questionnaire:", questionnaireResource);
          console.log(
      "Questionnaire items:",
      JSON.stringify(questionnaireResource?.item, null, 2)
    );
      setQuestionnaireResponseResource(questionnaireResponse);
    } catch (error) {
      onError();
    } finally {
      setLoading(false);
  }
};

  ///////////////////////////////
  //          Lifecycle        //
  ///////////////////////////////

  /**
   * Load the Questionnaire and QuestionnaireResponse when the component is mounted.
   */
  useEffect(() => {
    load();
  }, [load]);

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
      {selectedContextReference && (
        <div className="alert alert-info">
          Contexte sélectionné : {selectedContextReference}
        </div>
      )}
        <QuestionnaireComponent
          language={i18n.t}
          dataUrl={process.env.REACT_APP_FHIR_URL ?? "fhir"}
          sdcUrl={process.env.REACT_APP_QUESTIONNAIRE_URL ?? "fhir"}
          terminologyUrl={process.env.REACT_APP_FHIR_URL ?? "fhir"}
          questionnaireUrl={`${process.env.REACT_APP_QUESTIONNAIRE_CANONICAL_BASE_URL}/${questionnaireId}`}
          contextSelection={{
            enabled: selectedContextReference === undefined,
            title: "Sélectionner un service",
            displayMode: "modal",
            resourceTypes: ["Organization", "Patient"],
          }}
          populateOnContextSelection={false}
          onContextSelected={handleContextSelected}
          onSubmit={handleSubmit}
          onError={onError}
        />
        {questionnaireResource && questionnaireResponseResource && (
          <QuestionnaireDisplay
            language={i18n.t}
            questionnaire={questionnaireResource}
            questionnaireResponse={questionnaireResponseResource}
            valueSetLoader={new ValueSetLoader(fhirClient)}
            onSubmit={handleSubmit}
            onError={onError}
          />
        )}
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

export default QuestionnaireResponseFiller;