import { Link } from "react-router-dom";
export default function NotFound() {
  return <div className="page-shell not-found"><div className="eyebrow">404 · OFF THE MAP</div><h1>This page is<br/><em>not on this route.</em></h1><Link className="button button-dark" to="/">Return home</Link></div>;
}
