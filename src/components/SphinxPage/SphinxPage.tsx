// React
import {
    FunctionComponent,
    JSXElementConstructor,
    ReactElement,
    useCallback,
} from "react";
// Components
import { Page, PageConfiguration } from "@fyrstain/hl7-front-library";
// Translation
import i18n from "i18next";
// Authentication
import UserService from "../../services/UserService";
// Navigation
import { useNavigate } from "react-router-dom";

const SphinxPage: FunctionComponent<{
    // The title of the page
    titleKey?: string;
    // The loading state of the page
    loading?: boolean;
    // The content of the page
    children?: ReactElement<any, string | JSXElementConstructor<any>> | undefined;
    // Fit the footer to the bottom of the page
    fitFooter?: boolean;
    // If the page needs login or not
    needsLogin: boolean;
}> = (props) => {

    /////////////////////////////////
    //        NAVIGATION           //
    /////////////////////////////////

    const navigate = useNavigate();

    /////////////////////////////////
    //           METHODS           //
    /////////////////////////////////

    const handleLangChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        i18n.changeLanguage(event.target.value);
    };

    const fullConfig: PageConfiguration = {
        // Translation
        language: i18n.t,
        navigationBarConfigs: {
            applicationItems: [
                {
                    logoLink: 'https://integ.fyrstain.com/assets/ApplicationsLogos/Pandora.png',
                    link: 'https://integ.fyrstain.com/Pandora/Home',
                    alt: 'Pandora logo'
                }
            ],
            // Application logo
            logoLink: (process.env.PUBLIC_URL ?? '') + "/assets/Sphinxlogo.png",
            alt: "Sphinx Logo",
            // Authentication
            authentication: {
              doLogin: UserService.doLogin,
              doLogout: UserService.doLogout,
              isAuthenticated: () => UserService.isAuthenticated() || false,
              getUserName: () => UserService.getUsername(),
            },
            // the menu items with their subItems who contains the navigation to the differents pages
            menuItems: [
                {
                    title: "QUESTIONNAIRES",
                    link: (process.env.PUBLIC_URL ?? '') + "/Questionnaires",
                },
            ],
            // the user items
            // Admin, Login, Logout are the default items
            dropDownItems: [
                {
                    title: 'Admin',
                    link: (process.env.PUBLIC_URL ?? '') + "/InProgress"
                }
            ],
        },
        // the title of the page
        titleKey: props.titleKey,
        // the loading state of the page
        loading: props.loading,
        // the content of the page
        children: props.children,
        // if the page needs login or not
        needsLogin: props.needsLogin,
        isAuthenticated: () => UserService.isAuthenticated() || false,
        doLogin: UserService.doLogin,
        footerConfigs: {
            languages: {
                default: i18n.language,
                onChange: handleLangChange,
                options: [
                    {
                        label: "English",
                        value: "en",
                    },
                    {
                        label: "Français",
                        value: "fr",
                    },
                ],
            },
            logo: [
                {
                    logoLink: 'https://fyrstain.com/wp-content/uploads/2022/10/Logo_fyrstain_horyzontal.svg',
                    alt: "Horizontal logo type",
                    link: "https://fyrstain.com",
                },
                ...(process.env.REACT_APP_DISPLAY_CLIENT_LOGO === "true"
                    ? [
                        {
                            logoLink: (process.env.PUBLIC_URL ?? '') + "/assets/HL7-EU-Logo.jpg",
                            alt: "Horizontal logo type",
                            link: "https://hl7.eu",
                        },
                    ]
                    : []),
            ],
            items: [
                {
                    label: i18n.t("footer.items.about"),
                    link: (process.env.PUBLIC_URL ?? '') + "/InProgress",
                },
                {
                    label: i18n.t("footer.items.contact"),
                    link: (process.env.PUBLIC_URL ?? '') + "/InProgress",
                },
                {
                    label: i18n.t("footer.items.problemtracking"),
                    link: (process.env.PUBLIC_URL ?? '') + "/InProgress",
                },
            ],
        },
    };

    //////////////////////////////
    //          Content         //
    //////////////////////////////

    return <Page {...fullConfig} />;
};

export default SphinxPage;
