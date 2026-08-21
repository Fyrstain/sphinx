// React
import {
  ComponentProps,
  ComponentType,
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
// Components
import SphinxPage from "../../components/SphinxPage/SphinxPage";
// Resources
import { Bundle, FhirResource, QuestionnaireResponse } from "fhir/r5";
// Translation
import i18n from "i18next";
// FHIR
import Client from "fhir-kit-client";
// HL7-Front-Library
import { QuestionnaireComponent } from "@fyrstain/hl7-front-library";
// Services
import UserService from "../../services/UserService";
import QuestionnaireService from "../../services/QuestionnaireService";
import QuestionnaireResponseService from "../../services/QuestionnaireResponseService";

/**
 * Props ajoutées dans la nouvelle implémentation du QuestionnaireComponent,
 * mais absentes des types actuellement exposés par la librairie.
 */
type QuestionnaireWithContextProps = ComponentProps<
  typeof QuestionnaireComponent
> & {
  contextSelection?: {
    enabled: boolean;
    title?: string;
    displayMode?: "modal";
    searchMode?: "identifier";
    resourceTypes?: string[];
  };
  populateOnContextSelection?: boolean;
  onContextSelected?: (reference: string) => void;
};

/**
 * Adaptation locale du typage du composant.
 * Cela ne modifie pas la librairie.
 */
const QuestionnaireWithContext =
  QuestionnaireComponent as ComponentType<QuestionnaireWithContextProps>;

const QuestionnaireResponseFiller: FunctionComponent = () => {
  /////////////////////////////////////
  //      Constants / ValueSet       //
  /////////////////////////////////////

  const navigate = useNavigate();

  // Questionnaire constants
  const { questionnaireId } = useParams();

  const [loading, setLoading] = useState(true);
  const [questionnaireUrl, setQuestionnaireUrl] = useState<string>();
  const [contextResourceTypes, setContextResourceTypes] = useState<string[]>(
    [],
  );

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
   * Navigate to the Error page.
   */
  const onError = useCallback(() => {
    navigate("/Error");
  }, [navigate]);

  /**
   * Load the questionnaire's canonical URL. The route only contains its FHIR id,
   * whereas the rendering library expects the canonical URL.
   */
  useEffect(() => {
    let isMounted = true;

    if (!questionnaireId) {
      onError();
      return () => {
        isMounted = false;
      };
    }

    setLoading(true);
    setQuestionnaireUrl(undefined);
    setContextResourceTypes([]);

    const loadCanonicalUrl = async (): Promise<void> => {
      try {
        const questionnaire =
          await QuestionnaireService.loadQuestionnaire(questionnaireId);

        if (!questionnaire.url) {
          throw new Error("Questionnaire canonical URL is missing");
        }

        if (isMounted) {
          setQuestionnaireUrl(questionnaire.url);
          setContextResourceTypes(questionnaire.subjectType ?? []);
        }
      } catch (error) {
        console.error("Error while loading Questionnaire:", error);

        if (isMounted) {
          onError();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadCanonicalUrl();

    return () => {
      isMounted = false;
    };
  }, [onError, questionnaireId]);

  ////////////////////////////////
  //           Actions          //
  ////////////////////////////////

  /**
   * To handle the submit of the QuestionnaireResponse.
   *
   * @param response The QuestionnaireResponse to submit.
   * @param bundle The extracted Bundle returned by the library.
   */
  const handleSubmit = (
    response: QuestionnaireResponse,
    bundle?: Bundle,
  ): void => {
    const userEmail = UserService.getEmail();

    response.author = {
      identifier: {
        value: userEmail,
      },
    };

    fhirClient
      .create({
        body: response,
        resourceType: "QuestionnaireResponse",
      })
      .then((created) => {
        if (bundle) {
          const normalizedBundle =
            QuestionnaireResponseService.prepareExtractedBundleForSubmission(
              bundle,
              userEmail,
            );

          extractedClient
            .batch({
              body: normalizedBundle as FhirResource & {
                type: "batch";
              },
            })
            .catch((error) => {
              // TODO Voir ce qu'on fait ici !
              console.error(error);
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
                  body: normalizedBundle as FhirResource & {
                    type: "batch";
                  },
                })
                .catch((error) => {
                  // TODO Voir ce qu'on fait ici !
                  console.error(error);
                });
            })
            .catch((error) => {
              // TODO Voir ce qu'on fait ici !
              console.error(error);
            });
        }

        setAlert({
          message: "text.successsubmitform",
          isError: false,
        });

        setTimeout(() => {
          navigate(`/EditQuestionnaire/${created.id}`);
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
        {questionnaireUrl && (
          <QuestionnaireWithContext
            language={i18n.t}
            dataUrl={process.env.REACT_APP_FHIR_URL ?? "fhir"}
            sdcUrl={process.env.REACT_APP_QUESTIONNAIRE_URL ?? "fhir"}
            terminologyUrl={process.env.REACT_APP_FHIR_URL ?? "fhir"}
            questionnaireUrl={questionnaireUrl}
            contextSelection={{
              enabled: contextResourceTypes.length > 0,
              title: "Sélectionner un contexte",
              displayMode: "modal",
              resourceTypes: contextResourceTypes,
            }}
            populateOnContextSelection={true}
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
