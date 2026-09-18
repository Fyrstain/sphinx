import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

jest.mock("./services/UserService", () => ({
  __esModule: true,
  default: {
    doLogin: jest.fn(),
    doLogout: jest.fn(),
    getUsername: jest.fn(),
    isAuthenticated: jest.fn(() => false),
  },
}));

jest.mock("@fyrstain/hl7-front-library", () => ({
  Page: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
  Title: ({ prefix, content }: { prefix: string; content: string }) => (
    <h1>{`${prefix} ${content}`}</h1>
  ),
}));

jest.mock("react-i18next", () => ({
  initReactI18next: { init: jest.fn(), type: "3rdParty" },
  useTranslation: () => ({ t: (key: string) => key }),
}));

test("renders the home page", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole("heading", { name: "Sphinx Questionnaires" }),
  ).toBeInTheDocument();
});
