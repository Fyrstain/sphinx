// React
import { FunctionComponent } from "react";
// Components
import TooltipCustom from "../TooltipWrapper/TooltipWrapper";
// React BootStrap
import { Spinner } from "react-bootstrap";
// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// Translation
import i18n from "i18next";

////////////////////////////////
//           Props            //
////////////////////////////////

export interface LoadingButtonProps {
  // The function to be triggered when the button is clicked
  onClick?: any;
  // The boolean to show the spinner when the button is loading
  isLoading?: boolean;
  // The icon of the button
  icon: any;
  // The boolean to disable the button
  isDisabled?: boolean;
  // The text of the tooltip when the button is disabled
  disabledTooltipText?: string;
  // The text of the tooltip when the button is enabled
  enabledTooltipText?: string;
  // The name of the operation to be shown in the tooltip
  operationName?: string;
  // The class will be different if the button is on the Output card
  isOutput?: boolean;
}

const LoadingButton: FunctionComponent<LoadingButtonProps> = ({
  onClick,
  isLoading,
  icon,
  isDisabled,
  disabledTooltipText,
  enabledTooltipText,
  operationName,
  isOutput,
}) => {
  /////////////////////////////////////
  //      Constants / ValueSet       //
  /////////////////////////////////////

  // A tooltip with text for an enabled button using an operation ($populate / $validate etc)
  const tooltipTextWithOperation = operationName
    ? `${enabledTooltipText} ${operationName}`
    : enabledTooltipText;

  //////////////////////////////
  //          Content         //
  //////////////////////////////

  return (
    <div onClick={!isDisabled ? onClick : undefined}>
      {isLoading ? (
        // To show the spinner when isLoading is true
        <Spinner
          animation="border"
          role="status"
          className={
            isOutput ? "spinnerPlayLoading" : "spinnerPlayLoadingOutput"
          }
        >
          <span className="visually-hidden">{i18n.t("text.loading")}</span>
        </Spinner>
      ) : (
        // To see a tooltip dynamic text if the button is disabled or enabled
        <TooltipCustom
          id="tooltipLoadingButton"
          text={isDisabled ? disabledTooltipText : tooltipTextWithOperation}
        >
          <FontAwesomeIcon
            icon={icon}
            size="2x"
            className={isDisabled ? "buttonIconDisabled" : "actionIcon"}
          />
        </TooltipCustom>
      )}
    </div>
  );
};

export default LoadingButton;
