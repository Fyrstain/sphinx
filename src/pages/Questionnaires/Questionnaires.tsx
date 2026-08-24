// Font awesome
import { faCheckSquare } from "@fortawesome/free-solid-svg-icons";
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

const Questionnaires: FunctionComponent = () => {
  //////////////////////////////
  //        Navigation        //
  //////////////////////////////

  const navigate = useNavigate();

  //   const onDetails = useCallback(
  //     (id: string) => {
  //       navigate("/EditQuestionnaire/" + id);
  //     },
  //     [navigate]
  //   );

  const onNewResponse = useCallback(
    (id: string) => {
      navigate("/Questionnaire/" + id + "/new");
    },
    [navigate],
  );

  //////////////////////////////
  //           Error          //
  //////////////////////////////

  const onError = useCallback((error?: unknown) => {
    navigate("/Error", { state: { error } });
  }, [navigate]);

  //////////////////////////////
  //          Content         //
  //////////////////////////////

  return (
    <SphinxPage titleKey="Questionnaires" needsLogin={true}>
      <SearchableTable
        searchCriteriaProperties={{
          title: i18n.t("title.searchcriteria"),
          submitButtonLabel: i18n.t("button.search"),
          resetButtonLabel: i18n.t("button.reset"),
          language: i18n.t,
          fixedParameters: {
            _elements: "id,title,status",
            _sort: "-_lastUpdated",
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
                return <StatusTag flavor={FhirStatus[cell]} message={cell} />;
              },
            },
          ],
          action: [
            {
              icon: faCheckSquare,
              onClick: onNewResponse,
            },
          ],
          mapResourceToData: (resource: any) => {
            return {
              id: resource.id,
              Name: resource.title,
              Status: resource.status,
            };
          },
          searchProperties: {
            serverUrl: process.env.REACT_APP_FHIR_URL ?? "fhir",
            resourceType: "Questionnaire",
          },
          onError: onError,
        }}
      />
    </SphinxPage>
  );
};

export default Questionnaires;
