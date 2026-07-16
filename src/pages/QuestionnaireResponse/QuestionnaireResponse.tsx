// React
import { FunctionComponent, useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// Components
import SphinxPage from "../../components/SphinxPage/SphinxPage";
// Resources
import { FhirResource, QuestionnaireResponse, Bundle } from "fhir/r5";
// Translation
import i18n from "i18next";
// FHIR
import Client from "fhir-kit-client";
// HL7-Front-Library
import { QuestionnaireComponent } from "@fyrstain/hl7-front-library";
import UserService from "../../services/UserService";
import QuestionnaireResponseService from "../../services/QuestionnaireResponseService";

const QuestionnaireResponseFiller: FunctionComponent = () => {
  /////////////////////////////////////
  //      Constants / ValueSet       //
  /////////////////////////////////////

  const navigate = useNavigate();

  // Questionnaire constants
  const { questionnaireId } = useParams();

  const [loading] = useState(false);

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
   * To handle the submit of the QuestionnaireResponse.
   * @param response The QuestionnaireResponse to submit.
   * @param bundle The extracted Bundle returned by the library.
   */
  const handleSubmit = (
    response: QuestionnaireResponse,
    bundle?: Bundle
  ) => {
    const userEmail = UserService.getEmail();
    response.author = { identifier: { value: userEmail } };

    fhirClient
      .create({ body: response, resourceType: "QuestionnaireResponse" })
      .then((created) => {
        if (bundle) {
          const normalizedBundle =
            QuestionnaireResponseService.prepareExtractedBundleForSubmission(
              bundle,
              userEmail,
            );

          extractedClient
            .batch({
              body: normalizedBundle as FhirResource & { type: "batch" },
            })
            .catch((e) => {
              //TODO Voir ce qu'on fait ici !
              console.log(e);
            });
        } else {
          QuestionnaireResponseService.extract(response)
            .then((extractedBundle) => {
              const normalizedBundle =
                QuestionnaireResponseService.prepareExtractedBundleForSubmission(
                  extractedBundle,
                  userEmail,
                );

              extractedClient
                .batch({
                  body: normalizedBundle as FhirResource & { type: "batch" },
                })
                .catch((e) => {
                  //TODO Voir ce qu'on fait ici !
                  console.log(e);
                });
            })
            .catch((e) => {
              //TODO Voir ce qu'on fait ici !
              console.log(e);
            });
        }

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
        <QuestionnaireComponent
          language={i18n.t}
          dataUrl={process.env.REACT_APP_FHIR_URL ?? "fhir"}
          sdcUrl={process.env.REACT_APP_QUESTIONNAIRE_URL ?? "fhir"}
          terminologyUrl={process.env.REACT_APP_FHIR_URL ?? "fhir"}
          questionnaireUrl={`${process.env.REACT_APP_QUESTIONNAIRE_CANONICAL_BASE_URL}/${questionnaireId}`}
          contextSelection={{
            enabled: true,
            title: "Sélectionner un service",
            displayMode: "modal",
            resourceTypes: ["Organization"],
          }}
          populateOnContextSelection={true}
          onSubmit={handleSubmit}
          onError={onError}
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

export default QuestionnaireResponseFiller;
