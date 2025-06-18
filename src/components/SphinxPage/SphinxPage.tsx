// React
import { FunctionComponent, JSXElementConstructor, ReactElement } from "react";
// Components
import { Page, PageConfiguration } from "@fyrstain/hl7-front-library";
// Translation
import i18n from "i18next";
// Authentication
import UserService from "../../services/UserService";

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
  //           METHODS           //
  /////////////////////////////////

  const handleLangChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(event.target.value);
  };

  const fullConfig: PageConfiguration = {
    // Translation
    language: i18n.t,
    navigationBarConfigs: {
      // applicationItems: [
      //     {
      //         logoLink: 'https://integ.fyrstain.com/assets/ApplicationsLogos/Pandora.png',
      //         link: 'https://integ.fyrstain.com/Pandora/Home',
      //         alt: 'Pandora logo'
      //     }
      // ],
      // Application logo
      logoLink: (process.env.PUBLIC_URL ?? "") + "/assets/SphinxLogo.png",
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
          link: (process.env.PUBLIC_URL ?? "") + "/Questionnaires",
        },
        {
          title: "RESPONSES",
          link: (process.env.PUBLIC_URL ?? "") + "/QuestionnairesResponses",
        },
      ],
      // the user items
      // Admin, Login, Logout are the default items
      dropDownItems: [
        {
          title: "Admin",
          link: (process.env.PUBLIC_URL ?? "") + "/InProgress",
        },
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
        ...(process.env.REACT_APP_CLIENT_LOGO
          ? [
              {
                logoLink: process.env.REACT_APP_CLIENT_LOGO,
                alt: "Horizontal logo type",
                link: process.env.REACT_APP_CLIENT_LOGO_LINK ?? "/",
              },
            ]
          : [
              {
                logoLink:
                  "https://fyrstain.com/wp-content/uploads/2022/10/Logo_fyrstain_horyzontal.svg",
                alt: "Horizontal logo type",
                link: "https://fyrstain.com",
              },
            ]),
      ],
      items: [
        {
          label: i18n.t("footer.items.about"),
          link: (process.env.PUBLIC_URL ?? "") + "/InProgress",
        },
        {
          label: i18n.t("footer.items.contact"),
          link: (process.env.PUBLIC_URL ?? "") + "/InProgress",
        },
        {
          label: i18n.t("footer.items.problemtracking"),
          link: (process.env.PUBLIC_URL ?? "") + "/InProgress",
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
