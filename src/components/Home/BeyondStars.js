import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import portrait from "../../Assets/me.png";
import skills from "../../data/skills.json";
import education from "../../data/education";
import settings from "../../data/settings.json";
import "./BeyondStars.css";

const instrumentGroups = [
  { title: "Interfaces", ids: ["javascript", "typescript", "react", "nextjs"] },
  { title: "Systems", ids: ["nodejs", "python", "java", "csharp"] },
  { title: "Data", ids: ["mysql", "postgresql", "mongodb"] },
  { title: "Practice", ids: ["git"] },
];

export function instrumentsFor(ids) {
  return ids.map(id => skills.technologies.find(skill => skill.id === id)).filter(Boolean);
}

export default function BeyondStars() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const items = [...section.querySelectorAll("[data-reveal]")];
    if (typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    section.classList.add("beyond-stars--animate");
    items.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="beyond-stars" id="about" aria-labelledby="beyond-stars-title">
      <div className="beyond-stars-heading" data-reveal>
        <p className="beyond-stars-eyebrow">The person behind the pixels / 02</p>
        <h2 id="beyond-stars-title">Beyond the <em>stars.</em></h2>
        <p>A little about the person building this universe.</p>
      </div>

      <div className="beyond-stars-story">
        <div className="beyond-stars-portrait-column">
          <figure className="beyond-stars-portrait" data-reveal>
            <span className="beyond-stars-sheet beyond-stars-sheet--one" aria-hidden="true" />
            <span className="beyond-stars-sheet beyond-stars-sheet--two" aria-hidden="true" />
            <img src={portrait} alt="Kasi Nathan Murugan" />
            <figcaption><span>Portrait / Kasi Nathan Murugan</span><span>Based in Germany</span></figcaption>
          </figure>
        </div>
        <div className="beyond-stars-timeline">
          <article className="beyond-stars-entry" data-reveal>
            <span className="beyond-stars-entry-index">01 / Foundation</span>
            <h3>Curiosity became a way of building.</h3>
            <p>I earned a {education.bachelors.degree} at {education.bachelors.institution}, building a foundation in software development. The work drew me toward clear interfaces and practical systems that people can actually use.</p>
          </article>
          <article className="beyond-stars-entry" data-reveal>
            <span className="beyond-stars-entry-index">02 / Perspective</span>
            <h3>Technology meets the human question.</h3>
            <p>At {education.masters.institution}, I’m pursuing an {education.masters.degree}. Studying both disciplines helps me ask what a system should do, how it should behave, and whom it should serve.</p>
          </article>
          <article className="beyond-stars-entry" data-reveal>
            <span className="beyond-stars-entry-index">03 / What’s next</span>
            <h3>Thoughtful software, felt in the details.</h3>
            <p>I’m interested in AI, software engineering, and interactive experiences. I enjoy turning complex ideas into approachable products, from AI-assisted workflows to responsive interfaces with a sense of motion and place.</p>
          </article>
          <div className="beyond-stars-actions" data-reveal>
            <Link to="/project">Explore my work <span aria-hidden="true">↗</span></Link>
            <a href={settings.resumeUrl} target="_blank" rel="noreferrer">Resume <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </div>

      <div className="beyond-stars-instruments" aria-labelledby="instruments-title">
        <div className="beyond-stars-instruments-heading" data-reveal>
          <span className="beyond-stars-eyebrow">The toolkit</span>
          <h3 id="instruments-title">Instruments.</h3>
          <p>Tools for shaping useful ideas into working experiences.</p>
        </div>
        <div className="beyond-stars-groups">
          {instrumentGroups.map(group => (
            <div className="beyond-stars-group" data-reveal key={group.title}>
              <h4>{group.title}</h4>
              <ul>{instrumentsFor(group.ids).map(skill => <li key={skill.id}>{skill.name}</li>)}</ul>
            </div>
          ))}
          <div className="beyond-stars-group" data-reveal>
            <h4>Workflow</h4>
            <ul>{skills.tools.map(tool => <li key={tool.id}>{tool.name}</li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  );
}
