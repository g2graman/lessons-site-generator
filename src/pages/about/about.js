import React from "react";
import { getRouteProps } from "react-static";

import "./about.css";

export default getRouteProps(({ licenses }) => (
  <div>
    <p>What is Bridge?</p>
    <blockquote>
      Bridge brings together people who believe that we can and should remove
      barriers preventing members of marginalized groups from participating
      fully and equally in the technology industry. We do this by skilling up
      and supporting women via a free-for-students, 11 week front-end
      development course in Toronto. In small classes, and through hands-on
      project-based work, we improve junior developer’s technical skills and
      greatly increase their confidence. We leverage the desire of more advanced
      developers to instruct, providing a way to improve their soft skills
      through teaching and mentorship. If your question is: “How do I foster a
      more diverse team?” Bridge is the answer.
    </blockquote>
    <p
      style={{
        marginBottom: "25%",
        textAlign: "center"
      }}
    >
      Visit <a href="//bridgeschool.io">bridgeschool.io</a> for more, or contact{" "}
      <a href="mailto://hello@bridgeschool.io">hello@bridgeschool.io</a> with
      questions.
    </p>
    <div dangerouslySetInnerHTML={{ __html: licenses.content }} />
    <div>
      (This website and the project behind producing it are also licensed under
      a Creative Commons Attribution 4.0 International License)
    </div>
  </div>
));
