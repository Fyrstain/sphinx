// React
import { FunctionComponent } from "react";
// React BootStrap
import { OverlayTrigger, Tooltip } from "react-bootstrap";

////////////////////////////////
//           Props            //
////////////////////////////////

export interface TooltipWrapperProps {
  // The id of the tooltip, needed for the overlay
  id: string;
  // The text to be displayed in the tooltip
  text?: string;
  // The children to be wrapped with the tooltip
  children: any;
}

const TooltipWrapper: FunctionComponent<TooltipWrapperProps> = ({
  id,
  text,
  children,
}) => {
  //////////////////////////////
  //          Content         //
  //////////////////////////////

  return (
    <OverlayTrigger overlay={<Tooltip id={id}>{text}</Tooltip>}>
      {children}
    </OverlayTrigger>
  );
};

export default TooltipWrapper;
