import { FunctionComponent } from "react";
import { InProgressPage, Title } from "@fyrstain/hl7-front-library";
import i18n from "i18next";
import SphinxPage from "../../components/SphinxPage/SphinxPage";

const InProgress: FunctionComponent = () => (
  <SphinxPage loading={false} fitFooter={true} needsLogin={false}>
    <InProgressPage
      heading={<Title level={1} prefix={i18n.t("status.inProgress.prefix", { defaultValue: "Work in progress!" })} content={i18n.t("status.inProgress.content", { defaultValue: "Coming soon..." })} />}
      illustration={<img src={(process.env.PUBLIC_URL ?? "") + "/assets/InProgress.png"} alt="" />}
    />
  </SphinxPage>
);

export default InProgress;
