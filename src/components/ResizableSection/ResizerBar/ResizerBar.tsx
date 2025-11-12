// React
import { FunctionComponent, MutableRefObject } from "react";
// Styles
import styles from "./ResizerBar.module.css";

////////////////////////////////
//           Props            //
////////////////////////////////

export interface ResizerBarProps {
  // The reference with all the cards to be resized, it's the total width
  containerWidthRef: MutableRefObject<HTMLDivElement | null>;
  // The reference of the left card to get the current size
  leftRef: MutableRefObject<HTMLDivElement | null>;
  // The reference of the right card to get the current size
  rightRef: MutableRefObject<HTMLDivElement | null>;
  // The function to update the flex variable of the left card
  setLeftFlex: (newSize: { flex: number }) => void;
  // The function to update the flex variable of the right card
  setRightFlex: (newSize: { flex: number }) => void;
}

const ResizableBar: FunctionComponent<ResizerBarProps> = ({
  containerWidthRef,
  leftRef,
  rightRef,
  setLeftFlex,
  setRightFlex,
}) => {
  ////////////////////////////////
  //           Actions          //
  ////////////////////////////////

  /**
   * Function to resize the cards using a resizer bar
   * It calculates the new size, checking the minimum size and adjusts the flex-glow values
   * @param leftRef is the current size of the left card
   * @param rightRef is the current size of the right card
   * @param setLeftFlex can update the flew-grow value of the left card
   * @param setRightFlex can update the flew-grow value of the right card
   * @returns a function that is triggered by the `onMouseDown` event to start the resizing process
   */
  const handleResize =
    (
      leftRef: MutableRefObject<HTMLDivElement | null>,
      rightRef: MutableRefObject<HTMLDivElement | null>,
      setLeftFlex: (newSize: { flex: number }) => void,
      setRightFlex: (newSize: { flex: number }) => void,
    ) =>
    (mouseDownEvent: React.MouseEvent) => {
      // To stop the selection during the resizing
      document.body.classList.add(styles.noSelectWhenResizing);
      // Get the current size of the card
      let leftSize = leftRef.current?.offsetWidth ?? 0;
      let rightSize = rightRef.current?.offsetWidth ?? 0;
      // Get the total size of the card
      const sizeSum = +leftSize + +rightSize;
      // Get the current flex-grow value of the cards
      const leftFlex = leftRef.current?.style.flexGrow ?? 1;
      const rightFlex = rightRef.current?.style.flexGrow ?? 1;
      // Get the total flex-grow value of the cards
      const flexSum: number = Number(leftFlex) + Number(rightFlex);
      // Get the initial position of the mouse
      const startPosition = { width: mouseDownEvent.pageX };

      function onMouseMove(mouseMoveEvent: MouseEvent) {
        // Get the current position of the mouse
        let currentPosition = mouseMoveEvent.pageX;
        // Calculate the distance between the initial and current position
        let distance = startPosition.width - currentPosition;
        // Update the new size of the cards
        let newLeftSize = leftSize - distance;
        let newRightSize = rightSize + distance;
        // Set the minimum size of the cards
        const MIN_SIZE = 0.22 * (containerWidthRef.current?.offsetWidth ?? 0);
        // Check if the new size is less than the minimum size
        if (newLeftSize <= MIN_SIZE) {
          newRightSize += newLeftSize - MIN_SIZE;
          newLeftSize = MIN_SIZE;
        }
        if (newRightSize <= MIN_SIZE) {
          newLeftSize += newRightSize - MIN_SIZE;
          newRightSize = MIN_SIZE;
        }
        // Update the flex-grow value of the cards
        let leftFlexNew = flexSum * (newLeftSize / sizeSum);
        let rightFlexNew = flexSum * (newRightSize / sizeSum);
        // Update the size of the cards
        setLeftFlex({
          flex: leftFlexNew,
        });
        setRightFlex({
          flex: rightFlexNew,
        });
      }
      function onMouseUp() {
        document.body.removeEventListener("mousemove", onMouseMove);
        document.body.removeEventListener("mouseup", onMouseUp);
        // The selection is possible again
        document.body.classList.remove(styles.noSelectWhenResizing);
      }
      document.body.addEventListener("mousemove", onMouseMove);
      document.body.addEventListener("mouseup", onMouseUp, { once: true });
    };

  //////////////////////////////
  //          Content         //
  //////////////////////////////

  return (
    <div
      className={styles.resizerBar}
      onMouseDown={handleResize(leftRef, rightRef, setLeftFlex, setRightFlex)}
    ></div>
  );
};

export default ResizableBar;
