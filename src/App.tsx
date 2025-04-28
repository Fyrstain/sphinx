// Day js
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
// Translation
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next, useTranslation } from "react-i18next";
// React
import { useEffect } from "react";
// React router dom
import {
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
// Pages
import Home from "./pages/Home/Home";
import Questionnaires from "./pages/Questionnaires/Questionnaires";
import Error from "./pages/Error/Error";
import InProgress from "./pages/InProgress/InProgress";
import QuestionnaireResponseFiller from "./pages/QuestionnaireResponse/QuestionnaireResponse";

require("dayjs/locale/fr");

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["fr", "en"],
    backend: {
      loadPath: `${process.env.PUBLIC_URL}/locales/{{lng}}/{{ns}}.json`,
    }
  });

dayjs.extend(relativeTime);
dayjs.locale(i18n.language);

function App() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;

  useTranslation();

  useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [action, pathname]);

  useEffect(() => {
    let title = "";
    let metaDescription = "";

    switch (pathname) {
        case "/":
        case "/Sphinx":
        case "/Home":
        case "/Sphinx/Home":
            title = "Home page";
            metaDescription = "";
            break;
        case "/Error":
            title = "Oops !";
            metaDescription = "";
            break;
        case "/InProgress":
            title = "Coming Soon";
            metaDescription = "";
            break;
        case "/Questionnaires":
            title = "Questionnaires";
            metaDescription = "";
            break;
        case "/Questionnaire/:questionnaireId/new":
            title = "Questionnaire Response";
            metaDescription = "";
            break;
    }

    if (title) {
      document.title = title;
    }

    if (metaDescription) {
      const metaDescriptionTag: HTMLMetaElement | null = document.querySelector(
        'head > meta[name="description"]'
      );
      if (metaDescriptionTag) {
        metaDescriptionTag.content = metaDescription;
      }
    }
  }, [pathname]);

  return (
    <Routes>
        <Route index element={<Home />} />
        <Route
            path="/"
            element={<Home />}
        />
        <Route
            path="/Home"
            element={<Home />}
        />
        <Route
            path="/Sphinx"
            element={<Home />}
        />
        <Route
            path="/Sphinx/Home"
            element={<Home />}
        />
        <Route
            path="/Questionnaires"
            element={<Questionnaires />}
        />
        <Route
            path="/Questionnaire/:questionnaireId/new"
            element={<QuestionnaireResponseFiller />}
        />
        <Route
            path="/Error"
            element={<Error />}
        />
        <Route
            path="/InProgress"
            element={<InProgress />}
        />
    </Routes>
  );
}

export default App;
