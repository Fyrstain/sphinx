// Font awesome
import { faPlay, faPen, faCheckSquare } from "@fortawesome/free-solid-svg-icons";
// Fhir front library
import {
  FhirStatus,
  SearchableTable,
  StatusTag,
} from "@fyrstain/hl7-front-library";
// Translation
import i18n from "i18next";
// React
import { FunctionComponent, useCallback } from "react";
// Navigation
import { useNavigate } from "react-router-dom";
// Components
import SphinxPage from "../../components/SphinxPage/SphinxPage";
import UserService from "../../services/UserService";

const QuestionnairesResponses: FunctionComponent = () => {
    
  //////////////////////////////
  //        Navigation        //
  //////////////////////////////

  const navigate = useNavigate();

  const onDetails = useCallback(
    (id: string) => {
    navigate("/EditQuestionnaire/" + id);
    },
    [navigate]
  );



  //////////////////////////////
  //           Error          //
  //////////////////////////////

  const onError = useCallback(() => {
    navigate("/Error");
  }, [navigate]);

  //////////////////////////////
  //          Content         //
  //////////////////////////////

  return (
    <SphinxPage titleKey="QuestionnairesResponses" needsLogin={true}>
      <SearchableTable
        searchCriteriaProperties={{
          title: i18n.t("title.searchcriteria"),
          submitButtonLabel: i18n.t("button.search"),
          resetButtonLabel: i18n.t("button.reset"),
          language: i18n.t,
          fixedParameters: {
            _sort: "-_lastUpdated",
            "author-identifier": UserService.getEmail()
          },
          inputs: [
            {
              label: i18n.t("label.name"),
              type: "text",
              searchParamsName: "title:contains",
            },
            {
              label: i18n.t("label.status"),
              type: "select",
              options: [
                { value: "draft", label: i18n.t("label.draft") },
                { value: "active", label: i18n.t("label.active") },
                { value: "retired", label: i18n.t("label.retired") },
                { value: "unknown", label: i18n.t("label.unknown") },
              ],
              searchParamsName: "status",
            },
          ],
        }}
        paginatedTableProperties={{
          columns: [
            {
              header: i18n.t("label.name"),
              dataField: "Name",
              width: "40%",
            },
            {
              header: i18n.t("label.status"),
              dataField: "Status",
              width: "20%",
              formatter: (cell: keyof typeof FhirStatus) => {
                return (
                  <StatusTag flavor={FhirStatus[cell]} message={cell} />
                );
              },
            },
          ],
          action: [
            {
              icon: faCheckSquare,
              onClick: onDetails,
            },
          ],
          mapResourceToData: (resource: any) => {
            const name = ((resource.contained && resource.contained[0].title) ? resource.contained[0].title : resource.questionnaire) ?? "";
            return {
              id: resource.id,
              Name: name,
              Status: resource.status,
            };
          },
          searchProperties: {
            serverUrl: process.env.REACT_APP_FHIR_URL ?? "fhir",
            resourceType: "QuestionnaireResponse",
          },
          onError: onError,
        }}
      />
    </SphinxPage>
  );
};

export default QuestionnairesResponses;