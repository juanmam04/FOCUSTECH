import './InteractiveBackground.css';

/** Fondo con manchas suaves — solo CSS, respeta tema y reduced-motion */
export default function InteractiveBackground() {
  return (
    <div className="interactive-bg" aria-hidden>
      <div className="interactive-bg__blob interactive-bg__blob--1" />
      <div className="interactive-bg__blob interactive-bg__blob--2" />
      <div className="interactive-bg__blob interactive-bg__blob--3" />
    </div>
  );
}
