import { Link } from "react-router-dom";
import "./UnknownRoute.scss";

export const UnknownRoute = () => {
  return (
    <div className="unknown-wrapper">
      <div className="unknown-container">
        <h1 className="unknown_title">404</h1>

        <p className="unknown_desc">
          Unfortunately, we could not find the route that you were looking for.{" "}
          <Link to="/">Return to the home page?</Link>
        </p>
      </div>
    </div>
  );
};
