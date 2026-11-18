# FHIR R5 searches and questionnaire operations

Sphinx uses separate configurable FHIR repository and questionnaire-operation endpoints. This is a list of client demands, not a declaration that they work with every deployment.

| Resource | Request | Purpose |
| --- | --- | --- |
| Questionnaire | Search `title:contains` and `status`; request `_elements=id,title,status`, `_sort=-_lastUpdated` | Questionnaire discovery list. |
| Questionnaire | Read `Questionnaire/{id}` | Load a selected form. |
| Questionnaire | Search `url` and optional `version` | Resolve canonical references. |
| QuestionnaireResponse | Read by id | Review an existing response. |
| Questionnaire | POST `Questionnaire/$populate` with `Parameters` (`questionnaire`, `subject`) | Obtain a prefilled QuestionnaireResponse from the configured engine. |
| QuestionnaireResponse | POST `QuestionnaireResponse/$extract` with `Parameters` (`questionnaire-response`) | Obtain a Bundle from the configured engine. |

The Questionnaire service also contains a create helper. A helper is not itself evidence of a questionnaire-design UI. The extracted Bundle is normalized before submission in the response service: some PUT requests are converted to POST and Organization subject references may be replaced by identifiers. This needs scenario-level testing because it changes transaction semantics.

A separate CDS Hooks HTTP endpoint can respond to research eligibility checks; it is not a FHIR operation on the repository.

## Validation

Confirm that the deployment supports the SDC operations and their specific parameter profiles, that the two base URLs are configured correctly, and that authorization and write validation are enforced server-side.
