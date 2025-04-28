// React
import { FunctionComponent } from "react";
// Components
import SphinxPage from "../../components/SphinxPage/SphinxPage";
// Styles
import "../Home/Home.css";
// Fhir front library
import { Title } from "@fyrstain/hl7-front-library";
// Translation
import i18n from "i18next";

const InProgress: FunctionComponent = () => {

    //////////////////////////////
    //          Content         //
    //////////////////////////////

    return (
        <SphinxPage loading={false} fitFooter={true} needsLogin={false}>
            <div className='h-100 d-flex justify-content-center align-items-center flex-md-row flex-column gap-3'>
                <div>
                    <img
                        className='home-image-icon'
                        src={(process.env.PUBLIC_URL ?? '') + '/assets/InProgress.png'}
                        alt="Oops !"
                    />
                </div>
                <div>
                    <Title
                        level={1}
                        prefix={i18n.t('title.inprogress.wip')}
                        content={i18n.t('title.inprogress.comingsoon')}
                    />
                </div>
            </div>
        </SphinxPage>
    );
};

export default InProgress;