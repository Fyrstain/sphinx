// React
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// Components
import SphinxPage from "../../components/SphinxPage/SphinxPage";
import QuestionnaireService from "../../services/QuestionnaireService";
// Resources
import { FhirResource, Questionnaire, QuestionnaireResponse } from "fhir/r5";
// Translation
import i18n from "i18next";
// FHIR
import Client from "fhir-kit-client";
// HL7-Front-Library
import {
  QuestionnaireDisplay,
  Title,
  ValueSetLoader,
} from "@fyrstain/hl7-front-library";
import UserService from "../../services/UserService";
import PatientService, {
  ResourceSelectItem,
} from "../../services/PatientService";
import { Form } from "react-bootstrap";
import QuestionnaireResponseService from "../../services/QuestionnaireResponseService";

const QuestionnaireResponseFiller: FunctionComponent = () => {
  /////////////////////////////////////
  //      Constants / ValueSet       //
  /////////////////////////////////////

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState("");

  // Questionnaire constants
  const { questionnaireId } = useParams();
  const [patientList, setPatientList] = useState([] as ResourceSelectItem[]);
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
      setPatientList(await PatientService.getPatientList());
      const questionnaire = await QuestionnaireService.loadQuestionnaire(
        questionnaireId as string,
      );
      setQuestionnaireResource(questionnaire);
    } catch (error) {
      onError();
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [questionnaireId, onError]);

  /**
   * Returns the list of options for patients.
   */
  const getOptions = () => {
    return patientList.map((patient) => (
      <option value={patient.value}>{patient.display}</option>
    ));
  };

  /**
   * To handle the submit of the QuestionnaireResponse.
   * @param response The QuestionnaireResponse to submit.
   */
  const handleSubmit = (response: QuestionnaireResponse) => {
    setQuestionnaireResponseResource(response);
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
   * Handle the choice of a patient.
   *
   * @param event the change event
   */
  async function handleChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ): Promise<void> {
    try {
      setLoading(true);
      const questionnaireResponse = await QuestionnaireService.populate(
        questionnaireResource,
        event.target.value,
      );
      setQuestionnaireResponseResource(questionnaireResponse);
      setPatient(event.target.value);
    } catch (error) {
      onError();
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

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
        <Title level={2} content={i18n.t("title.choosepatient")} />
        <br />
        <Form.Select
          value={patient}
          disabled={patient !== ""}
          onChange={handleChange}
        >
          <option value="">-- {i18n.t("title.choosepatient")} --</option>
          {getOptions()}
        </Form.Select>
        <br />

        {patient !== "" && (
          <QuestionnaireDisplay
            language={i18n.t}
            questionnaire={questionnaireResource}
            questionnaireResponse={questionnaireResponseResource}
            valueSetLoader={new ValueSetLoader(fhirClient)}
            onSubmit={handleSubmit}
            onError={() => {}}
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
