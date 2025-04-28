// React
import { FunctionComponent } from "react";
// StructureMap
import { Title } from "@fyrstain/hl7-front-library";
// Components
import SphinxPage from "../../components/SphinxPage/SphinxPage";
// Styles
import "./Home.css";

const Home: FunctionComponent = () => {

    //////////////////////////////
    //          Content         //
    //////////////////////////////

    return (
        <SphinxPage loading={false} fitFooter={true} needsLogin={false}>
            <>
                <div className='h-100 d-flex justify-content-center align-items-center flex-md-row flex-column gap-3'>
                    <div>
                        <img
                            className='home-image-icon'
                            alt='Home_image'
                            src={(process.env.PUBLIC_URL ?? '') + '/assets/home.png'}
                        />
                    </div>
                    <div>
                        <Title
                            level={1}
                            prefix='Sphinx'
                            content='Structure Maps & Questionnaires'
                        />
                    </div>
                </div>
            </>
        </SphinxPage>
    );
};

export default Home;
