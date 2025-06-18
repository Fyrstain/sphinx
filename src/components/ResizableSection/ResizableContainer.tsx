// React
import { FunctionComponent, MutableRefObject } from "react";
// Styles
import styles from "./ResizableContainer.module.css";
// Components
import ResizableCard, {
  ResizableCardProps,
} from "./ResizableCard/ResizableCard";

////////////////////////////////
//           Props            //
////////////////////////////////

export interface ResizableContainerProps {
  // The reference with all the cards to be resized, it's the total width
  containerWidthRef: MutableRefObject<HTMLDivElement | null>;
  // The configuration for one or more cards to be resized
  cardConfig?: Array<ResizableCardProps>;
}

const ResizableContainer: FunctionComponent<ResizableContainerProps> = ({
  containerWidthRef,
  cardConfig,
}) => {
  //////////////////////////////
  //          Content         //
  //////////////////////////////

  return (
    <div className={styles.resizableContainer} ref={containerWidthRef}>
      {cardConfig?.map((config, index) => (
        <ResizableCard key={index} {...config} />
      ))}
    </div>
  );
};

export default ResizableContainer;
