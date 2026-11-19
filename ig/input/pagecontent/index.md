# Sphinx Implementation Guide

## Context 

Sphinx is a FHIR R5-based web application.
Sphinx is a software that display a list a questionnaires and allow users to fill them up

## How to read this Implementation Guide (IG) 

 - **[Home](index.html)**: The home page provides the introduction and context for this implementation guide. 

 - **FHIR Artifacts**: 
    - **[Artifacts](artifacts.html)**: These pages provide detailed descriptions and formal definitions for all FHIR objects defined in this guide.

## Implemented questionnaire journeys

Sphinx is an authenticated questionnaire runner using **FHIR R5** types. Its router provides a Questionnaire list (`/Questionnaires`), a new response form (`/Questionnaire/:questionnaireId/new`), the response list (`/QuestionnairesResponses`), and a response viewer (`/EditQuestionnaire/:questionnaireResponseId`).

| Capability | Observable client integration |
| --- | --- |
| Questionnaire discovery | Search by `title:contains` and `status`; request `_elements=id,title,status` and `_sort=-_lastUpdated`. |
| Questionnaire read | Read by resource id; canonical lookup searches `Questionnaire?url=...` with optional `version`. |
| Response read | Read `QuestionnaireResponse`; if needed, resolve its Questionnaire by canonical URL and version. |
| Population | POST `Questionnaire/$populate` with `Parameters` containing `questionnaire` and `subject`; service base URL may differ from the FHIR repository. |
| Extraction | POST `QuestionnaireResponse/$extract` with the response resource in `Parameters`; preparation for submission converts certain extracted PUT entries to POST requests. |

Sphinx's `QuestionnaireService` also exposes a create helper, which must not be confused with a questionnaire-authoring screen. The CDS Hooks research eligibility client is a separate external HTTP integration, not an operation implemented by the local FHIR repository.

### Verification points

Configure `REACT_APP_FHIR_URL`, `REACT_APP_QUESTIONNAIRE_URL`, authentication and any optional CDS Hooks endpoint. Evaluate the current support for the SDC operations on the deployed questionnaire engine, verify persistence of extracted resources and assess bundle normalization against the target server. The presence of example artifacts is not proof of support for all questionnaire extraction cases.
