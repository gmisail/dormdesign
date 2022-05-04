import { ReactComponent as GridSVG } from "../../assets/grid.svg";

const GridBackground = () => (
  <GridSVG
    style={{
      position: "fixed",
      width: "100vw",
      height: "100vh",
      left: 0,
      top: 0,
      zIndex: -10,
      opacity: "20%",
    }}
  />
);
export default GridBackground;
