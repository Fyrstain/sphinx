// React
import { FunctionComponent } from "react";
// Styles
import "../Home/Home.css";
// Fhir Front Library
import { Title } from "@fyrstain/hl7-front-library";
// Components
import SphinxPage from "../../components/SphinxPage/SphinxPage";
// Translation
import i18n from "i18next";

const Error: FunctionComponent = () => {

    //////////////////////////////
    //          Content         //
    //////////////////////////////

    return (
        <SphinxPage loading={false} fitFooter={true} needsLogin={false}>
            <div className='h-100 d-flex justify-content-center align-items-center flex-md-row flex-column gap-3'>
                <div>
                    <img
                        className='home-image-icon'
                        src={(process.env.PUBLIC_URL ?? '') + '/assets/oops.png'}
                        alt="Oops !"
                    />
                </div>
                <div>
                    <Title
                        level={1}
                        prefix={i18n.t('title.error.oops')}
                        content={i18n.t('title.error.problem')}
                    />
                </div>
            </div>
        </SphinxPage>
    );
};

export default Error;
