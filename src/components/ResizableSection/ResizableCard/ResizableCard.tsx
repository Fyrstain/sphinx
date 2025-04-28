// React
import { FunctionComponent, MutableRefObject } from "react";
// Fhir Front Library
import { Title } from "@fyrstain/hl7-front-library";
// Components
import LoadingButton, {LoadingButtonProps} from "../../LoadingButton/LoadingButton";
import ResizableBar, { ResizerBarProps } from "../ResizerBar/ResizerBar";
// React Bootstrap
import { Card } from "react-bootstrap";
// Styles
import styles from "./ResizableCard.module.css";

////////////////////////////////
//           Props            //
////////////////////////////////

export interface ResizableCardProps {
  // The flex value of the card
  cardFlex: { flex: number } | undefined;
  // The reference to the card size
  cardRef: MutableRefObject<HTMLDivElement | null> | undefined;
  // The title of the card
  cardTitle: string;
  // Props for the loading buttons on the header of the card
  loadingButtonConfig?: Array<LoadingButtonProps>;
  // The content inside the card body
  cardBodyChildren: React.ReactNode;
  // If the resizer bar is needed
  showResizerBar?: boolean;
  // Props for the resizer bar
  resizerBarConfig?: ResizerBarProps;
}

const ResizableCard: FunctionComponent<ResizableCardProps> = ({
  cardFlex,
  cardRef,
  cardTitle,
  loadingButtonConfig,
  cardBodyChildren,
  showResizerBar,
  resizerBarConfig,
}) => {
    
  //////////////////////////////
  //          Content         //
  //////////////////////////////

  return (
    <div
      className={styles.resizableCard}
      style={{
        flex: cardFlex?.flex,
      }}
      ref={cardRef}
    >
      <Card className={styles.card}>
        <Card.Header className={styles.cardHeaderNoWrap}>
          <Title
            level={2}
            content={cardTitle}
            className={styles.textTruncate}
          />
          <div className={styles.buttonHeaderCard}>
            {loadingButtonConfig &&
              loadingButtonConfig.map((config, index) => (
                <LoadingButton 
                    key={index} 
                    {...config} 
                />
              ))}
          </div>
        </Card.Header>
        <div>
          <Card.Body>{cardBodyChildren}</Card.Body>
        </div>
      </Card>
      {showResizerBar && resizerBarConfig && (
        <ResizableBar {...resizerBarConfig} />
      )}
    </div>
  );
};

export default ResizableCard;
